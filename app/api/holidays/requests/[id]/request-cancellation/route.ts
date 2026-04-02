import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { parseYyyyMmDdLocal } from '@/lib/date-utils'

/** POST — Staff asks to cancel an approved upcoming holiday; awaits admin (same queue as approvals). */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const { data: row, error: fetchError } = await supabase
      .from('holiday_requests')
      .select('id, userId, status, endDate, cancellationRequestedAt')
      .eq('id', params.id)
      .single()

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Holiday request not found' }, { status: 404 })
    }

    if (row.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (row.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved holidays can be cancelled this way' },
        { status: 400 }
      )
    }

    if (row.cancellationRequestedAt) {
      return NextResponse.json(
        { error: 'A cancellation request is already pending' },
        { status: 400 }
      )
    }

    const end = parseYyyyMmDdLocal(row.endDate as string)
    end.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (end < today) {
      return NextResponse.json(
        { error: 'This holiday has already ended' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('holiday_requests')
      .update({
        cancellationRequestedAt: now,
        updatedAt: now,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error requesting holiday cancellation:', error)
      return NextResponse.json(
        { error: 'Failed to submit cancellation request' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/holidays/requests/[id]/request-cancellation:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
