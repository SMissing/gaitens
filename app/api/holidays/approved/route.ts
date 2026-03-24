import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - Get all approved holiday requests with user info (for managers/admins)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    // Check if user is manager or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['manager', 'admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Manager or Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('holiday_requests')
      .select(`
        id,
        userId,
        startDate,
        endDate,
        status,
        reason,
        createdAt,
        updatedAt,
        users (
          id,
          name
        )
      `)
      .eq('status', 'approved')
      .order('startDate', { ascending: true })

    if (startDate && endDate) {
      // Include holidays that overlap with the date range
      // A holiday overlaps if: startDate <= rangeEnd AND endDate >= rangeStart
      query = query
        .lte('startDate', endDate)
        .gte('endDate', startDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching approved holiday requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch approved holiday requests' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/holidays/approved:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
