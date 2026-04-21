import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { ManagerStaffTrainingProgress } from '@/components/training/ManagerStaffTrainingProgress'
import { GraduationCap } from 'lucide-react'

export default async function ManagerStaffTrainingPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Staff training"
        icon={<GraduationCap className="h-6 w-6 text-spirits-cyan" />}
        description="Module completion per account — use the dock to filter by venue, sort by training, or refresh"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <ManagerStaffTrainingProgress />
        </div>
      </div>
    </div>
  )
}
