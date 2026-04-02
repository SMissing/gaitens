import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { CreateAchievementForm } from '@/components/achievements/CreateAchievementForm'
import { Award } from 'lucide-react'

export default async function ManagerCreateBadgePage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Create Badge"
        icon={<Award className="h-6 w-6 text-spirits-cyan" />}
        description="Create new achievement badges that managers can award to staff."
        showBack={true}
        backHref="/manager/achievements"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-2xl mx-auto">
          <CreateAchievementForm />
        </div>
      </div>
    </div>
  )
}
