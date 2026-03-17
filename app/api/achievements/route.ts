import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { Achievement } from '@/types/database'

// GET - Get all achievements
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()
    
    // Order by requiredCount first (for streak badges: 1, 7, 30, 100), then by name
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('requiredCount', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      )
    }

    return NextResponse.json({ achievements: data as Achievement[] })
  } catch (error) {
    console.error('Error in GET /api/achievements:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new achievement (badge)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin() // Only admins can create new badges
    const supabase = createServerClient()

    const body = await request.json()
    const {
      name,
      description = null,
      requiresProgress = false,
      requiredCount = 1,
      imageUrl = null,
      rarity = 'Common',
    } = body || {}

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const safeRequiresProgress =
      typeof requiresProgress === 'boolean' ? requiresProgress : false

    let safeRequiredCount = Number(requiredCount)
    if (!Number.isFinite(safeRequiredCount) || safeRequiredCount < 1) {
      safeRequiredCount = 1
    }

    const allowedRarities = ['Common', 'Rare', 'Epic', 'Legendary']
    const safeRarity =
      typeof rarity === 'string' && allowedRarities.includes(rarity)
        ? rarity
        : 'Common'

    const { data, error } = await supabase
      .from('achievements')
      .insert({
        name: name.trim(),
        description: description && typeof description === 'string' ? description.trim() : null,
        requiresProgress: safeRequiresProgress,
        requiredCount: safeRequiredCount,
        imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : null,
        rarity: safeRarity,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating achievement:', error)
      const status = (error as any)?.code === '23505' ? 409 : 500 // 23505 = unique_violation
      const message =
        (error as any)?.code === '23505'
          ? 'An achievement with that name already exists'
          : 'Failed to create achievement'

      return NextResponse.json(
        { error: message },
        { status }
      )
    }

    return NextResponse.json({ achievement: data as Achievement }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/achievements:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
