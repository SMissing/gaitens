'use client'

import { useEffect, useState } from 'react'
import type { Achievement } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'

type StaffRow = {
  id: string
  name: string
  staffCode: string
  achievements: Array<{ id: string; name: string }>
}

export function ManagerStaffAchievements() {
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/achievements/manager/staff-achievements', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load staff achievements')
        if (!cancelled) setStaff(data.staff || [])
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
  }, [])

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>
  }

  return (
    <div className="grid gap-4">
      {staff.map((s) => (
        <Card key={s.id} className="bg-card/80 backdrop-blur-sm rounded-xl border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-semibold text-foreground">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.staffCode}</div>
            </div>
            {s.achievements.length === 0 ? (
              <div className="text-xs text-muted-foreground">No completed badges yet.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {s.achievements.map((a) => (
                  <span
                    key={a.id}
                    className="px-2 py-1 text-xs rounded-md border border-spirits-magenta/30 bg-spirits-magenta/10 text-spirits-magenta"
                    title={a.name}
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

