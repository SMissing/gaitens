import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { AchievementsShell } from '@/components/achievements/AchievementsShell'
import type { Achievement, UserAchievement } from '@/types/database'

export default async function AchievementsPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // Fetch all achievements
  // Order by requiredCount first (for streak badges: 1, 7, 30, 100), then by name
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('requiredCount', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError)
  }

  // Fetch user's achievements
  const { data: userAchievements, error: userAchievementsError } = await supabase
    .from('user_achievements')
    .select(`
      *,
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
    .eq('userId', user.id)

  if (userAchievementsError) {
    console.error('Error fetching user achievements:', userAchievementsError)
  }

  // Create a map of achievementId -> UserAchievement for quick lookup
  const userAchievementMap = new Map<string, UserAchievement>()
  userAchievements?.forEach((ua: any) => {
    userAchievementMap.set(ua.achievementId, ua as UserAchievement)
  })

  return (
    <AchievementsShell
      achievements={(achievements as Achievement[]) || []}
      userAchievements={userAchievementMap}
    />
  )
}
