import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { Achievement, User, UserAchievement } from '@/types/database'

function mapAchievement(ach: Record<string, unknown> | null | undefined): Achievement | null {
  if (!ach || typeof ach !== 'object' || !ach.id) return null
  return {
    id: String(ach.id),
    name: String(ach.name ?? ''),
    description: (ach.description as string | null) ?? null,
    imageUrl: (ach.imageUrl as string | null) ?? null,
    requiresProgress: Boolean(ach.requiresProgress),
    requiredCount: Number(ach.requiredCount) || 0,
    rarity: ach.rarity as Achievement['rarity'],
    createdAt: String(ach.createdAt ?? new Date().toISOString()),
    updatedAt: String(ach.updatedAt ?? new Date().toISOString()),
  }
}

export async function GET(_request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    // Fetch active staff users
    const { data: staffUsers, error: staffErr } = await supabase
      .from('users')
      .select('id, name, site, role')
      .eq('active', true)
      .in('role', ['staff', 'manager', 'admin'])

    if (staffErr) {
      console.error('Error fetching staff for achievements manager:', staffErr)
      return NextResponse.json({ staff: [] })
    }

    const staff = (staffUsers || []) as Pick<User, 'id' | 'name' | 'site' | 'role'>[]
    const staffIds = staff.map((s) => s.id)

    if (staffIds.length === 0) {
      return NextResponse.json({ staff: [] })
    }

    // Fetch completed achievements and map to achievement IDs/names
    const { data: rows, error: achievementsErr } = await supabase
      .from('user_achievements')
      .select(`
        id,
        userId,
        "achievementId",
        "currentProgress",
        completed,
        "awardedBy",
        "awardedAt",
        achievement:achievements(
          id,
          name,
          description,
          "imageUrl",
          "requiresProgress",
          "requiredCount",
          rarity,
          "createdAt",
          "updatedAt"
        )
      `)
      .eq('completed', true)
      .in('userId', staffIds)

    if (achievementsErr) {
      console.error('Error fetching user achievements for staff:', achievementsErr)
      return NextResponse.json({ staff: staff.map((s) => ({ ...s, achievements: [] })) })
    }

    type StaffBadgeRow = { achievement: Achievement; userAchievement: UserAchievement }

    const byUser = new Map<string, StaffBadgeRow[]>()
    for (const row of rows || []) {
      const r = row as Record<string, unknown>
      const userId = r.userId as string | undefined
      const achievement = mapAchievement(r.achievement as Record<string, unknown>)
      if (!userId || !achievement) continue

      const ua: UserAchievement = {
        id: String(r.id),
        userId,
        achievementId: String(r.achievementId),
        currentProgress: Number(r.currentProgress) || 0,
        completed: Boolean(r.completed),
        awardedBy: (r.awardedBy as string | null) ?? null,
        awardedAt: String(r.awardedAt ?? ''),
        achievement,
      }

      const list = byUser.get(userId) || []
      list.push({ achievement, userAchievement: ua })
      byUser.set(userId, list)
    }

    const result = staff.map((s) => ({
      id: s.id,
      name: s.name,
      site: s.site,
      role: s.role,
      badges: (byUser.get(s.id) || []).sort((a, b) =>
        a.achievement.name.localeCompare(b.achievement.name),
      ),
    }))

    return NextResponse.json({ staff: result })
  } catch (err) {
    console.error('Error in GET /api/achievements/manager/staff-achievements:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

