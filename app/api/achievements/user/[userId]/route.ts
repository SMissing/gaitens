import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { UserAchievement } from '@/types/database'

// GET - Get achievements for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(
          id,
          name,
          description,
          "imageUrl",
          "requiresProgress",
          "requiredCount",
          rarity,
          "createdAt",
          "updatedAt"
        )
      `)
      .eq('userId', params.userId)
      .order('awardedAt', { ascending: false })

    if (error) {
      console.error('Error fetching user achievements:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user achievements' },
        { status: 500 }
      )
    }

    return NextResponse.json({ achievements: data as UserAchievement[] })
  } catch (error) {
    console.error('Error in GET /api/achievements/user/[userId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
