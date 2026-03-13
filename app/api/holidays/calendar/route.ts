import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - Get calendar availability for a date range
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('holiday_calendar_availability')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching calendar availability:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calendar availability' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/holidays/calendar:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
