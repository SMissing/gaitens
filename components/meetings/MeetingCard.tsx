'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, User } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'

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
  meetingDate: string
  meetingTime: string | null
}

interface MeetingCardProps {
  meeting: Meeting
  currentUserId: string
}

export function MeetingCard({ meeting, currentUserId }: MeetingCardProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const isRequester = meeting.requestedBy?.id === currentUserId
  const otherPerson = isRequester ? meeting.requestedFor : meeting.requestedBy

  return (
    <Card className="bg-[#1e1e1e] rounded-xl border border-border/50">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-1">
            {meeting.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>With {otherPerson?.name}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(meeting.meetingDate)}</span>
            </div>
            
            {meeting.meetingTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatTime(meeting.meetingTime)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
