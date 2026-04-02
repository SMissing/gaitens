import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

/** POST — Staff withdraws their own pending (not yet approved) holiday request. */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const { data: row, error: fetchError } = await supabase
      .from('holiday_requests')
      .select('id, userId, status')
      .eq('id', params.id)
      .single()

    if (fetchError || !row) {
      return NextResponse.json({ error: 'Holiday request not found' }, { status: 404 })
    }

    if (row.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (row.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending requests can be withdrawn' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('holiday_requests')
      .update({
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error withdrawing holiday request:', error)
      return NextResponse.json({ error: 'Failed to withdraw request' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/holidays/requests/[id]/withdraw:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
