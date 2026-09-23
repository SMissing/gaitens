import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { MaintenanceDashboard } from '@/components/maintenance/MaintenanceDashboard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Wrench } from 'lucide-react'

export default async function MaintenanceShiftsPage() {
  const user = await requireAuth()
  // Maintenance accounts already clock in from their dashboard
  if (user.role === 'maintenance') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Maintenance Shifts"
        icon={<Wrench className="h-6 w-6 text-amber-400" />}
        description="Clock in and out for any extra maintenance hours you do"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="pb-32">
        <MaintenanceDashboard user={user} showWelcome={false} />
      </div>
    </div>
  )
}
