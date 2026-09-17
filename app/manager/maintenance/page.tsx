import { requireManager } from '@/lib/auth'
import { MaintenanceAdminLog } from '@/components/maintenance/MaintenanceAdminLog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Wrench } from 'lucide-react'

export default async function MaintenanceLogPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Maintenance Log"
        icon={<Wrench className="h-6 w-6 text-amber-400" />}
        description="Clock in/out history for maintenance staff, by day"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <MaintenanceAdminLog />
        </div>
      </div>
    </div>
  )
}
