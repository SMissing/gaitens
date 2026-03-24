import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { ManagementCalendar } from '@/components/management-calendar/ManagementCalendar'
import { Calendar } from 'lucide-react'

export default async function ManagementCalendarPage() {
  const user = await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Management Calendar"
        icon={<Calendar className="h-6 w-6 text-spirits-yellow" />}
        description="Meetings, pubwatch, disciplinaries — use the dock to add events or refresh"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <ManagementCalendar isAdmin={user.role === 'admin'} />
        </div>
      </div>
    </div>
  )
}

