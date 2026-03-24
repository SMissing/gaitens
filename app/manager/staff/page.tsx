import { requireManager } from '@/lib/auth'
import { StaffList } from '@/components/staff/StaffList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Users } from 'lucide-react'

export default async function ManageStaffPage() {
  const user = await requireManager()

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Manage staff"
        icon={<Users className="h-6 w-6 text-spirits-cyan" />}
        description="Directory by role — codes and actions follow your access level"
        showBack={true}
        backHref="/dashboard"
      />
      <div className="p-4 sm:p-6 lg:p-8 pb-32">
        <div className="max-w-5xl mx-auto">
          <StaffList currentUser={user} />
        </div>
      </div>
    </div>
  )
}
