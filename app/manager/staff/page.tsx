import { requireManager } from '@/lib/auth'
import { StaffList } from '@/components/staff/StaffList'

export default async function ManageStaffPage() {
  await requireManager()

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <StaffList />
      </div>
    </div>
  )
}
