import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { PastEventsList } from '@/components/upcoming-events/UpcomingEventsList'
import { EventsSubnav } from '@/components/upcoming-events/EventsSubnav'
import { PageHeader } from '@/components/layout/PageHeader'
import { History } from 'lucide-react'

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
    site: string | null
  }
}

export default async function PastEventsPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  const { data: events } = await supabase
    .from('upcoming_events')
    .select(`
      *,
      users:createdBy (
        id,
        name,
        site
      )
    `)
    .order('eventDate', { ascending: false })
    .order('eventTime', { ascending: false, nullsFirst: false })

  const transformedEvents = (events || []).map((event: any) => {
    const userData = Array.isArray(event.users) ? event.users[0] : event.users

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      location: event.location,
      imageUrl: event.imageUrl,
      imagePath: event.imagePath,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      createdBy: userData
        ? {
            id: userData.id,
            name: userData.name,
            site: userData.site ?? null,
          }
        : { id: '', name: 'Unknown', site: null },
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Past Events"
        icon={<History className="h-6 w-6 text-spirits-magenta" />}
        description="Events that have already happened"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-6xl mx-auto">
          <EventsSubnav />
          <PastEventsList
            initialEvents={transformedEvents as Event[]}
            isManagerOrAdmin={user.role === 'manager' || user.role === 'admin'}
          />
        </div>
      </div>
    </div>
  )
}
