import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'

const addHolidaySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reason: z.string().optional().nullable(),
})

// POST - Admin creates an approved holiday directly (admins only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const body = await request.json()
    const { userId, startDate, endDate, reason } = addHolidaySchema.parse(body)

    // Validate date range
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', userId)
      .eq('active', true)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Staff member not found or inactive' },
        { status: 404 }
      )
    }

    // Check if any dates in the range are red (unavailable)
    const dateRange: string[] = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dateRange.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const { data: availability } = await supabase
      .from('holiday_calendar_availability')
      .select('date, status')
      .in('date', dateRange)
      .eq('status', 'red')

    if (availability && availability.length > 0) {
      return NextResponse.json(
        { error: 'Some dates in the requested range are unavailable' },
        { status: 400 }
      )
    }

    // Create the holiday request with approved status
    const { data, error } = await supabase
      .from('holiday_requests')
      .insert({
        userId,
        startDate,
        endDate,
        reason: reason || null,
        status: 'approved', // Directly approved by admin
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating holiday:', error)
      return NextResponse.json(
        { error: 'Failed to create holiday' },
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
    console.error('Error in POST /api/holidays/add:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
