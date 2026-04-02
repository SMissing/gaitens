import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { getCurrentVotingMonth } from '@/lib/date-utils'

// POST - Set employee winners for the current month (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()
    const currentMonth = getCurrentVotingMonth()

    const body = await request.json()
    const { staffPickUserId, managerPickUserId } = body

    if (!staffPickUserId || !managerPickUserId) {
      return NextResponse.json(
        { error: 'Both staff pick and manager pick are required' },
        { status: 400 }
      )
    }

    // Verify both users exist and are staff
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role')
      .in('id', [staffPickUserId, managerPickUserId])
      .eq('role', 'staff')
      .eq('active', true)

    if (usersError || !users || users.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid staff members selected' },
        { status: 400 }
      )
    }

    // Delete existing winners for this month
    await supabase
      .from('employee_winners')
      .delete()
      .eq('month', currentMonth)

    // Insert new winners
    const { data: winners, error: insertError } = await supabase
      .from('employee_winners')
      .insert([
        {
          userId: staffPickUserId,
          month: currentMonth,
          type: 'staff_pick',
        },
        {
          userId: managerPickUserId,
          month: currentMonth,
          type: 'manager_pick',
        },
      ])
      .select()

    if (insertError) {
      console.error('Error setting winners:', insertError)
      return NextResponse.json(
        { error: 'Failed to set winners' },
        { status: 500 }
      )
    }

    return NextResponse.json({ winners })
  } catch (error) {
    console.error('Error in POST /api/employee-winners:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// GET - Get winners for a specific month (optional query param)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || getCurrentVotingMonth()

    const { data: winners, error } = await supabase
      .from('employee_winners')
      .select(`
        *,
        users(id, name, site)
      `)
      .eq('month', month)

    if (error) {
      console.error('Error fetching winners:', error)
      return NextResponse.json(
        { error: 'Failed to fetch winners' },
        { status: 500 }
      )
    }

    return NextResponse.json(winners || [])
  } catch (error) {
    console.error('Error in GET /api/employee-winners:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
