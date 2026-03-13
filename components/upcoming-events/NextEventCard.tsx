'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import Image from 'next/image'
import { EventModal } from './EventModal'

interface NextEvent {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  imageUrl: string | null
  imagePath: string | null
}

interface NextEventCardProps {
  event: NextEvent | null
}

export function NextEventCard({ event }: NextEventCardProps) {
  const [showModal, setShowModal] = useState(false)

  if (!event) {
    return null
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDaysUntil = (eventDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const event = new Date(eventDate)
    event.setHours(0, 0, 0, 0)
    const diffTime = event.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return 'Past event'
    return `${diffDays} days`
  }

  return (
    <>
      <Card 
        className="bg-[#1e1e1e] rounded-xl border-0 overflow-hidden cursor-pointer hover:opacity-95 transition-all shadow-lg"
        onClick={() => setShowModal(true)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          {event.imageUrl ? (
            <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-muted flex-shrink-0">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 192px"
                unoptimized
              />
            </div>
          ) : (
            <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-muted flex-shrink-0 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Content Section */}
          <CardContent className="px-4 pt-2 pb-4 flex-1 flex flex-col justify-center">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                {event.title}
              </h3>
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  {event.eventTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(event.eventTime)}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-spirits-magenta font-semibold flex-shrink-0">
                  <span>{getDaysUntil(event.eventDate)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {showModal && (
        <EventModal event={event} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

