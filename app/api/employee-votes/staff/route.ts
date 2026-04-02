import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

// GET - Get all staff-level employees for voting dropdown
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()

    const { data: staff, error } = await supabase
      .from('users')
      .select('id, name, site')
      .eq('role', 'staff')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json(
        { error: 'Failed to fetch staff members' },
        { status: 500 }
      )
    }

    return NextResponse.json(staff || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error in GET /api/employee-votes/staff:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
