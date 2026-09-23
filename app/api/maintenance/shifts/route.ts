import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireMaintenance, requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'

const clockInSchema = z.object({
  action: z.literal('clock_in'),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
})

const clockOutSchema = z.object({
  action: z.literal('clock_out'),
  notes: z.string().trim().max(4000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
})

const postSchema = z.discriminatedUnion('action', [
  clockInSchema,
  clockOutSchema,
  z.object({ action: z.literal('start_break') }),
  z.object({ action: z.literal('end_break') }),
])

const SHIFT_WITH_BREAKS = '*, breaks:maintenance_breaks (*)'

type ServerClient = ReturnType<typeof createServerClient>

/** End the shift's in-progress break (if any) at `atIso`, never before the break started. */
async function closeOpenBreak(supabase: ServerClient, shiftId: string, atIso: string) {
  const { data: open } = await supabase
    .from('maintenance_breaks')
    .select('*')
    .eq('shiftId', shiftId)
    .is('endAt', null)
    .maybeSingle()
  if (!open) return null

  const endAt =
    new Date(atIso).getTime() < new Date(open.startAt).getTime() ? open.startAt : atIso
  return supabase.from('maintenance_breaks').update({ endAt }).eq('id', open.id)
}

const editSchema = z
  .object({
    shiftId: z.string().uuid(),
    clockInAt: z.string().datetime({ offset: true }).optional(),
    clockOutAt: z.string().datetime({ offset: true }).optional(),
  })
  .refine((v) => v.clockInAt || v.clockOutAt, { message: 'Nothing to update' })

const MAX_SHIFT_MS = 24 * 60 * 60 * 1000

// GET - Maintenance: caller's own open shift + recent history.
//       Manager/Admin: all shifts clocked in on a given calendar date (defaults to today).
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    if (user.role === 'maintenance') {
      const { data: openShift } = await supabase
        .from('maintenance_shifts')
        .select(SHIFT_WITH_BREAKS)
        .eq('userId', user.id)
        .eq('status', 'open')
        .maybeSingle()

      const { data: recent } = await supabase
        .from('maintenance_shifts')
        .select(SHIFT_WITH_BREAKS)
        .eq('userId', user.id)
        .eq('status', 'closed')
        .order('clockInAt', { ascending: false })
        .limit(10)

      return NextResponse.json({ openShift: openShift ?? null, recent: recent ?? [] })
    }

    if (user.role !== 'manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    const dayStart = `${dateParam}T00:00:00.000Z`
    const dayEnd = `${dateParam}T23:59:59.999Z`

    const { data, error } = await supabase
      .from('maintenance_shifts')
      .select(`${SHIFT_WITH_BREAKS}, user:userId (id, name), editor:editedById (id, name)`)
      .gte('clockInAt', dayStart)
      .lte('clockInAt', dayEnd)
      .order('clockInAt', { ascending: true })

    if (error) {
      console.error('Error fetching maintenance shifts:', error)
      return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
    }

    return NextResponse.json({ date: dateParam, shifts: data ?? [] })
  } catch (error) {
    console.error('Error in GET /api/maintenance/shifts:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// POST - Clock in / clock out (maintenance role only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireMaintenance()
    const supabase = createServerClient()

    const body = await request.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { data: existingOpen } = await supabase
      .from('maintenance_shifts')
      .select('*')
      .eq('userId', user.id)
      .eq('status', 'open')
      .maybeSingle()

    if (parsed.data.action === 'clock_in') {
      if (existingOpen) {
        return NextResponse.json(
          { error: 'Already clocked in — clock out first' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('maintenance_shifts')
        .insert({
          userId: user.id,
          clockInAt: new Date().toISOString(),
          clockInLat: parsed.data.lat ?? null,
          clockInLng: parsed.data.lng ?? null,
          clockInAccuracy: parsed.data.accuracy ?? null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error clocking in:', error)
        return NextResponse.json({ error: 'Failed to clock in' }, { status: 500 })
      }

      return NextResponse.json({ shift: data }, { status: 201 })
    }

    if (!existingOpen) {
      return NextResponse.json({ error: 'Not currently clocked in' }, { status: 400 })
    }

    if (parsed.data.action === 'start_break') {
      const { error } = await supabase
        .from('maintenance_breaks')
        .insert({ shiftId: existingOpen.id, startAt: new Date().toISOString() })

      if (error) {
        // Unique partial index rejects a second in-progress break
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Already on a break' }, { status: 400 })
        }
        console.error('Error starting break:', error)
        return NextResponse.json({ error: 'Failed to start break' }, { status: 500 })
      }
      return NextResponse.json({ ok: true }, { status: 201 })
    }

    if (parsed.data.action === 'end_break') {
      const result = await closeOpenBreak(supabase, existingOpen.id, new Date().toISOString())
      if (!result) {
        return NextResponse.json({ error: 'Not currently on a break' }, { status: 400 })
      }
      if (result.error) {
        console.error('Error ending break:', result.error)
        return NextResponse.json({ error: 'Failed to end break' }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    // clock_out — clocking out while on break ends the break too
    const clockOutAt = new Date().toISOString()
    const breakResult = await closeOpenBreak(supabase, existingOpen.id, clockOutAt)
    if (breakResult?.error) {
      console.error('Error ending break on clock out:', breakResult.error)
      return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('maintenance_shifts')
      .update({
        clockOutAt,
        clockOutLat: parsed.data.lat ?? null,
        clockOutLng: parsed.data.lng ?? null,
        clockOutAccuracy: parsed.data.accuracy ?? null,
        notes: parsed.data.notes || null,
        photos: parsed.data.photos ?? [],
        status: 'closed',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existingOpen.id)
      .select()
      .single()

    if (error) {
      console.error('Error clocking out:', error)
      return NextResponse.json({ error: 'Failed to clock out' }, { status: 500 })
    }

    return NextResponse.json({ shift: data })
  } catch (error) {
    console.error('Error in POST /api/maintenance/shifts:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// PATCH - Manager/Admin correct a shift's clock in/out times.
//         Setting clockOutAt on an open shift closes it (staff who forgot to clock out).
export async function PATCH(request: NextRequest) {
  try {
    const manager = await requireManager()
    const supabase = createServerClient()

    const body = await request.json()
    const parsed = editSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { shiftId } = parsed.data

    const { data: shift, error: fetchError } = await supabase
      .from('maintenance_shifts')
      .select('*')
      .eq('id', shiftId)
      .single()

    if (fetchError || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const clockInAt = parsed.data.clockInAt ?? shift.clockInAt
    const clockOutAt = parsed.data.clockOutAt ?? shift.clockOutAt

    if (!clockOutAt) {
      return NextResponse.json({ error: 'A clock out time is required' }, { status: 400 })
    }

    const inMs = new Date(clockInAt).getTime()
    const outMs = new Date(clockOutAt).getTime()
    // Small allowance for clock skew between the manager's device and the server
    const latestAllowed = Date.now() + 5 * 60 * 1000

    if (inMs > latestAllowed || outMs > latestAllowed) {
      return NextResponse.json({ error: 'Times cannot be in the future' }, { status: 400 })
    }
    if (outMs <= inMs) {
      return NextResponse.json({ error: 'Clock out must be after clock in' }, { status: 400 })
    }
    if (outMs - inMs > MAX_SHIFT_MS) {
      return NextResponse.json({ error: 'Shift cannot be longer than 24 hours' }, { status: 400 })
    }

    if (shift.status === 'open') {
      const breakResult = await closeOpenBreak(supabase, shiftId, new Date(outMs).toISOString())
      if (breakResult?.error) {
        console.error('Error ending break on edit:', breakResult.error)
        return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
      }
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('maintenance_shifts')
      .update({
        clockInAt: new Date(inMs).toISOString(),
        clockOutAt: new Date(outMs).toISOString(),
        status: 'closed',
        closedByAdmin: shift.status === 'open' ? true : shift.closedByAdmin,
        editedById: manager.id,
        editedAt: now,
        updatedAt: now,
      })
      .eq('id', shiftId)
      .select()
      .single()

    if (error) {
      console.error('Error editing shift:', error)
      return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
    }

    return NextResponse.json({ shift: data })
  } catch (error) {
    console.error('Error in PATCH /api/maintenance/shifts:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
