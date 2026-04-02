import { requireManager } from '@/lib/auth'
import { PageHeader } from '@/components/layout/PageHeader'
import { ManagerBadgeRequestsClient } from '@/components/achievements/ManagerBadgeRequestsClient'
import { ClipboardCheck } from 'lucide-react'

export default async function ManagerBadgeRequestsPage() {
  await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Badge requests"
        icon={<ClipboardCheck className="h-6 w-6 text-spirits-cyan" />}
        description="Approve or decline badges staff requested from their Achievements page"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-3xl mx-auto">
          <ManagerBadgeRequestsClient />
        </div>
      </div>
    </div>
  )
}
