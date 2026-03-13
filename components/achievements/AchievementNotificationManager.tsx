'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AchievementNotification } from './AchievementNotification'
import type { Achievement, UserAchievement } from '@/types/database'

interface AchievementNotificationManagerProps {
  userId: string
  onAllAchievementsShown?: () => void // Callback when all achievements are shown
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

  // Get viewed achievement progress increments from localStorage
  // Format: "userAchievementId_progress" (e.g., "abc123_1", "abc123_2", "abc123_3")
  const getViewedAchievementProgress = useCallback((): Set<string> => {
    if (typeof window === 'undefined') return new Set()
    const stored = localStorage.getItem(`viewed_achievements_${userId}`)
    if (!stored) return new Set()
    try {
      const ids = JSON.parse(stored) as string[]
      return new Set(ids)
    } catch {
      return new Set()
    }
  }, [userId])

  // Mark achievement progress increment as viewed in localStorage
  // For progress-based achievements, each increment gets its own key
  const markAchievementAsViewed = useCallback((userAchievementId: string, currentProgress: number) => {
    if (typeof window === 'undefined') return
    const viewed = getViewedAchievementProgress()
    // Create a unique key for this specific progress increment
    const progressKey = `${userAchievementId}_${currentProgress}`
    viewed.add(progressKey)
    localStorage.setItem(`viewed_achievements_${userId}`, JSON.stringify(Array.from(viewed)))
  }, [userId, getViewedAchievementProgress])

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
        const viewedProgress = getViewedAchievementProgress()

        // Find all achievement progress increments that haven't been viewed yet
        const unviewedAchievements = achievements
          .filter((ua: any) => {
            if (!ua.awardedAt || !ua.achievement) return false
            // Check if this specific progress increment has been viewed
            const progressKey = `${ua.id}_${ua.currentProgress || 1}`
            return !viewedProgress.has(progressKey)
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
  }, [userId, getViewedAchievementProgress, onAllAchievementsShown])

  // Poll for new achievements after initial load (for real-time awards)
  useEffect(() => {
    if (isInitialLoad) return // Don't poll during initial load

    const checkForNewAchievements = async () => {
      try {
        const response = await fetch(`/api/achievements/user/${userId}`)
        if (!response.ok) return

        const data = await response.json()
        const achievements = data.achievements || []
        const viewedProgress = getViewedAchievementProgress()

        // Find newly awarded achievements (awarded in the last 10 seconds)
        const now = new Date()
        const recentAchievements = achievements.filter((ua: any) => {
          if (!ua.awardedAt || !ua.achievement) return false
          const awardedAt = new Date(ua.awardedAt)
          const timeDiff = now.getTime() - awardedAt.getTime()
          // Check if this specific progress increment has been viewed
          const progressKey = `${ua.id}_${ua.currentProgress || 1}`
          return timeDiff < 10000 && timeDiff > 0 && !viewedProgress.has(progressKey)
        })

        // Add to queue if not already showing something
        if (recentAchievements.length > 0 && !currentNotification) {
          const newest = recentAchievements.sort((a: any, b: any) => 
            new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()
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
  }, [userId, isInitialLoad, currentNotification, getViewedAchievementProgress])

  const handleClose = useCallback(() => {
    if (!currentNotification) return

    // Mark current achievement progress increment as viewed
    markAchievementAsViewed(
      currentNotification.userAchievement.id,
      currentNotification.userAchievement.currentProgress || 1
    )

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
  }, [currentNotification, achievementQueue, markAchievementAsViewed, onAllAchievementsShown])

  if (!currentNotification) return null

  return (
    <AchievementNotification
      achievement={currentNotification.achievement}
      userAchievement={currentNotification.userAchievement}
      onClose={handleClose}
    />
  )
}
