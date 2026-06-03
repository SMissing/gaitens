'use client'

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'

export function DailyCheckInChip() {
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null)

  useEffect(() => {
    // Read-only — streak only increments via training activity (module or practice completion)
    fetch('/api/checkin')
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (data) setStreak({ current: data.currentStreak, longest: data.longestStreak })
      })
      .catch(() => {})
  }, [])

  if (!streak) return null

  return (
    <div className="flex items-center gap-2 select-none">
      <Flame className="h-5 w-5 flex-shrink-0 text-orange-500 fill-orange-500/60" />
      <div className="flex items-end gap-1.5">
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">cur</span>
          <span className="text-sm font-bold text-foreground leading-none">{streak.current}</span>
        </div>
        <span className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">days</span>
        <div className="flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none mb-0.5">best</span>
          <span className="text-sm font-bold text-foreground leading-none">{streak.longest}</span>
        </div>
      </div>
    </div>
  )
}
