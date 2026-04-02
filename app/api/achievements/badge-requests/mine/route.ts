import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { BadgeRequest } from '@/types/database'

/** Current user's badge requests (for achievements UI). */
export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('badge_requests')
    .select('id, userId, achievementId, status, rejectionReason, resolvedBy, resolvedAt, createdAt, updatedAt')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('GET badge-requests/mine:', error)
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 })
  }

  return NextResponse.json({ requests: (data || []) as BadgeRequest[] })
}
