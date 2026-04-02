import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  decision: z.enum(['approve', 'reject']),
})

/** PUT — Admin approves the cancellation (holiday removed) or rejects it (holiday stays). */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const body = await request.json()
    const { decision } = bodySchema.parse(body)

    const { data: holidayRequest, error: fetchError } = await supabase
      .from('holiday_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !holidayRequest) {
      return NextResponse.json({ error: 'Holiday request not found' }, { status: 404 })
    }

    if (holidayRequest.status !== 'approved' || !holidayRequest.cancellationRequestedAt) {
      return NextResponse.json(
        { error: 'No pending cancellation for this request' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const updatePayload =
      decision === 'approve'
        ? {
            status: 'cancelled' as const,
            cancellationRequestedAt: null,
            updatedAt: now,
            rejectionReason: null,
          }
        : {
            cancellationRequestedAt: null,
            updatedAt: now,
          }

    const { data, error } = await supabase
      .from('holiday_requests')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error resolving cancellation:', error)
      return NextResponse.json({ error: 'Failed to update holiday request' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in PUT /api/holidays/requests/[id]/cancellation-review:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
