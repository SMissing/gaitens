import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { VenueNumbersManager } from '@/components/venue-numbers/VenueNumbersManager'
import { ClipboardList } from 'lucide-react'

export default async function VenueNumbersManagerPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Venue Numbers Log"
        icon={<ClipboardList className="h-6 w-6 text-spirits-cyan" />}
        description="Track and review staff venue-number shares."
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <VenueNumbersManager />
        </div>
      </div>
    </div>
  )
}

