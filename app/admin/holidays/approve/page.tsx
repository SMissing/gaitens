import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import {
  ApproveHolidaysClient,
  type HolidayApprovalQueueItem,
} from '@/components/admin/ApproveHolidaysClient'
import type { HolidayRequest } from '@/types/database'
import type { User } from '@/types/database'

interface HolidayRequestWithUser extends HolidayRequest {
  users: User | null
}

export default async function ApproveHolidaysPage() {
  await requireAdmin()
  const supabase = createServerClient()

  const { data: pendingNew } = await supabase
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

  const { data: pendingCancellation } = await supabase
    .from('holiday_requests')
    .select(`
      *,
      users (
        id,
        name,
        site
      )
    `)
    .eq('status', 'approved')
    .not('cancellationRequestedAt', 'is', null)
    .order('cancellationRequestedAt', { ascending: false })

  const merged: HolidayApprovalQueueItem[] = [
    ...(pendingNew || []).map((r) => ({
      ...(r as HolidayRequestWithUser),
      reviewKind: 'new_request' as const,
    })),
    ...(pendingCancellation || []).map((r) => ({
      ...(r as HolidayRequestWithUser),
      reviewKind: 'cancellation_request' as const,
    })),
  ].sort((a, b) => {
    const ta =
      a.reviewKind === 'new_request'
        ? new Date(a.createdAt).getTime()
        : new Date(a.cancellationRequestedAt || a.createdAt).getTime()
    const tb =
      b.reviewKind === 'new_request'
        ? new Date(b.createdAt).getTime()
        : new Date(b.cancellationRequestedAt || b.createdAt).getTime()
    return tb - ta
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <h1 className="text-3xl font-bold text-foreground mb-6">Approve Holiday Requests</h1>
      
      <ApproveHolidaysClient initialRequests={merged} />
    </div>
  )
}
