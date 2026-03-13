'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  description: string | null
  eventDate: string
  eventTime: string | null
  location: string | null
  imageUrl: string | null
  imagePath: string | null
}

interface EventModalProps {
  event: Event
  onClose: () => void
}

export function EventModal({ event, onClose }: EventModalProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4 touch-manipulation"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)',
        paddingBottom: 'calc(max(16px, env(safe-area-inset-bottom, 16px) + 16px) + 96px)',
      }}
      onClick={onClose}
    >
      <Card
        className="bg-[#1e1e1e] rounded-2xl border border-border/50 max-w-2xl w-full h-full overflow-hidden flex flex-col -webkit-overflow-scrolling-touch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Image */}
        {event.imageUrl && (
          <div className="relative w-full h-64 bg-muted">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1 -webkit-overflow-scrolling-touch">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {event.title}
            </h2>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.eventDate)}</span>
              </div>

              {event.eventTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(event.eventTime)}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.description && (
              <div className="pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
