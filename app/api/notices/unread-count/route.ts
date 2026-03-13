import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// GET - Get count of unread notices for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    
    // Get all active notices
    const { data: allNotices, error: noticesError } = await supabase
      .from('notices')
      .select('id')
      .or('expiresAt.is.null,expiresAt.gt.' + new Date().toISOString())

    if (noticesError) {
      console.error('Error fetching notices:', noticesError)
      return NextResponse.json(
        { error: 'Failed to fetch notices' },
        { status: 500 }
      )
    }

    if (!allNotices || allNotices.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    const noticeIds = allNotices.map(n => n.id)
    
    // Get notices user has read
    let readNotices: any[] = []
    if (noticeIds.length > 0) {
      const { data, error: readError } = await supabase
        .from('notice_reads')
        .select('noticeId')
        .eq('userId', user.id)
        .in('noticeId', noticeIds)

      if (readError) {
        // Table might not exist yet - treat all notices as unread
        console.error('Error fetching read notices (table may not exist):', readError)
        readNotices = []
      }
      readNotices = data || []
    }

    const readNoticeIds = new Set(readNotices.map(r => r.noticeId))
    const unreadCount = allNotices.filter(n => !readNoticeIds.has(n.id)).length

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Error in GET /api/notices/unread-count:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
