import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { ManagerStaffAchievements } from '@/components/achievements/ManagerStaffAchievements'
import { Award } from 'lucide-react'

export default async function ManagerAchievementsPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Staff Badges"
        icon={<Award className="h-6 w-6 text-spirits-yellow" />}
        description="All accounts — use the dock to filter by venue, sort, or refresh"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <ManagerStaffAchievements />
        </div>
      </div>
    </div>
  )
}

