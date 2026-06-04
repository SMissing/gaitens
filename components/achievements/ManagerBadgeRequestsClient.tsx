'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, ChevronDown, ChevronRight, ClipboardCheck } from 'lucide-react'
import type { Achievement } from '@/types/database'
import { formatStaffNameAndVenue } from '@/lib/staff-display'
import { AchievementBadge } from '@/components/achievements/AchievementBadge'
import { getVenueFromSite } from '@/lib/colors'
import { cn } from '@/lib/utils'

type RequestRow = {
  id: string
  userId: string
  achievementId: string
  status: string
  rejectionReason: string | null
  createdAt: string
  achievement: Achievement | null
  requester: { id: string; name: string; site: string | null } | null
}

type CardFlash = { id: string; type: 'approved' | 'declined' }

const VENUE_ORDER = ['Garrison', 'Spirits', 'Bassment', 'Other'] as const
type VenueLabel = typeof VENUE_ORDER[number]

const VENUE_STYLES: Record<VenueLabel, { accent: string; border: string; headerText: string; dot: string }> = {
  Garrison: {
    accent: 'bg-garrison-orange/15 border-garrison-orange/30',
    border: 'border-l-garrison-orange',
    headerText: 'text-garrison-orange',
    dot: 'bg-garrison-orange',
  },
  Spirits: {
    accent: 'bg-spirits-cyan/10 border-spirits-cyan/25',
    border: 'border-l-spirits-cyan',
    headerText: 'text-spirits-cyan',
    dot: 'bg-spirits-cyan',
  },
  Bassment: {
    accent: 'bg-spirits-magenta/10 border-spirits-magenta/25',
    border: 'border-l-spirits-magenta',
    headerText: 'text-spirits-magenta',
    dot: 'bg-spirits-magenta',
  },
  Other: {
    accent: 'bg-white/[0.05] border-white/10',
    border: 'border-l-white/20',
    headerText: 'text-white/50',
    dot: 'bg-white/40',
  },
}

function getVenueLabel(site: string | null): VenueLabel {
  const v = getVenueFromSite(site)
  if (v === 'garrison') return 'Garrison'
  if (v === 'spirits') return 'Spirits'
  if (v === 'bassment') return 'Bassment'
  return 'Other'
}

type StaffRequests = {
  staffId: string
  staffName: string
  staffSite: string | null
  requests: RequestRow[]
}

