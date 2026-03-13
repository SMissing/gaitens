import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'

const updateAvailabilitySchema = z.object({
  status: z.enum(['green', 'yellow', 'red']),
  notes: z.string().optional().nullable(),
})

// PUT - Update calendar availability for a specific date (admins only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, notes } = updateAvailabilitySchema.parse(body)

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(params.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Upsert the availability
    const { data, error } = await supabase
      .from('holiday_calendar_availability')
      .upsert({
        date: params.date,
        status,
        notes: notes || null,
        updatedBy: user.id,
        updatedAt: new Date().toISOString(),
      }, {
        onConflict: 'date'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating calendar availability:', error)
      return NextResponse.json(
        { error: 'Failed to update calendar availability' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in PUT /api/holidays/calendar/[date]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
