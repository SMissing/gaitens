import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    // Fetch active staff
    const { data: staffUsers, error: staffErr } = await supabase
      .from('users')
      .select('id, name, staffCode')
      .eq('active', true)
      .eq('role', 'staff')

    if (staffErr) {
      console.error('Error fetching staff for venue numbers manager:', staffErr)
      return NextResponse.json({ staff: [] })
    }

    const staff = (staffUsers || []) as Array<{ id: string; name: string; staffCode: string }>
    const staffIds = staff.map((s) => s.id)
    if (staffIds.length === 0) {
      return NextResponse.json({ staff: [] })
    }

    // Fetch entries for these users (counts computed in application layer for MVP).
    const { data: entries, error } = await supabase
      .from('venue_numbers_log')
      .select('user_id, created_at')
      .in('user_id', staffIds)

    if (error) {
      console.error('Error fetching venue number entries:', error)
      return NextResponse.json({ staff: staff.map((s) => ({ ...s, sharedCount: 0 })) })
    }

    const byUser = new Map<
      string,
      {
        sharedCount: number
        lastSharedAt: string | null
      }
    >()

    for (const e of entries || []) {
      const userId = (e as any).user_id as string
      const createdAt = (e as any).created_at as string
      const current = byUser.get(userId) || { sharedCount: 0, lastSharedAt: null }
      current.sharedCount += 1
      if (!current.lastSharedAt || createdAt > current.lastSharedAt) current.lastSharedAt = createdAt
      byUser.set(userId, current)
    }

    const result = staff
      .map((s) => {
        const stats = byUser.get(s.id) || { sharedCount: 0, lastSharedAt: null }
        return { ...s, sharedCount: stats.sharedCount, lastSharedAt: stats.lastSharedAt }
      })
      .sort((a, b) => b.sharedCount - a.sharedCount)

    return NextResponse.json({ staff: result })
  } catch (err) {
    console.error('Error in GET /api/venue-numbers/manager:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

