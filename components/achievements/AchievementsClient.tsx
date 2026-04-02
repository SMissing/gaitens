'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { AchievementBadge } from './AchievementBadge'
import { BadgeDetailModal, type BadgeRequestUiState } from './BadgeDetailModal'
import { Award, Check, Circle, Sparkles } from 'lucide-react'
import type { Achievement, BadgeRequest, UserAchievement } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AchievementsViewMode } from '@/components/achievements/AchievementsViewToggle'
import {
  normalizeAchievementRarity,
  rarityBadgeFaceIncomplete,
  rarityCompletionCheckBg,
  type AchievementRarity,
} from '@/lib/achievement-rarity-styles'

function getBadgeRequestUiState(achievementId: string, requests: BadgeRequest[]): BadgeRequestUiState {
  const forAch = requests.filter((r) => r.achievementId === achievementId)
  if (forAch.some((r) => r.status === 'pending')) {
    return { kind: 'pending' }
  }
  const declined = forAch
    .filter((r) => r.status === 'declined')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  if (declined) {
    return { kind: 'declined', reason: declined.rejectionReason }
  }
  return { kind: 'none' }
}

interface AchievementsClientProps {
  achievements: Achievement[]
  userAchievements: Map<string, UserAchievement>
  viewMode: AchievementsViewMode
}

function getAchievementTitle(percentage: number): string {
  if (percentage === 0) return 'Newbie'
  if (percentage < 25) return 'Newbie'
  if (percentage < 50) return 'Novice'
  if (percentage < 75) return 'Trooper'
  if (percentage < 100) return 'Expert'
  return 'Legend'
}

function rarityTextClass(rarity: string | null | undefined): string {
  switch (rarity) {
    case 'Common':
      return 'text-gray-400'
    case 'Rare':
      return 'text-blue-500'
    case 'Epic':
      return 'text-purple-500'
    case 'Legendary':
      return 'text-yellow-500'
    default:
      return 'text-muted-foreground'
  }
}

/** Stacked fraction — same face treatment as {@link AchievementBadge} for this rarity */
function ProgressFraction({
  current,
  total,
  rarity,
}: {
  current: number
  total: number
  rarity: AchievementRarity
}) {
  return (
    <div
      className={cn(
        'flex min-w-[2.75rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-2 py-1',
        rarityBadgeFaceIncomplete(rarity),
      )}
      aria-label={`Progress ${current} of ${total}`}
    >
      <span
        className={cn(
          'font-mono text-[13px] font-semibold tabular-nums leading-none tracking-tight',
          current > 0 ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {current}
      </span>
      <div className="h-px w-7 bg-gradient-to-r from-transparent via-spirits-cyan/65 to-transparent" />
      <span className="font-mono text-[11px] font-medium tabular-nums leading-none tracking-tight text-muted-foreground">
        {total}
      </span>
    </div>
  )
}

function ListRowStatus({
  achievement,
  userAchievement,
}: {
  achievement: Achievement
  userAchievement?: UserAchievement
}) {
  const isCompleted = userAchievement?.completed ?? false
  const progress = userAchievement?.currentProgress ?? 0
  const rarity = normalizeAchievementRarity(achievement.rarity)

  if (isCompleted) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background',
          rarityCompletionCheckBg(rarity),
        )}
        aria-label="Completed"
      >
        <Check className="h-[18px] w-[18px] text-background" strokeWidth={2.75} />
      </div>
    )
  }

  if (achievement.requiresProgress) {
    return (
      <ProgressFraction current={progress} total={achievement.requiredCount} rarity={rarity} />
    )
  }

  if (!userAchievement) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-muted/20"
        aria-label="Not awarded"
      >
        <Circle className="h-[18px] w-[18px] text-muted-foreground/50" strokeWidth={1.75} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
        rarityBadgeFaceIncomplete(rarity),
      )}
      aria-label="Unlocked"
    >
      <Sparkles className="h-4 w-4 text-spirits-cyan" strokeWidth={2} />
    </div>
  )
}

