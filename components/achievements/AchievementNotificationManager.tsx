'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AchievementNotification } from './AchievementNotification'
import type { Achievement, UserAchievement } from '@/types/database'

interface AchievementNotificationManagerProps {
  userId: string
  onAllAchievementsShown?: () => void // Callback when all achievements are shown
}

// Helpers for tracking the last time the user saw an achievement notification.
// This uses the `awardedAt` timestamp on `user_achievements` so that:
// - Achievements earned while the app is open show in real time
// - Achievements earned while the user was away show on next login
// - Previously shown achievements are not re-shown every login
const getLastViewedAt = (userId: string): Date | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(`last_achievement_viewed_at_${userId}`)
  if (!stored) return null
  const ts = Date.parse(stored)
  return Number.isNaN(ts) ? null : new Date(ts)
}

const setLastViewedAt = (userId: string, date: Date) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(`last_achievement_viewed_at_${userId}`, date.toISOString())
}

export function AchievementNotificationManager({ userId, onAllAchievementsShown }: AchievementNotificationManagerProps) {
  const [achievementQueue, setAchievementQueue] = useState<Array<{
    achievement: Achievement
    userAchievement: UserAchievement
  }>>([])
  const [currentNotification, setCurrentNotification] = useState<{
    achievement: Achievement
    userAchievement: UserAchievement
  } | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const hasCheckedInitialLoad = useRef(false)

  // Check for unviewed achievements on initial load
  useEffect(() => {
    if (hasCheckedInitialLoad.current) return
    hasCheckedInitialLoad.current = true

    const checkForUnviewedAchievements = async () => {
      try {
        const response = await fetch(`/api/achievements/user/${userId}`)
        if (!response.ok) {
          setIsInitialLoad(false)
          onAllAchievementsShown?.()
          // Dispatch event even on error
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.dispatchEvent(new Event('achievements-ready'))
            }, 100)
          }
          return
        }

        const data = await response.json()
        const achievements = data.achievements || []
        const lastViewedAt = getLastViewedAt(userId)

        // Only show achievements that were awarded AFTER the last time
        // the user saw an achievement notification.
        const unviewedAchievements = achievements
          .filter((ua: any) => {
            if (!ua.awardedAt || !ua.achievement) return false
            const awardedAt = new Date(ua.awardedAt)
            if (!lastViewedAt) return true
            return awardedAt.getTime() > lastViewedAt.getTime()
          })
          .sort((a: any, b: any) =>
            new Date(a.awardedAt).getTime() - new Date(b.awardedAt).getTime() // Oldest first
          )
          .map((ua: any) => ({
            achievement: ua.achievement,
            userAchievement: ua,
          }))

        if (unviewedAchievements.length > 0) {
          setAchievementQueue(unviewedAchievements)
          // Show first achievement immediately
          setCurrentNotification(unviewedAchievements[0])
        } else {
          // No unviewed achievements, mark as ready immediately
          setIsInitialLoad(false)
          onAllAchievementsShown?.()
          // Dispatch event to notify that achievements are ready
          if (typeof window !== 'undefined') {
            // Small delay to ensure event listeners are set up
            setTimeout(() => {
              window.dispatchEvent(new Event('achievements-ready'))
            }, 100)
          }
        }
      } catch (error) {
        console.error('Error checking for unviewed achievements:', error)
        setIsInitialLoad(false)
        onAllAchievementsShown?.()
        // Dispatch event even on error
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new Event('achievements-ready'))
          }, 100)
        }
      }
    }

    checkForUnviewedAchievements()
  }, [userId, onAllAchievementsShown])

  // Poll for new achievements after initial load (for real-time awards)
  useEffect(() => {
    if (isInitialLoad) return // Don't poll during initial load

    const checkForNewAchievements = async () => {
      try {
        const response = await fetch(`/api/achievements/user/${userId}`)
        if (!response.ok) return

        const data = await response.json()
        const achievements = data.achievements || []
        const lastViewedAt = getLastViewedAt(userId)

        // Newly awarded achievements since the last viewed timestamp
        const recentAchievements = achievements.filter((ua: any) => {
          if (!ua.awardedAt || !ua.achievement) return false
          const awardedAt = new Date(ua.awardedAt)
          if (lastViewedAt && awardedAt.getTime() <= lastViewedAt.getTime()) return false
          return true
        })

        // Add to queue if not already showing something
        if (recentAchievements.length > 0 && !currentNotification) {
          const newest = recentAchievements.sort((a: any, b: any) =>
            new Date(a.awardedAt).getTime() - new Date(b.awardedAt).getTime()
          )[0]

          setCurrentNotification({
            achievement: newest.achievement,
            userAchievement: newest,
          })
        }
      } catch (error) {
        console.error('Error checking for new achievements:', error)
      }
    }

    // Check every 5 seconds for new achievements
    const interval = setInterval(checkForNewAchievements, 5000)
    return () => clearInterval(interval)
  }, [userId, isInitialLoad, currentNotification])

  const handleClose = useCallback(() => {
    if (!currentNotification) return

    // Update the last viewed timestamp using this achievement's awardedAt
    const awardedAt = currentNotification.userAchievement.awardedAt
    if (awardedAt) {
      const currentLast = getLastViewedAt(userId)
      const thisAwarded = new Date(awardedAt)
      if (!currentLast || thisAwarded.getTime() > currentLast.getTime()) {
        setLastViewedAt(userId, thisAwarded)
      }
    }

    // Check if there are more in the queue
    if (achievementQueue.length > 1) {
      // Remove current from queue and show next
      const remaining = achievementQueue.slice(1)
      setAchievementQueue(remaining)
      setCurrentNotification(remaining[0])
    } else {
      // No more achievements, clear everything
      setCurrentNotification(null)
      setAchievementQueue([])
      setIsInitialLoad(false)
      onAllAchievementsShown?.()
      // Dispatch event to notify that achievements are ready
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('achievements-ready'))
      }
    }
  }, [currentNotification, achievementQueue, onAllAchievementsShown, userId])

  if (!currentNotification) return null

  return (
    <AchievementNotification
      achievement={currentNotification.achievement}
      userAchievement={currentNotification.userAchievement}
      onClose={handleClose}
    />
  )
}
