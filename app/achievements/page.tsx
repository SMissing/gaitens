import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { AchievementsClient } from '@/components/achievements/AchievementsClient'
import { Award } from 'lucide-react'
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
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Achievements"
        icon={<Award className="h-6 w-6 text-spirits-cyan" />}
        description="Your badges and accomplishments"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <AchievementsClient 
            achievements={achievements as Achievement[] || []}
            userAchievements={userAchievementMap}
            currentUserId={user.id}
            userRole={user.role}
          />
        </div>
      </div>
    </div>
  )
}
