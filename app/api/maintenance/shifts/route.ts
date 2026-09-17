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

const postSchema = z.discriminatedUnion('action', [clockInSchema, clockOutSchema])

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
        .select('*')
        .eq('userId', user.id)
        .eq('status', 'open')
        .maybeSingle()

      const { data: recent } = await supabase
        .from('maintenance_shifts')
        .select('*')
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
      .select('*, user:userId (id, name)')
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

    // clock_out
    if (!existingOpen) {
      return NextResponse.json({ error: 'Not currently clocked in' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('maintenance_shifts')
      .update({
        clockOutAt: new Date().toISOString(),
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

// PATCH - Manager/Admin force-close a stuck open shift
export async function PATCH(request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    const body = await request.json()
    const shiftId = typeof body?.shiftId === 'string' ? body.shiftId : null
    if (!shiftId) {
      return NextResponse.json({ error: 'shiftId is required' }, { status: 400 })
    }

    const { data: shift, error: fetchError } = await supabase
      .from('maintenance_shifts')
      .select('*')
      .eq('id', shiftId)
      .single()

    if (fetchError || !shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    if (shift.status !== 'open') {
      return NextResponse.json({ error: 'Shift is already closed' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('maintenance_shifts')
      .update({
        clockOutAt: new Date().toISOString(),
        status: 'closed',
        closedByAdmin: true,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', shiftId)
      .select()
      .single()

    if (error) {
      console.error('Error force-closing shift:', error)
      return NextResponse.json({ error: 'Failed to close shift' }, { status: 500 })
    }

    return NextResponse.json({ shift: data })
  } catch (error) {
    console.error('Error in PATCH /api/maintenance/shifts:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
