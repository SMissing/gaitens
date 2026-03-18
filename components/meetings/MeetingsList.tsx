'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User } from 'lucide-react'
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

interface MeetingsListProps {
  currentUserId: string
}

export function MeetingsList({ currentUserId }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings')
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (err) {
      console.error('Error fetching meetings:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded border border-yellow-500/30">Pending</span>
      case 'accepted':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded border border-green-500/30">Accepted</span>
      case 'reschedule_requested':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs font-medium rounded border border-blue-500/30">Reschedule Requested</span>
      case 'reschedule_proposed':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs font-medium rounded border border-purple-500/30">New Time Proposed</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-medium rounded border border-red-500/30">Cancelled</span>
      default:
        return null
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading meetings...</div>
  }

  if (meetings.length === 0) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">No meetings found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {meetings.map((meeting) => {
          const isRequester = meeting.requestedBy?.id === currentUserId
          const otherPerson = isRequester ? meeting.requestedFor : meeting.requestedBy
          const isPending = ['pending', 'reschedule_requested', 'reschedule_proposed'].includes(meeting.status)

          return (
            <Card
              key={meeting.id}
              className="bg-[#1e1e1e] rounded-xl border border-border/50 cursor-pointer hover:border-spirits-magenta/50 transition-all"
              onClick={() => setSelectedMeeting(meeting)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-foreground flex-1">
                      {meeting.title}
                    </h3>
                    {getStatusBadge(meeting.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{isRequester ? `With: ${otherPerson?.name}` : `From: ${otherPerson?.name}`}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {meeting.status === 'accepted' && meeting.meetingDate
                          ? formatDate(meeting.meetingDate)
                          : formatDate(meeting.suggestedDate)}
                      </span>
                    </div>

                    {(meeting.status === 'accepted' ? meeting.meetingTime : meeting.suggestedTime) && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(meeting.status === 'accepted' ? meeting.meetingTime : meeting.suggestedTime)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <p className="text-xs text-spirits-magenta mt-2">
                      Click to view
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Click to view details
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedMeeting && (
        <MeetingModal
          meeting={selectedMeeting}
          currentUserId={currentUserId}
          onClose={() => {
            setSelectedMeeting(null)
            fetchMeetings()
          }}
          onUpdate={fetchMeetings}
        />
      )}
    </>
  )
}
