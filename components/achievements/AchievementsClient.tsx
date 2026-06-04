'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BadgeDetailModal, type BadgeRequestUiState } from './BadgeDetailModal'
import { Check, Lock, Award } from 'lucide-react'
import type { Achievement, BadgeRequest, UserAchievement } from '@/types/database'
import { cn } from '@/lib/utils'
import type { AchievementsViewMode } from '@/components/achievements/AchievementsViewToggle'
import { RARITY_ORDER } from '@/lib/achievement-tier-utils'

// ── Rarity colour palette ────────────────────────────────────────────────────

const RARITY: Record<string, {
  from: string
  to: string
  glow: string
  border: string
  cardBg: string
  text: string
  label: string
}> = {
  Legendary: {
    from: '#F59E0B', to: '#B45309',
    glow: 'shadow-yellow-500/30',
    border: 'border-yellow-500/35',
    cardBg: 'from-yellow-500/10 via-orange-500/6 to-transparent',
    text: 'text-yellow-400',
    label: '★ Legendary',
  },
  Epic: {
    from: '#8B5CF6', to: '#6D28D9',
    glow: 'shadow-purple-500/30',
    border: 'border-purple-500/30',
    cardBg: 'from-purple-500/10 via-violet-600/6 to-transparent',
    text: 'text-purple-400',
    label: '✦ Epic',
  },
  Rare: {
    from: '#3B82F6', to: '#1D4ED8',
    glow: 'shadow-blue-500/25',
    border: 'border-blue-500/25',
    cardBg: 'from-blue-500/8 via-blue-600/5 to-transparent',
    text: 'text-blue-400',
    label: '◆ Rare',
  },
  Common: {
    from: '#9CA3AF', to: '#4B5563',
    glow: '',
    border: 'border-white/10',
    cardBg: 'from-white/[0.04] to-transparent',
    text: 'text-gray-400',
    label: '• Common',
  },
}

const getRarity = (r: string | null | undefined) =>
  (r && RARITY[r]) ? RARITY[r] : RARITY.Common

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBadgeRequestUiState(achievementId: string, requests: BadgeRequest[]): BadgeRequestUiState {
  const forAch = requests.filter((r) => r.achievementId === achievementId)
  if (forAch.some((r) => r.status === 'pending')) return { kind: 'pending' }
  const declined = forAch
    .filter((r) => r.status === 'declined')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  if (declined) return { kind: 'declined', reason: declined.rejectionReason }
  return { kind: 'none' }
}

// ── Rarity section header ────────────────────────────────────────────────────

function RarityHeader({ rarity, earned, total }: { rarity: string; earned: number; total: number }) {
  const r = getRarity(rarity)
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className={cn('text-xs font-black uppercase tracking-widest', r.text)}>
        {r.label}
      </span>
      <div className="h-px flex-1 bg-white/[0.07]" />
      <span className="text-[11px] text-white/25 font-medium tabular-nums shrink-0">
        {earned}/{total}
      </span>
    </div>
  )
}

// ── Grid: achievement card (PlayStation / Xbox style) ────────────────────────

