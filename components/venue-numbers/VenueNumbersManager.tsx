'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, TrendingUp } from 'lucide-react'

type VenueStaffStat = {
  id: string
  name: string
  staffCode: string
  sharedCount: number
  lastSharedAt: string | null
}

function formatTimeAgo(iso: string) {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const sec = Math.floor(diffMs / 1000)

  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`

  const days = Math.floor(hr / 24)
  return `${days}d ago`
}

export function VenueNumbersManager() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staff, setStaff] = useState<VenueStaffStat[]>([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/venue-numbers/manager')
        if (!res.ok) {
          const json = await res.json().catch(() => null)
          setError(json?.error || 'Failed to load venue numbers stats')
          return
        }
        const json = await res.json()
        setStaff(json.staff || [])
      } catch {
        setError('Network error while loading stats.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const total = staff.reduce((acc, s) => acc + (s.sharedCount || 0), 0)

  return (
    <div className="space-y-4">
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-spirits-cyan" />
                <h2 className="text-lg font-semibold">Shared Counts</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Total submissions across all staff (MVP logging).
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total entries</div>
              <div className="text-3xl font-bold text-foreground">{total}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-base font-semibold text-foreground mb-3">By Staff</h3>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : staff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No venue number shares recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {staff.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background/20"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.staffCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-foreground font-semibold">{s.sharedCount}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.lastSharedAt ? formatTimeAgo(s.lastSharedAt) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

