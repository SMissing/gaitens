import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// POST - Mark notice as read
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('notice_reads')
      .insert({
        userId: user.id,
        noticeId: params.id,
      })
      .select()
      .single()

    if (error) {
      // If already exists, that's fine - just return success
      if (error.code === '23505') {
        return NextResponse.json({ success: true })
      }
      // If table doesn't exist, return success (graceful degradation)
      if (error.code === 'PGRST205') {
        console.log('notice_reads table does not exist, skipping mark as read')
        return NextResponse.json({ success: true })
      }
      console.error('Error marking notice as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark notice as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/notices/[id]/read:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
