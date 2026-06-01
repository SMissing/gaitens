import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - List all months that have votes, with vote counts and announced status
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const { data: votes, error: votesError } = await supabase
      .from('employee_votes')
      .select('month')

    if (votesError) {
      return NextResponse.json({ error: 'Failed to fetch months' }, { status: 500 })
    }

    const monthCounts: Record<string, number> = {}
    votes?.forEach((v: any) => {
      monthCounts[v.month] = (monthCounts[v.month] || 0) + 1
    })

    const { data: winners, error: winnersError } = await supabase
      .from('employee_winners')
      .select('month, type')

    if (winnersError) {
      return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 })
    }

    const announcedByMonth: Record<string, { staff_pick: boolean; manager_pick: boolean }> = {}
    winners?.forEach((w: any) => {
      if (!announcedByMonth[w.month]) {
        announcedByMonth[w.month] = { staff_pick: false, manager_pick: false }
      }
      if (w.type === 'staff_pick') announcedByMonth[w.month].staff_pick = true
      if (w.type === 'manager_pick') announcedByMonth[w.month].manager_pick = true
    })

    const months = Object.entries(monthCounts)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, voteCount]) => {
        const a = announcedByMonth[month]
        const announced = a?.staff_pick && a?.manager_pick
          ? true
          : a?.staff_pick || a?.manager_pick
            ? 'partial'
            : false
        return { month, voteCount, announced }
      })

    return NextResponse.json(months)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
