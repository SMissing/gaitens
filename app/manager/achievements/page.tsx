import { requireManager } from '@/lib/auth'
import { ManagerStaffAchievements } from '@/components/achievements/ManagerStaffAchievements'

export default async function ManagerAchievementsPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Badges</h1>
            <p className="text-sm text-muted-foreground">Which badges each staff member has completed.</p>
          </div>
        </div>

        <ManagerStaffAchievements />
      </div>
    </div>
  )
}

