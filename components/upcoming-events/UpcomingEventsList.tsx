'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Edit, Trash2, Plus } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import { EventForm } from './EventForm'
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
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    staffCode: string
  }
}

interface UpcomingEventsListProps {
  initialEvents: Event[]
  isManagerOrAdmin: boolean
}

export function UpcomingEventsList({ initialEvents, isManagerOrAdmin }: UpcomingEventsListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    setDeletingId(eventId)
    try {
      const response = await fetch(`/api/upcoming-events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (error) {
      alert('Failed to delete event. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = async () => {
    // Refresh events
    const response = await fetch('/api/upcoming-events')
    if (response.ok) {
      const data = await response.json()
      setEvents(data.events)
    }
    setShowForm(false)
    setEditingEvent(null)
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Filter out past events (only show upcoming)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventDate >= today
  })

  if (showForm || editingEvent) {
    return (
      <div className="space-y-4">
        <EventForm
          event={editingEvent}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingEvent(null)
          }}
        />
      </div>
    )
  }

  if (upcomingEvents.length === 0 && !isManagerOrAdmin) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-xl text-muted-foreground">No upcoming events scheduled.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {isManagerOrAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      )}

      {upcomingEvents.length === 0 ? (
        <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">No upcoming events scheduled.</p>
            {isManagerOrAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Click "Create Event" to add one.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="bg-[#1e1e1e] rounded-2xl border border-border/50 overflow-hidden">
              {event.imageUrl && (
                <div className="relative w-full h-48 bg-muted">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground flex-1">
                      {event.title}
                    </h3>
                    {isManagerOrAdmin && (
                      <div className="flex gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

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
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
