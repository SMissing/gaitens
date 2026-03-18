import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { ManagementCalendar } from '@/components/management-calendar/ManagementCalendar'
import { Calendar } from 'lucide-react'

export default async function ManagementCalendarPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Management Calendar"
        icon={<Calendar className="h-6 w-6 text-spirits-magenta" />}
        description="Secondary calendar for management meetings, pubwatch, disciplinaries and recurring events"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <ManagementCalendar />
        </div>
      </div>
    </div>
  )
}

