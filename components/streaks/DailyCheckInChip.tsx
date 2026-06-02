'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { cn } from '@/lib/utils'

export function DailyCheckInChip() {
  const router = useRouter()
  const [streak, setStreak] = useState<{ current: number; longest: number } | null>(null)
  const [justCheckedIn, setJustCheckedIn] = useState(false)

  useEffect(() => {
    const autoCheckIn = async () => {
      try {
        const response = await fetchWithAuth('/api/checkin', { method: 'POST' })
        if (response.ok) {
          const data = await response.json()
          setStreak({ current: data.currentStreak, longest: data.longestStreak })
          if (data.success) {
            setJustCheckedIn(true)
            router.refresh()
            setTimeout(() => setJustCheckedIn(false), 2500)
          }
        }
      } catch {}
    }
    autoCheckIn()
  }, [])

  if (!streak) return null

  return (
    <div className="flex items-center gap-2 select-none">
      <Flame
        className={cn(
          'h-5 w-5 flex-shrink-0 text-orange-500 transition-all duration-300',
          justCheckedIn ? 'fill-orange-500 scale-110' : 'fill-orange-500/60'
        )}
      />
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
