import { requireManager } from '@/lib/auth'
import { TrainingManagement } from '@/components/training/TrainingManagement'
import { PageHeader } from '@/components/layout/PageHeader'
import { GraduationCap } from 'lucide-react'

export default async function TrainingManagementPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Module Maker"
        icon={<GraduationCap className="h-6 w-6 text-spirits-yellow" />}
        description="Build training modules — use the dock to add or refresh"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <TrainingManagement />
        </div>
      </div>
    </div>
  )
}
