import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { parseYyyyMmDdLocal, toYyyyMmDdLocal } from '@/lib/date-utils'

/** Distinct people off per calendar day (approved holidays only). Any signed-in user. */
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
      .from('holiday_requests')
      .select('userId, startDate, endDate')
      .eq('status', 'approved')
      .lte('startDate', endDate)
      .gte('endDate', startDate)

    if (error) {
      console.error('Error fetching holiday off counts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch off counts' },
        { status: 500 }
      )
    }

    const rangeStart = parseYyyyMmDdLocal(startDate)
    const rangeEnd = parseYyyyMmDdLocal(endDate)
    const byDate = new Map<string, Set<string>>()

    for (const row of data || []) {
      if (!row.userId) continue
      const reqStart = parseYyyyMmDdLocal(row.startDate)
      const reqEnd = parseYyyyMmDdLocal(row.endDate)
      const d = new Date(
        Math.max(reqStart.getTime(), rangeStart.getTime())
      )
      const end = new Date(Math.min(reqEnd.getTime(), rangeEnd.getTime()))

      while (d <= end) {
        const key = toYyyyMmDdLocal(d)
        if (!byDate.has(key)) byDate.set(key, new Set())
        byDate.get(key)!.add(row.userId)
        d.setDate(d.getDate() + 1)
      }
    }

    const counts: Record<string, number> = {}
    byDate.forEach((set, key) => {
      counts[key] = set.size
    })

    return NextResponse.json({ counts })
  } catch (e) {
    console.error('GET /api/holidays/off-counts:', e)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
