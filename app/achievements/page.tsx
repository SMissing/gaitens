import Image from 'next/image'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { AchievementsShell } from '@/components/achievements/AchievementsShell'
import type { Achievement, UserAchievement } from '@/types/database'

export default async function AchievementsPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('requiredCount', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError)
  }

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

  const userAchievementMap = new Map<string, UserAchievement>()
  userAchievements?.forEach((ua: any) => {
    userAchievementMap.set(ua.achievementId, ua as UserAchievement)
  })

  return (
    <div className="min-h-screen relative" style={{ background: '#0e0c00' }}>

      {/* Gradient hero backdrop — deep gold/yellow */}
      <div
        className="absolute inset-x-0 top-0 h-[28rem] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #4a3800 0%, #221a00 35%, #0e0c00 100%)' }}
      />

      {/* Logo watermark */}
      <div
        className="absolute top-0 right-0 w-44 h-44 select-none pointer-events-none"
        style={{ opacity: 0.07 }}
        aria-hidden
      >
        <Image src="/logos/gaitens-logo-white.png" alt="" fill className="object-contain object-right-top" />
      </div>

      {/* Star field */}
      <div className="absolute inset-x-0 top-0 h-[28rem] pointer-events-none overflow-hidden" aria-hidden>
        {[
          { top: '10%', left: '7%',  size: 1.5, opacity: 0.35 },
          { top: '6%',  left: '21%', size: 1,   opacity: 0.25 },
          { top: '18%', left: '37%', size: 2,   opacity: 0.2  },
          { top: '4%',  left: '54%', size: 1.5, opacity: 0.3  },
          { top: '14%', left: '69%', size: 1,   opacity: 0.25 },
          { top: '26%', left: '82%', size: 2,   opacity: 0.18 },
          { top: '8%',  left: '93%', size: 1.5, opacity: 0.3  },
          { top: '32%', left: '14%', size: 1,   opacity: 0.18 },
          { top: '40%', left: '48%', size: 1.5, opacity: 0.12 },
          { top: '22%', left: '60%', size: 1,   opacity: 0.22 },
        ].map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity }}
          />
        ))}
      </div>

      {/* Page content */}
      <div className="relative z-10 pb-32">
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <AchievementsShell
          achievements={(achievements as Achievement[]) || []}
          userAchievements={userAchievementMap}
          userId={user.id}
        />
      </div>
    </div>
  )
}
