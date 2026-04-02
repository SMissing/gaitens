'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, Loader2 } from 'lucide-react'
import type { Achievement } from '@/types/database'
import { formatStaffNameAndVenue } from '@/lib/staff-display'

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

export function ManagerBadgeRequestsClient() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

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

  useEffect(() => {
    load()
  }, [load])

  const resolve = async (id: string, action: 'approve' | 'decline') => {
    setActingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/achievements/badge-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Action failed')
        return
      }
      await load()
    } finally {
      setActingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-spirits-cyan" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No pending badge requests. When staff request a badge from their Achievements page, they
        will appear here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
      {requests.map((r) => {
        const ach = r.achievement
        const person = r.requester
        const busy = actingId === r.id
        return (
          <Card key={r.id} className="p-4 border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-foreground truncate">
                  {ach?.name ?? 'Unknown badge'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatStaffNameAndVenue(person?.name ?? 'Staff', person?.site)}
                </p>
                {ach?.description && (
                  <p className="text-sm text-foreground/90 pt-1 line-clamp-3">{ach.description}</p>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  Requested {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-500 sm:hover:bg-red-500/10"
                  disabled={busy}
                  onClick={() => resolve(r.id, 'decline')}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  <span className="ml-1">Decline</span>
                </Button>
                <Button
                  size="sm"
                  className="bg-spirits-cyan/90 text-background sm:hover:bg-spirits-cyan"
                  disabled={busy}
                  onClick={() => resolve(r.id, 'approve')}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span className="ml-1">Approve</span>
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
