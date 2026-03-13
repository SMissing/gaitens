import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
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
