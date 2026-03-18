import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { z } from 'zod'
import { sendEmailToChelsea } from '@/lib/email'

const approveRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().nullable().optional(),
})

// PUT - Approve or reject a holiday request (admins only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const body = await request.json()
    const { status, rejectionReason } = approveRequestSchema.parse(body)

    // Get the holiday request
    const { data: holidayRequest, error: fetchError } = await supabase
      .from('holiday_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !holidayRequest) {
      return NextResponse.json(
        { error: 'Holiday request not found' },
        { status: 404 }
      )
    }

    // Update the request status
    const updateData: { status: string; updatedAt: string; rejectionReason?: string | null } = {
      status,
      updatedAt: new Date().toISOString(),
    }
    
    // Only include rejectionReason if status is rejected and migration has been run
    // Check if rejectionReason column exists by trying to include it conditionally
    if (status === 'rejected' && rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason || null
    } else if (status === 'approved') {
      // Try to clear rejection reason if approving (only if column exists)
      updateData.rejectionReason = null
    }
    
    const { data, error } = await supabase
      .from('holiday_requests')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      // If error is about missing column, try again without rejectionReason
      if (error.code === 'PGRST204' && error.message?.includes('rejectionReason')) {
        console.warn('rejectionReason column not found, updating without it. Please run migration script 09-add-rejection-reason.sql')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('holiday_requests')
          .update({
            status,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', params.id)
          .select()
          .single()

        if (fallbackError) {
          console.error('Error updating holiday request:', fallbackError)
          return NextResponse.json(
            { error: 'Failed to update holiday request' },
            { status: 500 }
          )
        }

        return NextResponse.json(fallbackData)
      }
      
      console.error('Error updating holiday request:', error)
      return NextResponse.json(
        { error: 'Failed to update holiday request' },
        { status: 500 }
      )
    }

    if (status === 'approved') {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('name, staffCode')
          .eq('id', holidayRequest.userId)
          .single()

        const staffName = userData?.name || `User ${holidayRequest.userId}`
        const subject = `Holiday approved: ${staffName}`
        const text = [
          `Holiday request ID: ${holidayRequest.id}`,
          `Staff: ${staffName}${userData?.staffCode ? ` (${userData.staffCode})` : ''}`,
          `Dates: ${holidayRequest.startDate} - ${holidayRequest.endDate}`,
          holidayRequest.reason ? `Reason: ${holidayRequest.reason}` : null,
        ]
          .filter(Boolean)
          .join('\n')

        await sendEmailToChelsea(subject, text)
      } catch (e) {
        // Email is non-critical for the main approve operation.
        console.error('[email] Holiday approval email failed:', e)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in PUT /api/holidays/requests/[id]/approve:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
