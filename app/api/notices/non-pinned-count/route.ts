import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - Get count of non-pinned notices
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()
    
    // Get count of active non-pinned notices
    const { count, error: noticesError } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('pinned', false)
      .or('expiresAt.is.null,expiresAt.gt.' + new Date().toISOString())

    if (noticesError) {
      console.error('Error fetching notices:', noticesError)
      return NextResponse.json(
        { error: 'Failed to fetch notices' },
        { status: 500 }
      )
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error in GET /api/notices/non-pinned-count:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
