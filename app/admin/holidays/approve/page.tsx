import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { ApproveHolidaysClient } from '@/components/admin/ApproveHolidaysClient'
import type { HolidayRequest } from '@/types/database'
import type { User } from '@/types/database'

interface HolidayRequestWithUser extends HolidayRequest {
  users: User | null
}

export default async function ApproveHolidaysPage() {
  await requireAdmin()
  const supabase = createServerClient()

  // Fetch all pending holiday requests
  const { data: requests } = await supabase
    .from('holiday_requests')
    .select(`
      *,
      users (
        id,
        name,
        site
      )
    `)
    .eq('status', 'pending')
    .order('createdAt', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <h1 className="text-3xl font-bold text-foreground mb-6">Approve Holiday Requests</h1>
      
      <ApproveHolidaysClient initialRequests={(requests as HolidayRequestWithUser[]) || []} />
    </div>
  )
}
