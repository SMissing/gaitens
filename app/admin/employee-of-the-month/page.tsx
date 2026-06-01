import { requireAdmin } from '@/lib/auth'
import { EotmAdminClient } from '@/components/admin/EotmAdminClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { Trophy } from 'lucide-react'

export default async function AdminEotmPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Employee of the Month"
        icon={<Trophy className="h-6 w-6 text-garrison-orange" />}
        description="Manage announcements and view the full voting history for any month"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <EotmAdminClient />
        </div>
      </div>
    </div>
  )
}
