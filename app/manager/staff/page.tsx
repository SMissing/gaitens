import { requireManager } from '@/lib/auth'
import { StaffList } from '@/components/staff/StaffList'

export default async function ManageStaffPage() {
  await requireManager()

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <StaffList />
      </div>
    </div>
  )
}
