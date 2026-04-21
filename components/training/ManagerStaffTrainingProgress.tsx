'use client'

import { useEffect, useMemo, useState } from 'react'
import type { UserRole } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  STAFF_BADGES_DOCK_REFRESH,
  STAFF_BADGES_DOCK_SET_FILTER,
  STAFF_BADGES_DOCK_SET_SORT,
  type StaffBadgesSortOption,
  type StaffBadgesVenueFilter,
} from '@/lib/staff-badges-dock-bridge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GraduationCap } from 'lucide-react'

type CompletedModule = {
  courseId: string
  title: string
  completedAt: string
}

type StaffTrainingProgressRow = {
  id: string
  name: string
  site: string | null
  role: UserRole
  totalModules: number
  completedCount: number
  completedModules: CompletedModule[]
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

function formatCompletedAt(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function ManagerStaffTrainingProgress() {
  const [staff, setStaff] = useState<StaffTrainingProgressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sortBy, setSortBy] = useState<StaffBadgesSortOption>('role_then_name')
  const [filterBy, setFilterBy] = useState<StaffBadgesVenueFilter>('All')
  const [detailFor, setDetailFor] = useState<StaffTrainingProgressRow | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (refreshKey === 0) {
        setError(null)
      }
      setLoading(true)
      try {
        const res = await fetch('/api/training/manager/staff-progress', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load training progress')
        if (!cancelled) {
          setStaff(data.staff || [])
          setError(null)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load training progress')
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
          return b.completedCount - a.completedCount
        case 'badges_asc':
          return a.completedCount - b.completedCount
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
        <CardHeader className="pb-2">
          <div className="h-5 w-48 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-2 h-3 w-full max-w-md animate-pulse rounded bg-white/[0.06]" />
        </CardHeader>
        <CardContent className="divide-y divide-border/35 p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-3 pl-3 pr-3 sm:pl-4 sm:pr-4">
              <div className="h-3.5 w-[32%] max-w-[180px] animate-pulse rounded bg-white/[0.08]" />
              <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-white/[0.08]" />
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
    return null
  }

  if (displayedStaff.length === 0) {
    return (
      <Card className="overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-spirits-cyan" />
            Training completed
          </CardTitle>
          <CardDescription>Modules completed per account (non-expired completions).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No one matches this venue filter.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden rounded-2xl border border-border/50 bg-[#1e1e1e] shadow-sm shadow-black/20',
          loading && staff.length > 0 && 'opacity-70 transition-opacity',
        )}
      >
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-spirits-cyan" />
            Training completed
          </CardTitle>
          <CardDescription>
            Modules available to each account vs completed (current, non-expired). Open a row for module
            names. Use the dock to filter by venue, sort by training completion or name, or refresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/35 p-0">
          {displayedStaff.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setDetailFor(s)}
              className={cn(
                'flex w-full items-center gap-2 py-3 pl-3 pr-3 text-left sm:gap-3 sm:pl-4 sm:pr-4',
                'min-h-[48px] transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirits-cyan/40',
              )}
            >
              <div className="min-w-0 flex-1">
                <span className="block min-w-0 truncate text-sm font-medium text-foreground">{s.name}</span>
              </div>
              <span className="shrink-0 tabular-nums text-xs font-semibold text-muted-foreground">
                {s.totalModules === 0
                  ? '—'
                  : `${s.completedCount}/${s.totalModules} modules completed`}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={detailFor !== null} onOpenChange={(open) => !open && setDetailFor(null)}>
        <DialogContent className="max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{detailFor?.name ?? 'Training'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-4 pb-6 sm:px-6">
            {detailFor && (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {detailFor.totalModules === 0
                    ? 'No training modules are assigned to this account’s venues.'
                    : `${detailFor.completedCount} of ${detailFor.totalModules} available modules completed.`}
                </p>
                {detailFor.completedModules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed modules yet.</p>
                ) : (
                  <ul className="space-y-3 border-t border-border/35 pt-4">
                    {detailFor.completedModules.map((m) => (
                      <li key={m.courseId} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <span className="text-sm font-medium text-foreground">{m.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Completed {formatCompletedAt(m.completedAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
