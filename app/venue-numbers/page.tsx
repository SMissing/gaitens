import { requireAuth } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { VenueNumbersLogger } from '@/components/venue-numbers/VenueNumbersLogger'
import { MapPin } from 'lucide-react'

export default async function VenueNumbersPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Venue Numbers"
        icon={<MapPin className="h-6 w-6 text-spirits-magenta" />}
        description="Log when you share venue numbers with the team."
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <VenueNumbersLogger />
        </div>
      </div>
    </div>
  )
}

