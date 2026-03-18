import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'
import { parseYyyyMmDdLocal, toYyyyMmDdLocal } from '@/lib/date-utils'

const holidayRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reason: z.string().optional().nullable(),
})

// GET - Get holiday requests for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('holiday_requests')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching holiday requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch holiday requests' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/holidays/requests:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new holiday request
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const { startDate, endDate, reason } = holidayRequestSchema.parse(body)

    // Validate date range
    const start = parseYyyyMmDdLocal(startDate)
    const end = parseYyyyMmDdLocal(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      )
    }

    if (end < start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check if any dates in the range are red (unavailable)
    const dateRange: string[] = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dateRange.push(toYyyyMmDdLocal(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const { data: availability } = await supabase
      .from('holiday_calendar_availability')
      .select('date, status')
      .in('date', dateRange)
      .eq('status', 'red')

    if (availability && availability.length > 0) {
      return NextResponse.json(
        { error: 'Some dates in your requested range are unavailable' },
        { status: 400 }
      )
    }

    // Create the holiday request
    const { data, error } = await supabase
      .from('holiday_requests')
      .insert({
        userId: user.id,
        startDate,
        endDate,
        reason: reason || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating holiday request:', error)
      return NextResponse.json(
        { error: 'Failed to create holiday request' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in POST /api/holidays/requests:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
