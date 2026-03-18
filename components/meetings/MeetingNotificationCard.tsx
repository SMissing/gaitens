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
    staffCode: string
  } | null
  requestedFor: {
    id: string
    name: string
    staffCode: string
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
        console.error('Failed to fetch meetings:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error data:', errorData)
        setPendingMeetings([])
        return
      }
      
      const data = await response.json()
      console.log('API Response:', {
        meetingsCount: data.meetings?.length || 0,
        meetings: data.meetings,
        userId
      })
      
      if (!data.meetings || !Array.isArray(data.meetings)) {
        console.warn('No meetings array in response')
        setPendingMeetings([])
        return
      }
      
      // Filter meetings where:
      // 1. User is recipient and status is pending/reschedule_proposed
      // 2. User is requester and status is reschedule_requested (recipient requested reschedule)
      const userMeetings = data.meetings.filter((m: Meeting) => {
        if (!m.requestedBy || !m.requestedFor) {
          console.warn('Meeting missing requestedBy or requestedFor:', m)
          return false
        }
        
        const isRecipient = m.requestedFor.id === userId
        const isRequester = m.requestedBy.id === userId
        
        console.log('Meeting check:', {
          id: m.id,
          status: m.status,
          requestedById: m.requestedBy.id,
          requestedForId: m.requestedFor.id,
          userId,
          isRecipient,
          isRequester,
          matches: (isRecipient && ['pending', 'reschedule_requested', 'reschedule_proposed'].includes(m.status)) || 
                   (isRequester && m.status === 'reschedule_requested')
        })
        
        // Recipient sees: pending, reschedule_requested, reschedule_proposed
        if (isRecipient && ['pending', 'reschedule_requested', 'reschedule_proposed'].includes(m.status)) {
          console.log('Match: User is recipient with valid status')
          return true
        }
        
        // Requester sees:
        // - pending: awaiting recipient response
        // - reschedule_requested: recipient requested reschedule
        if (isRequester && ['pending', 'reschedule_requested'].includes(m.status)) {
          console.log('Match: User is requester with reschedule_requested status')
          return true
        }
        
        console.log('No match for meeting:', m.id)
        return false
      })
      
      console.log('Filtered meetings:', userMeetings)
      setPendingMeetings(userMeetings)
    } catch (err) {
      console.error('Error fetching pending meetings:', err)
      setPendingMeetings([])
    } finally {
      setLoading(false)
    }
  }

  // Debug: Show loading state temporarily
  if (loading) {
    return (
      <div className="mb-4 sm:mb-6 p-2 text-xs text-muted-foreground">
        Loading meetings...
      </div>
    )
  }

  if (pendingMeetings.length === 0) {
    // Debug: Show when no meetings found
    console.log('No pending meetings to display for user:', userId)
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
