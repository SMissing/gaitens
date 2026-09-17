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
})

// GET - Maintenance: caller's own upcoming shifts.
//       Admin: everyone's rota within a date range (defaults to today .. +60 days).
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const today = new Date().toISOString().split('T')[0]

    if (user.role === 'maintenance') {
      const { data, error } = await supabase
        .from('maintenance_rota')
        .select('*')
        .eq('userId', user.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('startTime', { ascending: true, nullsFirst: true })
        .limit(20)

      if (error) {
        console.error('Error fetching rota:', error)
        return NextResponse.json({ error: 'Failed to fetch rota' }, { status: 500 })
      }

      return NextResponse.json({ shifts: data ?? [] })
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
      .select('*, user:userId (id, name)')
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

// POST - Schedule a shift for a maintenance staff member (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const supabase = createServerClient()

    const body = await request.json()
    const parsed = createRotaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Only allow scheduling active maintenance accounts
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, role, active')
      .eq('id', parsed.data.userId)
      .maybeSingle()

    if (userError || !targetUser || targetUser.role !== 'maintenance' || !targetUser.active) {
      return NextResponse.json(
        { error: 'That account is not an active maintenance account' },
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
        createdBy: admin.id,
      })
      .select('*, user:userId (id, name)')
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
