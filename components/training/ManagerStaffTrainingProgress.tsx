'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  STAFF_BADGES_DOCK_REFRESH,
  STAFF_BADGES_DOCK_SET_FILTER,
  STAFF_BADGES_DOCK_SET_SORT,
  type StaffBadgesSortOption,
  type StaffBadgesVenueFilter,
} from '@/lib/staff-badges-dock-bridge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookOpen, CheckCircle, Users } from 'lucide-react'

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

  const incompleteCount = displayedStaff.filter(
    (s) => s.totalModules > 0 && s.completedCount < s.totalModules,
  ).length

  const startedCount = displayedStaff.filter(
    (s) => s.totalModules > 0 && s.completedCount >= 1,
  ).length

  // ── Hero section (shared across all states) ───────────────────────────────
  const Hero = () => (
    <div className="px-5 pt-4 pb-8">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">
        Gaitens Leisure
      </p>
      <h1 className="text-4xl font-black text-white leading-none tracking-tight">
        Staff
        <br />
        <span className="text-white/90">Training</span>
      </h1>
      <Link
        href="/manager/training"
        className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/35 hover:text-white/60 transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Manage modules →
      </Link>

      {!loading && staff.length > 0 && (
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-spirits-cyan/15 text-spirits-cyan rounded-2xl px-3 py-1.5 border border-spirits-cyan/20">
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-black text-sm tabular-nums">{displayedStaff.length}</span>
            <span className="text-xs text-spirits-cyan/60 font-medium">
              {displayedStaff.length === 1 ? 'staff member' : 'staff members'}
            </span>
          </div>
          {startedCount > 0 && (
            <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 rounded-2xl px-3 py-1.5 border border-green-500/20">
              <span className="font-black text-sm tabular-nums">{startedCount}</span>
              <span className="text-xs text-green-400/60 font-medium">started</span>
            </div>
          )}
          {incompleteCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 rounded-2xl px-3 py-1.5 border border-amber-500/20">
              <span className="font-black text-sm tabular-nums">{incompleteCount}</span>
              <span className="text-xs text-amber-400/60 font-medium">incomplete</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading && staff.length === 0) {
    return (
      <div>
        <Hero />
        <div className="px-4 space-y-2 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error && staff.length === 0) {
    return (
      <div>
        <Hero />
        <div className="mx-4 rounded-2xl border border-red-500/25 bg-red-500/5 px-4 py-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (staff.length === 0) return null

  // ── No filter match ───────────────────────────────────────────────────────
  if (displayedStaff.length === 0) {
    return (
      <div>
        <Hero />
        <div className="mx-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] py-12 text-center">
          <p className="text-white/40 text-sm">No one matches this venue filter.</p>
        </div>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <>
      <Hero />

      <div className="px-4 pb-6">
        {/* Staff list */}
        <div
          className={cn(
            'rounded-2xl border border-white/10 overflow-hidden',
            loading && staff.length > 0 && 'opacity-70 transition-opacity',
          )}
        >
          {displayedStaff.map((s, idx) => {
            const pct = s.totalModules > 0 ? Math.round((s.completedCount / s.totalModules) * 100) : 0
            const allDone = s.totalModules > 0 && s.completedCount === s.totalModules

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setDetailFor(s)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3.5 text-left',
                  'min-h-[56px] transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirits-cyan/40',
                  idx < displayedStaff.length - 1 && 'border-b border-white/[0.06]',
                )}
              >
                {/* Avatar initial */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-spirits-cyan/10 border border-spirits-cyan/20 flex items-center justify-center text-spirits-cyan text-xs font-black">
                  {s.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + progress bar */}
                <div className="min-w-0 flex-1">
                  <span className="block min-w-0 truncate text-sm font-semibold text-white">{s.name}</span>
                  {s.totalModules > 0 && (
                    <div className="mt-1 h-1 w-full max-w-[160px] rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          allDone ? 'bg-green-400/70' : 'bg-spirits-cyan/60',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Completion count */}
                <div className="shrink-0">
                  {s.totalModules === 0 ? (
                    <span className="text-xs font-semibold text-white/25">—</span>
                  ) : allDone ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {s.completedCount}/{s.totalModules}
                    </span>
                  ) : (
                    <span className="tabular-nums text-xs font-semibold text-white/40">
                      {s.completedCount}/{s.totalModules}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Summary footer */}
        {incompleteCount > 0 && (
          <p className="mt-4 text-xs text-white/35 px-1">
            <span className="font-semibold text-white/55">{incompleteCount}</span>
            {' '}
            {incompleteCount === 1 ? 'staff member has' : 'staff members have'} modules to complete — consider assigning a deadline or following up directly.
          </p>
        )}
      </div>

      {/* Detail dialog */}
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
                      <li
                        key={m.courseId}
                        className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                      >
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