export function AchievementsClient({ achievements, userAchievements, viewMode }: AchievementsClientProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [badgeRequests, setBadgeRequests] = useState<BadgeRequest[]>([])

  const refreshBadgeRequests = useCallback(async () => {
    const res = await fetch('/api/achievements/badge-requests/mine')
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data.requests)) {
      setBadgeRequests(data.requests)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/achievements/badge-requests/mine')
      if (!res.ok || cancelled) return
      const data = await res.json()
      if (!cancelled && Array.isArray(data.requests)) {
        setBadgeRequests(data.requests)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const requestBadge = async (achievementId: string) => {
    const res = await fetch('/api/achievements/badge-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
    }
    await refreshBadgeRequests()
  }

  const sortedItems = useMemo(() => {
    return achievements
      .map((achievement) => {
        const userAchievement = userAchievements.get(achievement.id)
        const isCompleted = userAchievement?.completed ?? false
        const isInProgress = userAchievement && !isCompleted && userAchievement.currentProgress > 0

        return {
          achievement,
          userAchievement,
          sortPriority: isCompleted ? 0 : isInProgress ? 1 : userAchievement ? 2 : 3,
        }
      })
      .sort((a, b) => {
        if (a.sortPriority !== b.sortPriority) {
          return a.sortPriority - b.sortPriority
        }
        return a.achievement.requiredCount - b.achievement.requiredCount
      })
  }, [achievements, userAchievements])

  const completedCount = Array.from(userAchievements.values()).filter((ua) => ua.completed).length
  const totalCount = achievements.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const title = getAchievementTitle(percentage)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative w-full h-8 bg-muted/30 rounded-full overflow-hidden border border-border/30">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: '#00d9ff',
              backgroundImage: 'linear-gradient(to right, #00d9ff, #ff00ff, #ffff00)',
              minWidth: percentage > 0 ? '4px' : '0',
              zIndex: 1,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-sm font-bold text-foreground drop-shadow-lg">{percentage}%</span>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        </div>
      </div>

      {viewMode === 'grid' && achievements.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {sortedItems.map(({ achievement, userAchievement }) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              userAchievement={userAchievement}
              size="md"
              showProgress={true}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>
      )}

      {viewMode === 'list' && achievements.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e] shadow-sm shadow-black/20">
          <CardContent className="divide-y divide-border/35 p-0">
            {sortedItems.map(({ achievement, userAchievement }) => {
              const rawRarity = achievement.rarity || null
              const rarity =
                rawRarity && ['Common', 'Rare', 'Epic', 'Legendary'].includes(rawRarity)
                  ? rawRarity
                  : 'Common'

              return (
                <button
                  key={achievement.id}
                  type="button"
                  onClick={() => setSelectedAchievement(achievement)}
                  className="flex w-full items-center gap-3 py-3 pl-3 pr-3 text-left transition-colors sm:gap-4 sm:pl-4 sm:pr-4 sm:hover:bg-white/[0.04]"
                >
                  <div className="shrink-0">
                    <AchievementBadge
                      achievement={achievement}
                      userAchievement={userAchievement}
                      size="sm"
                      showProgress={true}
                      showLabel={false}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="min-w-0 truncate font-medium text-foreground">{achievement.name}</span>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-semibold tracking-wide',
                          rarityTextClass(rarity),
                        )}
                      >
                        {rarity}
                      </span>
                    </div>
                    {achievement.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                        {achievement.description}
                      </p>
                    )}
                  </div>

                  <ListRowStatus achievement={achievement} userAchievement={userAchievement} />
                </button>
              )
            })}
          </CardContent>
        </Card>
      )}

      {selectedAchievement && (
        <BadgeDetailModal
          achievement={selectedAchievement}
          userAchievement={userAchievements.get(selectedAchievement.id)}
          isOpen={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          badgeRequestState={getBadgeRequestUiState(selectedAchievement.id, badgeRequests)}
          onRequestBadge={() => requestBadge(selectedAchievement.id)}
        />
      )}

      {achievements.length === 0 && (
        <div className="text-center py-16">
          <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">No achievements available yet</p>
        </div>
      )}
    </div>
  )
}
