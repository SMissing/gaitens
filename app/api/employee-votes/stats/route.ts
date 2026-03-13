import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { getCurrentVotingMonth } from '@/lib/date-utils'

// GET - Get vote statistics for the current month (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()
    const currentMonth = getCurrentVotingMonth()

    // Get all votes for the current month with voter and nominee info
    const { data: votes, error: votesError } = await supabase
      .from('employee_votes')
      .select(`
        id,
        nomineeId,
        reason,
        createdAt,
        voters:voterId(id, name, role),
        nominees:nomineeId(id, name, staffCode)
      `)
      .eq('month', currentMonth)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json(
        { error: 'Failed to fetch vote statistics' },
        { status: 500 }
      )
    }

    // Get all staff members
    const { data: staffMembers, error: staffError } = await supabase
      .from('users')
      .select('id, name, staffCode')
      .eq('role', 'staff')
      .eq('active', true)
      .order('name', { ascending: true })

    if (staffError) {
      console.error('Error fetching staff:', staffError)
      return NextResponse.json(
        { error: 'Failed to fetch staff members' },
        { status: 500 }
      )
    }

    // Count votes by nominee and separate by voter role
    const voteCounts: Record<string, {
      nomineeId: string
      nomineeName: string
      staffCode: string
      totalVotes: number
      staffVotes: number
      managerVotes: number
      votes: Array<{
        voterId: string
        voterName: string
        voterRole: string
        reason: string | null
        createdAt: string
      }>
    }> = {}

    // Initialize all staff members with 0 votes
    staffMembers?.forEach((staff) => {
      voteCounts[staff.id] = {
        nomineeId: staff.id,
        nomineeName: staff.name,
        staffCode: staff.staffCode,
        totalVotes: 0,
        staffVotes: 0,
        managerVotes: 0,
        votes: [],
      }
    })

    // Count votes
    votes?.forEach((vote: any) => {
      const nomineeId = vote.nomineeId
      const voter = Array.isArray(vote.voters) ? vote.voters[0] : vote.voters
      const nominee = Array.isArray(vote.nominees) ? vote.nominees[0] : vote.nominees

      if (!voteCounts[nomineeId]) {
        voteCounts[nomineeId] = {
          nomineeId,
          nomineeName: nominee?.name || 'Unknown',
          staffCode: nominee?.staffCode || 'N/A',
          totalVotes: 0,
          staffVotes: 0,
          managerVotes: 0,
          votes: [],
        }
      }

      voteCounts[nomineeId].totalVotes++
      voteCounts[nomineeId].votes.push({
        voterId: vote.voterId || voter?.id,
        voterName: voter?.name || 'Unknown',
        voterRole: voter?.role || 'staff',
        reason: vote.reason,
        createdAt: vote.createdAt,
      })

      if (voter?.role === 'staff') {
        voteCounts[nomineeId].staffVotes++
      } else if (voter?.role === 'manager') {
        voteCounts[nomineeId].managerVotes++
      }
    })

    // Convert to array and sort by total votes
    const stats = Object.values(voteCounts)
      .sort((a, b) => b.totalVotes - a.totalVotes)

    return NextResponse.json({
      month: currentMonth,
      stats,
      totalVotes: votes?.length || 0,
    })
  } catch (error) {
    console.error('Error in GET /api/employee-votes/stats:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
