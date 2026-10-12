import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const createRotaSchema = z.object({
  userId: z.string().uuid(),
  date: dateSchema,
  startTime: timeSchema.nullable().optional(),
  endTime: timeSchema.nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  photos: z.array(z.string().url()).max(6).optional(),
})

const ROTA_SELECT = '*, user:userId (id, name, role), completedBy:completedById (id, name)'
const HISTORY_DAYS = 14

// GET - Maintenance, or anyone with ?mine=1: caller's own upcoming shifts, plus the
//       whole team's jobs from the last 14 days so they can see what's done / outstanding.
//       Admin: everyone's rota within a date range (defaults to today .. +60 days).
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const today = new Date().toISOString().split('T')[0]

    if (user.role === 'maintenance' || searchParams.get('mine') === '1') {
      const historyFrom = new Date()
      historyFrom.setDate(historyFrom.getDate() - HISTORY_DAYS)

      const [upcomingRes, historyRes] = await Promise.all([
        supabase
          .from('maintenance_rota')
          .select(ROTA_SELECT)
          .eq('userId', user.id)
          .gte('date', today)
          .order('date', { ascending: true })
          .order('startTime', { ascending: true, nullsFirst: true })
          .limit(20),
        supabase
          .from('maintenance_rota')
          .select(ROTA_SELECT)
          .gte('date', historyFrom.toISOString().split('T')[0])
          .lt('date', today)
          .order('date', { ascending: false })
          .order('startTime', { ascending: true, nullsFirst: true }),
      ])

      if (upcomingRes.error || historyRes.error) {
        console.error('Error fetching rota:', upcomingRes.error ?? historyRes.error)
        return NextResponse.json({ error: 'Failed to fetch rota' }, { status: 500 })
      }

      return NextResponse.json({ shifts: upcomingRes.data ?? [], history: historyRes.data ?? [] })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const from = searchParams.get('from') || today
    const toDefault = new Date()
    toDefault.setDate(toDefault.getDate() + 60)
    const to = searchParams.get('to') || toDefault.toISOString().split('T')[0]

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('maintenance_rota')
      .select(ROTA_SELECT)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true, nullsFirst: true })

    if (error) {
      console.error('Error fetching rota:', error)
      return NextResponse.json({ error: 'Failed to fetch rota' }, { status: 500 })
    }

    return NextResponse.json({ from, to, shifts: data ?? [] })
  } catch (error) {
    console.error('Error in GET /api/maintenance/rota:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// POST - Schedule a maintenance job for any active staff member (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const supabase = createServerClient()

    const body = await request.json()
    const parsed = createRotaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Maintenance accounts and regular staff can both be rota'd for maintenance work
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, active')
      .eq('id', parsed.data.userId)
      .maybeSingle()

    if (userError || !targetUser || !targetUser.active) {
      return NextResponse.json(
        { error: 'That account is not an active staff account' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('maintenance_rota')
      .insert({
        userId: parsed.data.userId,
        date: parsed.data.date,
        startTime: parsed.data.startTime || null,
        endTime: parsed.data.endTime || null,
        notes: parsed.data.notes || null,
        photos: parsed.data.photos ?? [],
        createdBy: admin.id,
      })
      .select(ROTA_SELECT)
      .single()

    if (error) {
      console.error('Error creating rota shift:', error)
      return NextResponse.json({ error: 'Failed to schedule shift' }, { status: 500 })
    }

    return NextResponse.json({ shift: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/maintenance/rota:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
