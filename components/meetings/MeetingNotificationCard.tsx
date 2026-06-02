'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { MeetingModal } from './MeetingModal'

interface Meeting {
  id: string
  title: string
  description: string | null
  requestedBy: {
    id: string
    name: string
    site: string | null
  } | null
  requestedFor: {
    id: string
    name: string
    site: string | null
  } | null
  status: string
  suggestedDate: string
  suggestedTime: string | null
  meetingDate: string | null
  meetingTime: string | null
  rescheduleReason: string | null
}

interface MeetingNotificationCardProps {
  userId: string
}

export function MeetingNotificationCard({ userId }: MeetingNotificationCardProps) {
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingMeetings()
  }, [userId])

  const fetchPendingMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meetings?type=pending')

      if (!response.ok) {
        setPendingMeetings([])
        return
      }

      const data = await response.json()

      if (!data.meetings || !Array.isArray(data.meetings)) {
        setPendingMeetings([])
        return
      }

      const userMeetings = data.meetings.filter((m: Meeting) => {
        if (!m.requestedBy || !m.requestedFor) return false

        const isRecipient = m.requestedFor.id === userId
        const isRequester = m.requestedBy.id === userId

        if (isRecipient && ['pending', 'reschedule_requested', 'reschedule_proposed'].includes(m.status)) return true
        if (isRequester && ['pending', 'reschedule_requested'].includes(m.status)) return true

        return false
      })

      setPendingMeetings(userMeetings)
    } catch (err) {
      setPendingMeetings([])
    } finally {
      setLoading(false)
    }
  }

  if (loading || pendingMeetings.length === 0) {
    return null
  }

  const nextMeeting = pendingMeetings[0] // Show the most recent pending meeting

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const isRequester = nextMeeting.requestedBy?.id === userId
  const isRescheduleRequest = nextMeeting.status === 'reschedule_requested'
  const requesterName = nextMeeting.requestedBy?.name || 'Unknown'
  const recipientName = nextMeeting.requestedFor?.name || 'Unknown'
  
  // Determine the message based on user role and status
  let cardTitle = ''
  if (nextMeeting.status === 'pending') {
    cardTitle = isRequester
      ? `Awaiting response from ${recipientName}`
      : `Meeting request from ${requesterName}`
  } else if (isRescheduleRequest && isRequester) {
    cardTitle = `Reschedule requested by ${recipientName}`
  } else if (isRescheduleRequest && !isRequester) {
    cardTitle = `You requested to reschedule with ${requesterName}`
  } else if (nextMeeting.status === 'reschedule_proposed') {
    cardTitle = isRequester
      ? `Reschedule approved pending recipient`
      : `New time proposed by ${requesterName}`
  } else {
    cardTitle = `Meeting update`
  }

  return (
    <>
      <Card 
        className="bg-spirits-magenta/20 border-spirits-magenta/50 rounded-xl p-4 mb-4 sm:mb-6 cursor-pointer hover:bg-spirits-magenta/30 transition-all touch-manipulation"
        onClick={() => setSelectedMeeting(nextMeeting)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-spirits-magenta" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {cardTitle}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {nextMeeting.title}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-xs text-muted-foreground">
            {formatDate(nextMeeting.suggestedDate)}
            {nextMeeting.suggestedTime && ` • ${formatTime(nextMeeting.suggestedTime)}`}
          </div>
        </div>
      </Card>

      {selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          currentUserId={userId}
          onClose={() => {
            setSelectedMeeting(null)
            fetchPendingMeetings()
          }}
          onUpdate={fetchPendingMeetings}
        />
      )}
    </>
  )
}
