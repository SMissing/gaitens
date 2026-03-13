import { requireAuth } from '@/lib/auth'
import DashboardContent from '@/components/layout/DashboardContent'
import { PageHeader } from '@/components/layout/PageHeader'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <PageHeader 
        logo="/logos/gaitens-text-logo.png"
        logoAlt="Gaitens Leisure Group"
        showLogout={true}
        showAchievements={true}
      />
      <DashboardContent user={user} />
    </div>
  )
}
