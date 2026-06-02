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
    if (!waitForAchievements) {
      setAchievementsReady(true)
      return
    }

    const handleAchievementsReady = () => setAchievementsReady(true)
    window.addEventListener('achievements-ready', handleAchievementsReady)

    // Safety fallback — if the event never fires (e.g. component error), unblock after 30s
    const fallback = setTimeout(() => setAchievementsReady(true), 30000)

    return () => {
      window.removeEventListener('achievements-ready', handleAchievementsReady)
      clearTimeout(fallback)
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
