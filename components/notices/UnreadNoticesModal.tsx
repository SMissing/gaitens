'use client'

import { useState, useEffect, useCallback } from 'react'
import { NoticeModal } from './NoticeModal'
import type { Notice } from '@/types/database'

interface UnreadNoticesModalProps {
  waitForAchievements?: boolean // Wait for achievements to finish before showing
}

export function UnreadNoticesModal({ waitForAchievements = true }: UnreadNoticesModalProps) {
  const [unreadNotices, setUnreadNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [achievementsReady, setAchievementsReady] = useState(!waitForAchievements)

  useEffect(() => {
    // Check if achievements are already done (in case component mounts after achievements finish)
    const checkAchievementsStatus = () => {
      // Check if there's an achievement notification visible
      const achievementModal = document.querySelector('[style*="z-index: 99999"]')
      if (!achievementModal && waitForAchievements) {
        // No achievement modal visible, assume ready (or check localStorage)
        setAchievementsReady(true)
      }
    }

    // Listen for achievement completion event
    const handleAchievementsReady = () => {
      setAchievementsReady(true)
    }

    if (waitForAchievements) {
      // Check immediately
      checkAchievementsStatus()
      // Also listen for the event
      window.addEventListener('achievements-ready', handleAchievementsReady)
      // Check periodically in case we missed the event
      const interval = setInterval(checkAchievementsStatus, 1000)
      return () => {
        window.removeEventListener('achievements-ready', handleAchievementsReady)
        clearInterval(interval)
      }
    } else {
      setAchievementsReady(true)
    }
  }, [waitForAchievements])

  useEffect(() => {
    // Only fetch and show notices after achievements are ready
    if (!achievementsReady) return

    // Fetch unread notices
    const fetchUnreadNotices = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/notices/unread')
        if (response.ok) {
          const data = await response.json()
          if (data.notices && data.notices.length > 0) {
            setUnreadNotices(data.notices)
            setShowModal(true)
          }
        }
      } catch (error) {
        console.error('Error fetching unread notices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadNotices()
  }, [achievementsReady])

  const handleMarkAsRead = useCallback(async (noticeId: string) => {
    try {
      const response = await fetch(`/api/notices/${noticeId}/read`, {
        method: 'POST',
      })
      if (!response.ok) {
        console.error('Failed to mark notice as read')
      }
    } catch (error) {
      console.error('Error marking notice as read:', error)
    }
  }, [])

  const handleClose = () => {
    setShowModal(false)
    // Remove the notices that were shown from the list
    setUnreadNotices([])
  }

  if (loading || !showModal || unreadNotices.length === 0) {
    return null
  }

  return (
    <NoticeModal
      notices={unreadNotices}
      onClose={handleClose}
      onMarkAsRead={handleMarkAsRead}
    />
  )
}
