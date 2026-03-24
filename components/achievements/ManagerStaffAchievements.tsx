'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Achievement, UserAchievement, UserRole } from '@/types/database'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  STAFF_BADGES_DOCK_REFRESH,
  STAFF_BADGES_DOCK_SET_FILTER,
  STAFF_BADGES_DOCK_SET_SORT,
  type StaffBadgesSortOption,
  type StaffBadgesVenueFilter,
} from '@/lib/staff-badges-dock-bridge'

type StaffBadgeEntry = {
  achievement: Achievement
  userAchievement: UserAchievement
}

type StaffRow = {
  id: string
  name: string
  site: string | null
  role: UserRole
  badges: StaffBadgeEntry[]
}

function roleRank(role: UserRole): number {
  if (role === 'admin') return 0
  if (role === 'manager') return 1
  return 2
}

function matchesVenueFilter(site: string | null, filter: StaffBadgesVenueFilter): boolean {
  if (filter === 'All') return true
  if (!site?.trim()) return false
  const s = site.toLowerCase()
  if (filter === 'Garrison') return s.includes('garrison')
  if (filter === 'Spirits') return s.includes('spirits')
  if (filter === 'Bassment') return s.includes('bassment') || s.includes('bass')
  return true
}

function StaffAchievementRow({
  name,
  badges,
}: {
  name: string
  badges: StaffBadgeEntry[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [fadeEdges, setFadeEdges] = useState(false)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => setFadeEdges(el.scrollWidth > el.clientWidth + 1)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [badges])

  const fadePx = 40
  const maskStyle = fadeEdges
    ? {
        WebkitMaskImage: `linear-gradient(90deg, transparent 0px, #000 ${fadePx}px, #000 calc(100% - ${fadePx}px), transparent 100%)`,
        maskImage: `linear-gradient(90deg, transparent 0px, #000 ${fadePx}px, #000 calc(100% - ${fadePx}px), transparent 100%)`,
      }
    : undefined

  const count = badges.length

  return (
    <div className="flex items-center gap-2 py-2 pl-3 pr-3 sm:gap-3 sm:pl-4 sm:pr-4">
      <div className="min-w-0 max-w-[40%] shrink-0 sm:max-w-[220px]">
        <span className="block min-w-0 truncate text-sm font-medium leading-tight text-foreground">{name}</span>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'min-h-[40px] min-w-0 flex-1 overflow-x-auto overflow-y-hidden py-0.5',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        style={maskStyle}
      >
        <div className="mx-auto flex w-max items-center justify-center gap-1.5 sm:gap-2">
          {badges.length === 0 ? (
            <span className="text-[11px] text-muted-foreground/60">—</span>
          ) : (
            badges.map(({ achievement, userAchievement }) => (
              <span key={achievement.id} className="shrink-0" title={achievement.name}>
                <AchievementBadge
                  achievement={achievement}
                  userAchievement={userAchievement}
                  size="2xs"
                  showProgress={false}
                  showLabel={false}
                  showCompletionMark={false}
                />
              </span>
            ))
          )}
        </div>
      </div>

      <div className="shrink-0 tabular-nums">
        <span className="inline-flex min-w-[1.5rem] justify-end text-xs font-semibold text-muted-foreground">
          {count}
        </span>
      </div>
    </div>
  )
}

export function ManagerStaffAchievements() {
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sortBy, setSortBy] = useState<StaffBadgesSortOption>('role_then_name')
  const [filterBy, setFilterBy] = useState<StaffBadgesVenueFilter>('All')

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (refreshKey === 0) {
        setError(null)
      }
      setLoading(true)
      try {
        const res = await fetch('/api/achievements/manager/staff-achievements', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load staff achievements')
        if (!cancelled) {
          setStaff(data.staff || [])
          setError(null)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load staff achievements')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  useEffect(() => {
    const onSort = (e: Event) => {
      const ce = e as CustomEvent<{ sort?: StaffBadgesSortOption }>
      const s = ce.detail?.sort
      if (s) setSortBy(s)
    }
    const onFilter = (e: Event) => {
      const ce = e as CustomEvent<{ filter?: StaffBadgesVenueFilter }>
      const f = ce.detail?.filter
      if (f) setFilterBy(f)
    }
    const onRefresh = () => setRefreshKey((k) => k + 1)

    window.addEventListener(STAFF_BADGES_DOCK_SET_SORT, onSort as EventListener)
    window.addEventListener(STAFF_BADGES_DOCK_SET_FILTER, onFilter as EventListener)
    window.addEventListener(STAFF_BADGES_DOCK_REFRESH, onRefresh)

    return () => {
      window.removeEventListener(STAFF_BADGES_DOCK_SET_SORT, onSort as EventListener)
      window.removeEventListener(STAFF_BADGES_DOCK_SET_FILTER, onFilter as EventListener)
      window.removeEventListener(STAFF_BADGES_DOCK_REFRESH, onRefresh)
    }
  }, [])

  const displayedStaff = useMemo(() => {
    const filtered = staff.filter((s) => matchesVenueFilter(s.site, filterBy))
    const list = [...filtered]

    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_desc':
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
        case 'badges_desc':
          return b.badges.length - a.badges.length
        case 'badges_asc':
          return a.badges.length - b.badges.length
        case 'role_then_name': {
          const ra = roleRank(a.role)
          const rb = roleRank(b.role)
          if (ra !== rb) return ra - rb
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        }
        case 'name_asc':
        default:
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      }
    })

    return list
  }, [staff, filterBy, sortBy])

  if (loading && staff.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e]">
        <CardContent className="divide-y divide-border/35 p-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-2 pl-3 pr-3 sm:gap-3 sm:pl-4 sm:pr-4">
              <div className="h-3.5 w-[30%] max-w-[160px] animate-pulse rounded bg-white/[0.08]" />
              <div className="flex min-h-[40px] flex-1 items-center justify-center gap-2">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
              </div>
              <div className="h-3 w-4 animate-pulse rounded bg-white/[0.08]" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error && staff.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-red-500/25 bg-[#1e1e1e]">
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (staff.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e]">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No accounts to show yet.</p>
        </CardContent>
      </Card>
    )
  }

  if (displayedStaff.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e]">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No one matches this venue filter.</p>
          <p className="mt-1 text-xs text-muted-foreground/80">Try &quot;All venues&quot; in the dock.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e] shadow-sm shadow-black/20',
        loading && staff.length > 0 && 'opacity-70 transition-opacity',
      )}
    >
      <CardContent className="divide-y divide-border/35 p-0">
        {displayedStaff.map((s) => (
          <StaffAchievementRow key={s.id} name={s.name} badges={s.badges} />
        ))}
      </CardContent>
    </Card>
  )
}
