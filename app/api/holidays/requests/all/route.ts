import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - Get all holiday requests (admins only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('holiday_requests')
      .select(`
        *,
        users (
          id,
          name,
          "staffCode",
          site
        )
      `)
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
    console.error('Error in GET /api/holidays/requests/all:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
