'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Award, ChevronRight, Star } from 'lucide-react'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import {
  getAchievementTier,
  getNextTierInfo,
} from '@/lib/achievement-tier-utils'
import type { Achievement, UserAchievement } from '@/types/database'

const STARS = [
  { top: '8%',  left: '10%', size: 1.5, opacity: 0.3  },
  { top: '15%', left: '32%', size: 1,   opacity: 0.2  },
  { top: '6%',  left: '56%', size: 2,   opacity: 0.22 },
  { top: '22%', left: '76%', size: 1,   opacity: 0.18 },
  { top: '38%', left: '88%', size: 1.5, opacity: 0.14 },
  { top: '52%', left: '68%', size: 1,   opacity: 0.13 },
  { top: '62%', left: '44%', size: 1,   opacity: 0.11 },
  { top: '28%', left: '18%', size: 1,   opacity: 0.16 },
]

interface EarnedEntry {
  achievement: Achievement
  userAchievement: UserAchievement
}

interface Props {
  userId: string
}

export function DashboardBadgeWidget({ userId }: Props) {
  const [earned, setEarned] = useState<EarnedEntry[] | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const hasFiredReady = useRef(false)

  const fireReady = () => {
    if (hasFiredReady.current) return
    hasFiredReady.current = true
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('achievements-ready'))
    }
  }

  useEffect(() => {
    setMounted(true)
    let cancelled = false

    const run = async () => {
      try {
        const [allRes, userRes] = await Promise.all([
          fetch('/api/achievements'),
          fetch(`/api/achievements/user/${userId}`),
        ])
        if (cancelled) return
        const [allData, userData] = await Promise.all([
          allRes.ok ? allRes.json() : null,
          userRes.ok ? userRes.json() : null,
        ])
        if (cancelled) return

        const allAchs: Achievement[] = allData?.achievements ?? []
        const userAchs: any[] = userData?.achievements ?? []

        const earnedEntries: EarnedEntry[] = userAchs
          .filter((ua: any) => ua.completed && ua.achievement)
          .map((ua: any) => ({
            achievement: ua.achievement as Achievement,
            userAchievement: ua as UserAchievement,
          }))
          .sort((a, b) => {
            const aAt = new Date((a.userAchievement as any).awardedAt || 0).getTime()
            const bAt = new Date((b.userAchievement as any).awardedAt || 0).getTime()
            return bAt - aAt
          })

        setEarned(earnedEntries)
        setTotalCount(allAchs.length)
      } catch {
        setEarned([])
      } finally {
        if (!cancelled) fireReady()
      }
    }

    run()
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => () => { fireReady() }, [])

  // Skeleton
  if (!mounted || earned === null) {
    return (
      <div
        className="mb-4 sm:mb-6 rounded-2xl overflow-hidden animate-pulse"
        style={{ background: 'linear-gradient(160deg, #4a3800 0%, #221a00 55%, #0e0c00 100%)' }}
      >
        <div className="px-4 pt-4 pb-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-28 bg-white/15 rounded-full" />
            <div className="h-5 w-16 bg-white/10 rounded-full" />
          </div>
          <div className="h-2 w-full bg-white/[0.1] rounded-full" />
          <div className="h-14 w-full bg-white/[0.06] rounded-xl" />
        </div>
      </div>
    )
  }

  const completedCount = earned.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const tier = getAchievementTier(pct)
  const nextTier = getNextTierInfo(pct, completedCount, totalCount)
  const recentBadges = earned.slice(0, 4)

  return (
    <div className="mb-4 sm:mb-6">
      <Link href="/achievements" className="block group focus:outline-none">
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(160deg, #4a3800 0%, #221a00 55%, #0e0c00 100%)' }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.18 }}
        >
          {/* Star field */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {STARS.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
              />
            ))}
          </div>

          {/* Inner ring */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-white/60 flex-shrink-0" />
              <span className="text-sm font-black text-white/85 tracking-tight">Achievements</span>
            </div>
            <div className="flex items-center gap-1.5">
              {completedCount > 0 && (
                <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 rounded-full px-2.5 py-1 border border-blue-500/25">
                  <Star className="h-3 w-3 fill-blue-300 flex-shrink-0" />
                  <span className="text-xs font-black tabular-nums">{completedCount}</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-blue-500/15 text-blue-300 rounded-full px-2.5 py-1 border border-blue-500/20">
                <span className="text-xs font-black">{tier}</span>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="relative px-4 pb-2.5 text-xs text-white/40 font-medium">
            {nextTier
              ? `${nextTier.badgesNeeded} more badge${nextTier.badgesNeeded !== 1 ? 's' : ''} to reach ${nextTier.nextLabel}`
              : completedCount > 0
              ? 'Max rank achieved — Legend!'
              : 'Start earning badges'}
          </p>

          {/* Progress bar */}
          <div className="relative px-4 pb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-white/40 font-medium">
                {completedCount} of {totalCount} badges
              </span>
              <span className="text-[11px] font-black text-white/55 tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden relative">
              {[25, 50, 75].map((m) => (
                <div
                  key={m}
                  className="absolute top-0 h-full w-px bg-white/20 z-10"
                  style={{ left: `${m}%` }}
                />
              ))}
              <motion.div
                className="h-full rounded-full relative z-0"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' }}
              />
            </div>
          </div>

          {/* Recent badges strip */}
          <div className="relative mx-3 mb-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex items-center justify-between gap-3">
            {recentBadges.length > 0 ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  {recentBadges.map(({ achievement, userAchievement }) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      userAchievement={userAchievement}
                      size="xs"
                      showProgress={false}
                      showLabel={false}
                    />
                  ))}
                  {completedCount > 4 && (
                    <span className="text-[10px] text-white/30 font-medium">+{completedCount - 4}</span>
                  )}
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <p className="text-[10px] text-white/30 font-medium">Your badges</p>
                  <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-white/30 font-medium">No badges earned yet</p>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
              </>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  )
}
