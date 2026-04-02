import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { Achievement, BadgeRequest } from '@/types/database'

/** Managers: list badge requests (default: pending only). */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'manager' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = request.nextUrl.searchParams.get('status') || 'pending'
    const supabase = createServerClient()

    let q = supabase
      .from('badge_requests')
      .select(
        `
        id,
        userId,
        achievementId,
        status,
        rejectionReason,
        resolvedBy,
        resolvedAt,
        createdAt,
        updatedAt,
        achievement:achievements(id, name, description, "imageUrl", rarity, "requiresProgress", "requiredCount")
      `,
      )
      .order('createdAt', { ascending: true })

    if (status === 'pending') {
      q = q.eq('status', 'pending')
    } else if (status !== 'all') {
      q = q.eq('status', status)
    }

    const { data: rows, error } = await q

    if (error) {
      console.error('GET badge-requests:', error)
      return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 })
    }

    const list = (rows || []) as Array<
      BadgeRequest & { achievement?: Achievement | Achievement[] | null }
    >
    const userIds = [...new Set(list.map((r) => r.userId))]
    let userMap = new Map<string, { id: string; name: string; site: string | null }>()
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, name, site')
        .in('id', userIds)
      userMap = new Map((users || []).map((u) => [u.id, u]))
    }

    const requests = list.map((r) => {
      const ach = r.achievement
      const achievement = Array.isArray(ach) ? ach[0] ?? null : ach ?? null
      return {
        ...r,
        achievement,
        requester: userMap.get(r.userId) ?? null,
      }
    })

    return NextResponse.json({ requests })
  } catch (e) {
    console.error('GET badge-requests:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** Staff (any authenticated user): request a badge they have not completed. */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const achievementId = body?.achievementId as string | undefined
    if (!achievementId) {
      return NextResponse.json({ error: 'achievementId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: ua } = await supabase
      .from('user_achievements')
      .select('completed')
      .eq('userId', user.id)
      .eq('achievementId', achievementId)
      .maybeSingle()

    if (ua?.completed) {
      return NextResponse.json({ error: 'You already have this badge' }, { status: 400 })
    }

    const { data: inserted, error: insertError } = await supabase
      .from('badge_requests')
      .insert({
        userId: user.id,
        achievementId,
        status: 'pending',
      })
      .select(
        'id, userId, achievementId, status, rejectionReason, resolvedBy, resolvedAt, createdAt, updatedAt',
      )
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'You already have a pending request for this badge' },
          { status: 409 },
        )
      }
      console.error('POST badge-requests:', insertError)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }

    return NextResponse.json({ request: inserted as BadgeRequest })
  } catch (e) {
    console.error('POST badge-requests:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
