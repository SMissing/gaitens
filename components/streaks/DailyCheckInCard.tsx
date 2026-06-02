'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Flame, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { AnimatePresence, motion } from 'motion/react'

interface StreakData {
  currentStreak: number
  longestStreak: number
}

export function DailyCheckInCard() {
  const router = useRouter()
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [justCheckedIn, setJustCheckedIn] = useState(false)

  useEffect(() => {
    const autoCheckIn = async () => {
      try {
        const response = await fetchWithAuth('/api/checkin', { method: 'POST' })
        if (response.ok) {
          const data = await response.json()
          setStreakData({
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
          })
          if (data.success) {
            setJustCheckedIn(true)
            router.refresh()
            setTimeout(() => setJustCheckedIn(false), 2800)
          }
        }
      } catch (error) {
        console.error('Error auto checking in:', error)
      } finally {
        setLoading(false)
      }
    }
    autoCheckIn()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse h-3 bg-muted rounded w-1/3 mx-auto" />
        </CardContent>
      </Card>
    )
  }

  if (!streakData) return null

  const { currentStreak, longestStreak } = streakData

  const milestones = [1, 7, 30, 100]
  const nextMilestone = milestones.find(m => currentStreak < m) || null
  const daysUntilNext = nextMilestone ? nextMilestone - currentStreak : null

  return (
    <Card className={cn(
      'border-2 transition-all duration-500',
      justCheckedIn
        ? 'border-orange-500/60 bg-orange-500/8'
        : 'border-green-500/40 bg-green-500/5'
    )}>
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                'h-5 w-5 transition-colors',
                justCheckedIn ? 'text-orange-500' : 'text-green-500'
              )} />
              <CardTitle className="text-base sm:text-lg">Daily Check-In</CardTitle>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>

          {/* Streak numbers with +1 animation */}
          <div className="relative flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50 overflow-hidden">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                'h-6 w-6 transition-colors',
                currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground',
                justCheckedIn && 'animate-pulse'
              )} />
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
                  <span className="text-sm text-muted-foreground font-normal">days</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Longest</p>
              <p className="text-xl font-semibold text-foreground">
                {longestStreak}{' '}
                <span className="text-xs text-muted-foreground font-normal">days</span>
              </p>
            </div>

            {/* +1 day badge — floats up and fades out */}
            <AnimatePresence>
              {justCheckedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.9 }}
                  transition={{ type: 'spring', bounce: 0.35, duration: 0.45 }}
                  className="absolute top-1.5 right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg pointer-events-none"
                >
                  +1 day
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next milestone progress bar */}
          {nextMilestone && daysUntilNext !== null && (
            <div className="p-2.5 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-muted-foreground">
                  Next: <span className="font-semibold text-foreground">{nextMilestone}-day badge</span>
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'} left
                </p>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                  style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DailyCheckInCard