function AchievementCard({
  achievement,
  userAchievement,
  onClick,
}: {
  achievement: Achievement
  userAchievement?: UserAchievement
  onClick: () => void
}) {
  const isCompleted = userAchievement?.completed ?? false
  const isInProgress = !!userAchievement && !isCompleted && (userAchievement.currentProgress ?? 0) > 0
  const rarity = getRarity(achievement.rarity)
  const progressPct =
    achievement.requiresProgress && achievement.requiredCount > 0
      ? Math.min(((userAchievement?.currentProgress ?? 0) / achievement.requiredCount) * 100, 100)
      : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border text-left',
        'transition-all duration-200 active:scale-[0.97] sm:hover:scale-[1.02] touch-manipulation',
        isCompleted
          ? cn('bg-gradient-to-b', rarity.cardBg, rarity.border, rarity.glow && cn('shadow-lg', rarity.glow))
          : 'bg-[#0d0d13] border-white/[0.06]',
      )}
    >
      {/* Legendary shimmer overlay */}
      {isCompleted && achievement.rarity === 'Legendary' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 50%, rgba(245,158,11,0.04) 100%)',
          }}
        />
      )}

      {/* Icon area */}
      <div className="relative flex items-center justify-center pt-6 pb-4">
        {/* Radial glow behind icon for earned badges */}
        {isCompleted && achievement.rarity !== 'Common' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 60%, ${rarity.from}22 0%, transparent 65%)`,
            }}
          />
        )}

        {/* Icon circle */}
        <div className="relative">
          {/* Rarity ring on earned */}
          {isCompleted && (
            <div
              className="absolute -inset-1 rounded-full opacity-50"
              style={{
                background: `linear-gradient(135deg, ${rarity.from}, ${rarity.to})`,
              }}
            />
          )}

          <div
            className={cn(
              'relative z-10 w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2',
              isCompleted
                ? 'border-transparent'
                : 'border-white/[0.08] bg-white/[0.04]',
            )}
            style={
              isCompleted
                ? { background: `linear-gradient(135deg, ${rarity.from}, ${rarity.to})` }
                : undefined
            }
          >
            {achievement.imageUrl ? (
              <img
                src={achievement.imageUrl}
                alt={achievement.name}
                className={cn(
                  'w-12 h-12 object-contain',
                  !isCompleted && 'opacity-25 grayscale',
                )}
              />
            ) : (
              <Award
                className={cn(
                  'h-8 w-8',
                  isCompleted ? 'text-white/90' : 'text-white/15',
                )}
              />
            )}
          </div>

          {/* Earned checkmark */}
          {isCompleted && (
            <div
              className="absolute -bottom-0.5 -right-0.5 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0d0d13]"
              style={{ background: rarity.from }}
            >
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
            </div>
          )}
        </div>
      </div>

      {/* Text + meta */}
      <div className="flex flex-col flex-1 px-3 pb-4 gap-1.5">
        <p
          className={cn(
            'text-[13px] font-bold leading-snug line-clamp-2',
            isCompleted ? 'text-white/90' : 'text-white/30',
          )}
        >
          {achievement.name}
        </p>

        {achievement.description && (
          <p className="text-[11px] leading-snug text-white/25 line-clamp-2 flex-1">
            {achievement.description}
          </p>
        )}

        {/* Progress bar for in-progress */}
        {isInProgress && achievement.requiresProgress && (
          <div className="mt-1">
            <div className="h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${rarity.from}, ${rarity.to})`,
                }}
              />
            </div>
            <p className="text-[9px] text-white/30 mt-0.5 tabular-nums text-right">
              {userAchievement?.currentProgress}/{achievement.requiredCount}
            </p>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <span className={cn('text-[10px] font-bold uppercase tracking-wide', rarity.text)}>
            {achievement.rarity ?? 'Common'}
          </span>
          {isCompleted ? (
            <span className="text-[9px] text-white/25 font-medium">Earned</span>
          ) : !isInProgress ? (
            <Lock className="h-3 w-3 text-white/15" />
          ) : null}
        </div>
      </div>
    </button>
  )
}

// ── List: PS5-style achievement row ──────────────────────────────────────────

