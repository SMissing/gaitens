'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame, CheckCircle2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakData {
  checkedInToday: boolean
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null
}

export function DailyCheckInCard() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    fetchStreakData()
  }, [])

  const fetchStreakData = async () => {
    try {
      const response = await fetch('/api/checkin')
      if (response.ok) {
        const data = await response.json()
        setStreakData(data)
      }
    } catch (error) {
      console.error('Error fetching streak data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setStreakData(data)
        // Refresh the page to show any new achievements
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const error = await response.json()
        console.error('Check-in failed:', error)
      }
    } catch (error) {
      console.error('Error checking in:', error)
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <div className="animate-pulse">Loading streak data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!streakData) {
    return null
  }

  const { checkedInToday, currentStreak, longestStreak } = streakData

  // Calculate next milestone
  const milestones = [1, 7, 30, 100]
  const nextMilestone = milestones.find(m => currentStreak < m) || null
  const daysUntilNext = nextMilestone ? nextMilestone - currentStreak : null

  return (
    <Card className={cn(
      "border-2 transition-all",
      checkedInToday 
        ? "border-green-500/50 bg-green-500/5" 
        : "border-orange-500/50 bg-orange-500/5"
    )}>
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                "h-5 w-5",
                checkedInToday ? "text-green-500" : "text-orange-500"
              )} />
              <CardTitle className="text-base sm:text-lg">Daily Check-In</CardTitle>
            </div>
            {checkedInToday && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>

          {/* Current Streak - Condensed */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                "h-6 w-6",
                currentStreak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"
              )} />
              <div>
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentStreak} <span className="text-sm text-muted-foreground font-normal">days</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Longest</p>
              <p className="text-xl font-semibold text-foreground">
                {longestStreak} <span className="text-xs text-muted-foreground font-normal">days</span>
              </p>
            </div>
          </div>

          {/* Next Milestone - Condensed */}
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
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Check-In Button */}
          {!checkedInToday && (
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              size="default"
            >
              {checkingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Checking in...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Check In Today
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DailyCheckInCard