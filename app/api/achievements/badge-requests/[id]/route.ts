import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { awardAchievementToUser } from '@/lib/achievementAward'

/** Manager: approve or decline a badge request. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const manager = await getAuthUser()
    if (!manager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (manager.role !== 'manager' && manager.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const action = body?.action as 'approve' | 'decline' | undefined
    const rejectionReason =
      typeof body?.rejectionReason === 'string' ? body.rejectionReason.trim() : null

    if (action !== 'approve' && action !== 'decline') {
      return NextResponse.json({ error: 'action must be approve or decline' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: row, error: fetchErr } = await supabase
      .from('badge_requests')
      .select('id, userId, achievementId, status')
      .eq('id', id)
      .single()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (row.status !== 'pending') {
      return NextResponse.json({ error: 'This request is already resolved' }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (action === 'decline') {
      const { data: updated, error: upErr } = await supabase
        .from('badge_requests')
        .update({
          status: 'declined',
          rejectionReason: rejectionReason || null,
          resolvedBy: manager.id,
          resolvedAt: now,
          updatedAt: now,
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single()

      if (upErr) {
        console.error('PATCH badge-requests decline:', upErr)
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
      }

      return NextResponse.json({ request: updated })
    }

    const award = await awardAchievementToUser(
      supabase,
      manager.id,
      row.userId,
      row.achievementId,
    )

    if (!award.ok && award.error !== 'Achievement already completed') {
      return NextResponse.json({ error: award.error }, { status: award.status })
    }

    const { data: updated, error: upErr } = await supabase
      .from('badge_requests')
      .update({
        status: 'approved',
        rejectionReason: null,
        resolvedBy: manager.id,
        resolvedAt: now,
        updatedAt: now,
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single()

    if (upErr) {
      console.error('PATCH badge-requests approve (mark request):', upErr)
      return NextResponse.json(
        { error: 'Updating the request failed; the badge may already have been awarded.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      request: updated,
      userAchievement: award.ok ? award.userAchievement : null,
    })
  } catch (e) {
    console.error('PATCH badge-requests:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