function AchievementRow({
  achievement,
  userAchievement,
  isLast,
  onClick,
}: {
  achievement: Achievement
  userAchievement?: UserAchievement
  isLast: boolean
  onClick: () => void
}) {
  const isCompleted = userAchievement?.completed ?? false
  const isInProgress = !!userAchievement && !isCompleted && (userAchievement.currentProgress ?? 0) > 0
  const rarity = getRarity(achievement.rarity)
  const progressPct =
    achievement.requiresProgress && achievement.requiredCount > 0
      ? Math.min(((userAchievement?.currentProgress ?? 0) / achievement.requiredCount) * 100, 100)
      : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors sm:hover:bg-white/[0.04] touch-manipulation',
        !isLast && 'border-b border-white/[0.06]',
      )}
    >
      {/* Icon */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden border-2',
            isCompleted ? 'border-transparent' : 'border-white/[0.08]',
          )}
          style={
            isCompleted
              ? { background: `linear-gradient(135deg, ${rarity.from}, ${rarity.to})` }
              : { background: 'rgba(255,255,255,0.04)' }
          }
        >
          {achievement.imageUrl ? (
            <img
              src={achievement.imageUrl}
              alt={achievement.name}
              className={cn('w-10 h-10 object-contain', !isCompleted && 'opacity-20 grayscale')}
            />
          ) : (
            <Award className={cn('h-7 w-7', isCompleted ? 'text-white/80' : 'text-white/12')} />
          )}
        </div>
        {isCompleted && (
          <div
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#111116]"
            style={{ background: rarity.from }}
          >
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold leading-tight', isCompleted ? 'text-white/90' : 'text-white/35')}>
          {achievement.name}
        </p>
        {achievement.description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/25">
            {achievement.description}
          </p>
        )}
        {isInProgress && achievement.requiresProgress && (
          <div className="mt-2 w-32">
            <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${rarity.from}, ${rarity.to})`,
                }}
              />
            </div>
            <p className="text-[10px] text-white/30 mt-0.5 tabular-nums">
              {userAchievement?.currentProgress}/{achievement.requiredCount}
            </p>
          </div>
        )}
      </div>

      {/* Right: rarity + status */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className={cn('text-[10px] font-bold uppercase tracking-wide', rarity.text)}>
          {achievement.rarity ?? 'Common'}
        </span>
        {isCompleted ? (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: `linear-gradient(135deg, ${rarity.from}, ${rarity.to})` }}
          >
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]">
            <Lock className="h-3.5 w-3.5 text-white/20" />
          </div>
        )}
      </div>
    </button>
  )
}

// ── Main client ──────────────────────────────────────────────────────────────

interface AchievementsClientProps {
  achievements: Achievement[]
  userAchievements: Map<string, UserAchievement>
  viewMode: AchievementsViewMode
}

export function AchievementsClient({ achievements, userAchievements, viewMode }: AchievementsClientProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [badgeRequests, setBadgeRequests] = useState<BadgeRequest[]>([])

  const refreshBadgeRequests = useCallback(async () => {
    const res = await fetch('/api/achievements/badge-requests/mine')
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data.requests)) setBadgeRequests(data.requests)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/achievements/badge-requests/mine')
      if (!res.ok || cancelled) return
      const data = await res.json()
      if (!cancelled && Array.isArray(data.requests)) setBadgeRequests(data.requests)
    })()
    return () => { cancelled = true }
  }, [])

  const requestBadge = async (achievementId: string) => {
    const res = await fetch('/api/achievements/badge-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
    await refreshBadgeRequests()
  }

  // Group by rarity, sort within each group: earned → in-progress → locked
  const rarityGroups = useMemo(() => {
    const groups = new Map<string, Achievement[]>()
    for (const r of [...RARITY_ORDER, 'Other' as const]) groups.set(r, [])

    for (const ach of achievements) {
      const r = ach.rarity && (RARITY_ORDER as readonly string[]).includes(ach.rarity)
        ? ach.rarity : 'Other'
      groups.get(r)!.push(ach)
    }

    for (const [, list] of groups) {
      list.sort((a, b) => {
        const ua = userAchievements.get(a.id)
        const ub = userAchievements.get(b.id)
        const pa = ua?.currentProgress ?? 0
        const pb = ub?.currentProgress ?? 0
        const ra = ua?.completed ? 0 : pa > 0 ? 1 : 2
        const rb = ub?.completed ? 0 : pb > 0 ? 1 : 2
        if (ra !== rb) return ra - rb
        if (ra === 0) {
          // Most recently earned first
          return new Date((ub as any)?.awardedAt || 0).getTime()
               - new Date((ua as any)?.awardedAt || 0).getTime()
        }
        if (ra === 1) return pb - pa
        return a.name.localeCompare(b.name)
      })
    }
    return groups
  }, [achievements, userAchievements])

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="text-5xl">🏅</div>
        <p className="text-white/30 text-base font-medium">No achievements available yet.</p>
      </div>
    )
  }

  const activeRarities = ([...RARITY_ORDER, 'Other' as const]).filter(
    (r) => (rarityGroups.get(r)?.length ?? 0) > 0,
  )

  const modal = selectedAchievement ? (
    <BadgeDetailModal
      achievement={selectedAchievement}
      userAchievement={userAchievements.get(selectedAchievement.id)}
      isOpen={!!selectedAchievement}
      onClose={() => setSelectedAchievement(null)}
      badgeRequestState={getBadgeRequestUiState(selectedAchievement.id, badgeRequests)}
      onRequestBadge={() => requestBadge(selectedAchievement.id)}
    />
  ) : null

  // ── List view — PS5 trophy list ──────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <>
        {activeRarities.map((rarity) => {
          const list = rarityGroups.get(rarity)!
          const earned = list.filter((a) => userAchievements.get(a.id)?.completed).length
          return (
            <section key={rarity} className="mb-6">
              <RarityHeader rarity={rarity} earned={earned} total={list.length} />
              <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111116]">
                {list.map((ach, idx) => (
                  <AchievementRow
                    key={ach.id}
                    achievement={ach}
                    userAchievement={userAchievements.get(ach.id)}
                    isLast={idx === list.length - 1}
                    onClick={() => setSelectedAchievement(ach)}
                  />
                ))}
              </div>
            </section>
          )
        })}
        {modal}
      </>
    )
  }

  // ── Grid view — Xbox / PS trophy grid ────────────────────────────────────
  return (
    <>
      {activeRarities.map((rarity) => {
        const list = rarityGroups.get(rarity)!
        const earned = list.filter((a) => userAchievements.get(a.id)?.completed).length
        return (
          <section key={rarity} className="mb-8">
            <RarityHeader rarity={rarity} earned={earned} total={list.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {list.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  userAchievement={userAchievements.get(ach.id)}
                  onClick={() => setSelectedAchievement(ach)}
                />
              ))}
            </div>
          </section>
        )
      })}
      {modal}
    </>
  )
}
