'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Award, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { AchievementsClient } from '@/components/achievements/AchievementsClient'
import {
  AchievementsViewToggle,
  type AchievementsViewMode,
} from '@/components/achievements/AchievementsViewToggle'
import {
  getAchievementTier,
  ACHIEVEMENT_TIERS,
} from '@/lib/achievement-tier-utils'
import { cn } from '@/lib/utils'
import type { Achievement, UserAchievement } from '@/types/database'

const VIEW_MODE_STORAGE_KEY = 'achievements-view-mode'

interface AchievementsShellProps {
  achievements: Achievement[]
  userAchievements: Map<string, UserAchievement>
  userId: string
}

export function AchievementsShell({ achievements, userAchievements }: AchievementsShellProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<AchievementsViewMode>('grid')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      if (stored === 'grid' || stored === 'list') setViewMode(stored)
    } catch { /* ignore */ }
  }, [])

  const setViewModePersisted = useCallback((mode: AchievementsViewMode) => {
    setViewMode(mode)
    try { localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode) } catch { /* ignore */ }
  }, [])

  const { completedCount, totalCount, percentage } = useMemo(() => {
    const completed = Array.from(userAchievements.values()).filter((ua) => ua.completed).length
    const total = achievements.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completedCount: completed, totalCount: total, percentage: pct }
  }, [achievements, userAchievements])

  const tier = getAchievementTier(percentage)
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <>
      {/* ── Nav row ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-0 sm:px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white/50 transition-colors active:text-white sm:hover:text-white touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <AchievementsViewToggle
          mode={viewMode}
          onChange={setViewModePersisted}
          disabled={achievements.length === 0}
        />
      </div>

      {/* ── Hero header ──────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-10">

        {/* Title + stat chips */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">
              Gaitens Leisure
            </p>
            <h1 className="text-4xl font-black text-white leading-none tracking-tight">
              Your
              <br />
              <span className="text-white/90">Badges</span>
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2 pt-1 flex-shrink-0">
            {/* Rank chip — blue, inverted from training's orange streak */}
            <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 rounded-2xl px-3 py-1.5 border border-blue-500/25">
              <Award className="h-4 w-4" />
              <span className="font-black text-sm">{tier}</span>
            </div>
            {/* Earned count chip — blue, inverted from training's yellow XP */}
            {completedCount > 0 && (
              <div className="flex items-center gap-1.5 bg-blue-500/15 text-blue-200 rounded-2xl px-3 py-1.5 border border-blue-500/20">
                <Star className="h-3.5 w-3.5 fill-blue-200" />
                <span className="font-black text-sm tabular-nums">{completedCount}</span>
                <span className="text-xs text-blue-200/55 font-medium">earned</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar — emerald → lime */}
        <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </div>

        <div className="flex justify-between items-center mt-1.5">
          <span className="text-xs text-white/45 font-medium">
            {completedCount} of {totalCount} badges
          </span>
          <span className={cn('text-xs font-black tabular-nums', allDone ? 'text-blue-300' : 'text-white/60')}>
            {percentage}%
          </span>
        </div>

        {/* Tier labels */}
        <div className="flex justify-between mt-2 px-0.5">
          {ACHIEVEMENT_TIERS.map((t) => (
            <span
              key={t.label}
              className={cn(
                'text-[9px] font-semibold',
                percentage >= t.threshold ? 'text-blue-400/80' : 'text-white/20',
              )}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* All-done celebration */}
        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-5 rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.1))',
                border: '1px solid rgba(59,130,246,0.25)',
              }}
            >
              <span className="text-2xl leading-none flex-shrink-0">🏆</span>
              <div>
                <p className="text-sm font-black text-blue-300">All badges earned!</p>
                <p className="text-xs text-white/40 mt-0.5">You&apos;ve reached Legend rank</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Badge content ─────────────────────────────────────── */}
      <div className="px-4 sm:px-5">
        <div className="max-w-2xl mx-auto">
          <AchievementsClient
            achievements={achievements}
            userAchievements={userAchievements}
            viewMode={viewMode}
          />
        </div>
      </div>
    </>
  )
}
