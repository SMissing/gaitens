import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    // Fetch active staff users
    const { data: staffUsers, error: staffErr } = await supabase
      .from('users')
      .select('id, name, staffCode')
      .eq('active', true)
      .eq('role', 'staff')

    if (staffErr) {
      console.error('Error fetching staff for achievements manager:', staffErr)
      return NextResponse.json({ staff: [] })
    }

    const staff = (staffUsers || []) as Array<{ id: string; name: string; staffCode: string }>
    const staffIds = staff.map((s) => s.id)

    if (staffIds.length === 0) {
      return NextResponse.json({ staff: [] })
    }

    // Fetch completed achievements and map to achievement IDs/names
    const { data: rows, error: achievementsErr } = await supabase
      .from('user_achievements')
      .select(`
        userId,
        completed,
        achievement:achievements(
          id,
          name
        )
      `)
      .eq('completed', true)
      .in('userId', staffIds)

    if (achievementsErr) {
      console.error('Error fetching user achievements for staff:', achievementsErr)
      return NextResponse.json({ staff: staff.map((s) => ({ ...s, achievements: [] })) })
    }

    const byUser = new Map<string, Array<{ id: string; name: string }>>()
    for (const row of rows || []) {
      const userId = (row as any).userId
      const ach = (row as any).achievement
      if (!userId || !ach) continue

      const list = byUser.get(userId) || []
      list.push({ id: ach.id, name: ach.name })
      byUser.set(userId, list)
    }

    const result = staff.map((s) => ({
      id: s.id,
      name: s.name,
      staffCode: s.staffCode,
      achievements: (byUser.get(s.id) || []).sort((a, b) => a.name.localeCompare(b.name)),
    }))

    return NextResponse.json({ staff: result })
  } catch (err) {
    console.error('Error in GET /api/achievements/manager/staff-achievements:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

