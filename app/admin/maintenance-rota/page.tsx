import { requireAdmin } from '@/lib/auth'
import { MaintenanceRotaAdmin } from '@/components/maintenance/MaintenanceRotaAdmin'
import { PageHeader } from '@/components/layout/PageHeader'
import { CalendarClock } from 'lucide-react'

export default async function MaintenanceRotaPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Maintenance Rota"
        icon={<CalendarClock className="h-6 w-6 text-amber-400" />}
        description="Schedule which maintenance staff are expected where, and when"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <MaintenanceRotaAdmin />
        </div>
      </div>
    </div>
  )
}
