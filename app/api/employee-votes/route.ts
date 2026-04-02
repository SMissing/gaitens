import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { employeeVoteSchema } from '@/lib/validation'
import { getCurrentVotingMonth } from '@/lib/date-utils'
import { z } from 'zod'

// GET - Get current user's vote for the current month
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const currentMonth = getCurrentVotingMonth()

    const { data, error } = await supabase
      .from('employee_votes')
      .select('*, users:nomineeId(id, name, site)')
      .eq('voterId', user.id)
      .eq('month', currentMonth)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.error('Error fetching vote:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vote' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error('Error in GET /api/employee-votes:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Submit a vote for Employee of the Month
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const currentMonth = getCurrentVotingMonth()

    const body = await request.json()
    const { nomineeId, reason } = employeeVoteSchema.parse(body)

    // Prevent self-voting (staff members can't vote for themselves)
    if (user.role === 'staff' && nomineeId === user.id) {
      return NextResponse.json(
        { error: 'You cannot vote for yourself' },
        { status: 400 }
      )
    }

    // Verify nominee exists and is a staff member
    const { data: nominee, error: nomineeError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', nomineeId)
      .eq('role', 'staff')
      .eq('active', true)
      .single()

    if (nomineeError || !nominee) {
      return NextResponse.json(
        { error: 'Invalid nominee - must be an active staff member' },
        { status: 400 }
      )
    }

    // Verify voter is staff or manager (not admin voting through this endpoint)
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins should use the admin voting interface' },
        { status: 403 }
      )
    }

    // Check if vote already exists for this user and month
    const { data: existingVote, error: fetchError } = await supabase
      .from('employee_votes')
      .select('id')
      .eq('voterId', user.id)
      .eq('month', currentMonth)
      .maybeSingle()

    if (fetchError) {
      console.error('Error checking for existing vote:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check existing vote' },
        { status: 500 }
      )
    }

    // If vote exists, update it
    if (existingVote) {
      const { data: updatedVote, error: updateError } = await supabase
        .from('employee_votes')
        .update({
          nomineeId,
          reason,
        })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating vote:', updateError)
        return NextResponse.json(
          { error: 'Failed to update vote' },
          { status: 500 }
        )
      }

      return NextResponse.json(updatedVote)
    }

    // If no vote exists, create a new one
    const { data: newVote, error: insertError } = await supabase
      .from('employee_votes')
      .insert({
        voterId: user.id,
        nomineeId,
        reason,
        month: currentMonth,
      })
      .select()
      .single()

    if (insertError) {
      // If unique constraint violation, race condition occurred - try to update
      if (insertError.code === '23505') {
        const { data: existingVote, error: fetchError } = await supabase
          .from('employee_votes')
          .select('id')
          .eq('voterId', user.id)
          .eq('month', currentMonth)
          .maybeSingle()

        if (!fetchError && existingVote) {
          const { data: updatedVote, error: updateError } = await supabase
            .from('employee_votes')
            .update({
              nomineeId,
              reason,
            })
            .eq('id', existingVote.id)
            .select()
            .single()

          if (!updateError && updatedVote) {
            return NextResponse.json(updatedVote)
          }
        }
      }

      console.error('Error creating vote:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      )
    }

    return NextResponse.json(newVote, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in POST /api/employee-votes:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
