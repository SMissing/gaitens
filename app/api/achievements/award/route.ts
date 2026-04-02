import { NextRequest, NextResponse } from 'next/server'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { awardAchievementToUser } from '@/lib/achievementAward'

// POST - Award an achievement to a user
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager() // Only managers and admins can award
    const supabase = createServerClient()

    const body = await request.json()
    const { userId, achievementId } = body

    if (!userId || !achievementId) {
      return NextResponse.json(
        { error: 'userId and achievementId are required' },
        { status: 400 },
      )
    }

    const result = await awardAchievementToUser(supabase, user.id, userId, achievementId)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ achievement: result.userAchievement })
  } catch (error) {
    console.error('Error in POST /api/achievements/award:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