function RequestCard({
  request,
  busy,
  isFlashing,
  flashType,
  isDeclineOpen,
  declineReason,
  onDeclineReasonChange,
  onOpenDecline,
  onCancelDecline,
  onConfirmDecline,
  onApprove,
}: {
  request: RequestRow
  busy: boolean
  isFlashing: boolean
  flashType: 'approved' | 'declined' | null
  isDeclineOpen: boolean
  declineReason: string
  onDeclineReasonChange: (v: string) => void
  onOpenDecline: () => void
  onCancelDecline: () => void
  onConfirmDecline: () => void
  onApprove: () => void
}) {
  const ach = request.achievement

  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 transition-colors duration-500',
        isFlashing && flashType === 'approved' && 'bg-green-500/10 border-green-500/25',
        isFlashing && flashType === 'declined' && 'bg-red-500/8 border-red-500/20',
      )}
    >
      <div className="flex gap-3">
        {ach && (
          <div className="shrink-0 pt-0.5">
            <AchievementBadge achievement={ach} size="sm" showProgress={false} showLabel={false} />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-semibold text-sm text-white/85 truncate">{ach?.name ?? 'Unknown badge'}</p>
          {ach?.description && (
            <p className="text-xs text-white/35 line-clamp-2">{ach.description}</p>
          )}
          <p className="text-[11px] text-white/25 pt-0.5">
            {new Date(request.createdAt).toLocaleString()}
          </p>

          {isDeclineOpen && (
            <div className="pt-2 space-y-2">
              <textarea
                value={declineReason}
                onChange={(e) => onDeclineReasonChange(e.target.value)}
                placeholder="Optional reason for declining…"
                rows={2}
                className="w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spirits-cyan/40"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-400 sm:hover:bg-red-500/10"
                  disabled={busy}
                  onClick={onConfirmDecline}
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  <span className="ml-1">Confirm</span>
                </Button>
                <Button size="sm" variant="outline" className="border-white/15 text-white/50" onClick={onCancelDecline} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isDeclineOpen && (
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/40 text-red-400 sm:hover:bg-red-500/10"
              disabled={busy || isFlashing}
              onClick={onOpenDecline}
            >
              <X className="h-3.5 w-3.5" />
              <span className="ml-1">Decline</span>
            </Button>
            <Button
              size="sm"
              className="bg-spirits-cyan/85 text-background sm:hover:bg-spirits-cyan"
              disabled={busy || isFlashing}
              onClick={onApprove}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              <span className="ml-1">Approve</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StaffSection({ staff, actingId, flash, decliningId, declineReasons, onResolve, onOpenDecline, onCancelDecline, onReasonChange }: {
  staff: StaffRequests
  actingId: string | null
  flash: CardFlash | null
  decliningId: string | null
  declineReasons: Record<string, string>
  onResolve: (id: string, action: 'approve' | 'decline', reason?: string) => void
  onOpenDecline: (id: string) => void
  onCancelDecline: () => void
  onReasonChange: (id: string, v: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors sm:hover:bg-white/[0.04] touch-manipulation"
      >
        {open
          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30" />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/30" />
        }
        <span className="text-sm font-semibold text-white/75">{staff.staffName}</span>
        <span className="ml-auto shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/45">
          {staff.requests.length}
        </span>
      </button>

      {open && (
        <div className="mt-1 ml-6 space-y-2">
          {staff.requests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              busy={actingId === r.id}
              isFlashing={flash?.id === r.id}
              flashType={flash?.id === r.id ? flash.type : null}
              isDeclineOpen={decliningId === r.id}
              declineReason={declineReasons[r.id] ?? ''}
              onDeclineReasonChange={(v) => onReasonChange(r.id, v)}
              onOpenDecline={() => onOpenDecline(r.id)}
              onCancelDecline={onCancelDecline}
              onConfirmDecline={() => onResolve(r.id, 'decline', declineReasons[r.id])}
              onApprove={() => onResolve(r.id, 'approve')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function VenueSection({ venue, staffList, actingId, flash, decliningId, declineReasons, onResolve, onOpenDecline, onCancelDecline, onReasonChange }: {
  venue: VenueLabel
  staffList: StaffRequests[]
  actingId: string | null
  flash: CardFlash | null
  decliningId: string | null
  declineReasons: Record<string, string>
  onResolve: (id: string, action: 'approve' | 'decline', reason?: string) => void
  onOpenDecline: (id: string) => void
  onCancelDecline: () => void
  onReasonChange: (id: string, v: string) => void
}) {
  const [open, setOpen] = useState(true)
  const styles = VENUE_STYLES[venue]
  const totalRequests = staffList.reduce((n, s) => n + s.requests.length, 0)

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all touch-manipulation',
          styles.accent,
          'sm:hover:opacity-90',
        )}
      >
        <span className={cn('h-2 w-2 rounded-full shrink-0', styles.dot)} />
        <span className={cn('text-sm font-black tracking-tight flex-1', styles.headerText)}>
          {venue}
        </span>
        <span className="text-xs text-white/35 font-medium tabular-nums">
          {staffList.length} staff · {totalRequests} request{totalRequests !== 1 ? 's' : ''}
        </span>
        {open
          ? <ChevronDown className="h-4 w-4 shrink-0 text-white/25" />
          : <ChevronRight className="h-4 w-4 shrink-0 text-white/25" />
        }
      </button>

      {open && (
        <div className={cn('mt-2 ml-1 pl-3 border-l-2', styles.border)}>
          {staffList.map((staff) => (
            <StaffSection
              key={staff.staffId}
              staff={staff}
              actingId={actingId}
              flash={flash}
              decliningId={decliningId}
              declineReasons={declineReasons}
              onResolve={onResolve}
              onOpenDecline={onOpenDecline}
              onCancelDecline={onCancelDecline}
              onReasonChange={onReasonChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ManagerBadgeRequestsClient() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)
  const [declineReasons, setDeclineReasons] = useState<Record<string, string>>({})
  const [flash, setFlash] = useState<CardFlash | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const res = await fetch('/api/achievements/badge-requests?status=pending')
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Failed to load requests')
      setRequests([])
      setLoading(false)
      return
    }
    const data = await res.json()
    setRequests(data.requests || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const resolve = async (id: string, action: 'approve' | 'decline', reason?: string) => {
    setActingId(id)
    setError(null)
    try {
      const body: Record<string, string> = { action }
      if (action === 'decline' && reason?.trim()) body.rejectionReason = reason.trim()
      const res = await fetch(`/api/achievements/badge-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Action failed')
        return
      }
      setFlash({ id, type: action === 'approve' ? 'approved' : 'declined' })
      setTimeout(() => {
        setFlash(null)
        setDecliningId(null)
        setDeclineReasons((prev) => { const n = { ...prev }; delete n[id]; return n })
        load()
      }, 800)
    } finally {
      setActingId(null)
    }
  }

  // Group by venue → then by staff
  const venueGroups = useMemo(() => {
    const map = new Map<VenueLabel, Map<string, StaffRequests>>()
    for (const v of VENUE_ORDER) map.set(v, new Map())

    for (const r of requests) {
      const venue = getVenueLabel(r.requester?.site ?? null)
      const staffId = r.requester?.id ?? 'unknown'
      const staffMap = map.get(venue)!
      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staffId,
          staffName: r.requester?.name ?? 'Unknown',
          staffSite: r.requester?.site ?? null,
          requests: [],
        })
      }
      staffMap.get(staffId)!.requests.push(r)
    }

    return map
  }, [requests])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-spirits-cyan" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ClipboardCheck className="h-12 w-12 text-white/15" />
        <p className="text-sm text-white/35">No pending badge requests.</p>
        <p className="text-xs text-white/20 max-w-xs">
          When staff request a badge from their Achievements page, they will appear here grouped by venue.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {error && (
        <p className="text-sm text-red-400 text-center pb-2" role="alert">{error}</p>
      )}
      {VENUE_ORDER
        .filter((v) => (venueGroups.get(v)?.size ?? 0) > 0)
        .map((venue) => (
          <VenueSection
            key={venue}
            venue={venue}
            staffList={Array.from(venueGroups.get(venue)!.values())}
            actingId={actingId}
            flash={flash}
            decliningId={decliningId}
            declineReasons={declineReasons}
            onResolve={resolve}
            onOpenDecline={(id) => setDecliningId(id)}
            onCancelDecline={() => setDecliningId(null)}
            onReasonChange={(id, v) => setDeclineReasons((prev) => ({ ...prev, [id]: v }))}
          />
        ))}
    </div>
  )
}
