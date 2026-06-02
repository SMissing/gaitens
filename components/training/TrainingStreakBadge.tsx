'use client'

import { useEffect, useState } from 'react'
import { getStreak } from '@/lib/training-xp'

export function TrainingStreakBadge() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setStreak(getStreak())
  }, [])

  if (streak === 0) return null

  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-400">
      <span className="text-base leading-none">🔥</span>
      <span>{streak}-day streak</span>
    </div>
  )
}
