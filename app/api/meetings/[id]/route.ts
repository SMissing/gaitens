import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { sendEmailToChelsea } from '@/lib/email'

const updateMeetingSchema = z.object({
  action: z.enum(['accept', 'reschedule', 'propose_reschedule', 'cancel']),
  meetingDate: z.string().optional(),
  meetingTime: z.string().optional().nullable(),
  rescheduleReason: z.string().max(1000, 'Reason is too long').optional(),
  suggestedDate: z.string().optional(),
  suggestedTime: z.string().optional().nullable(),
})

// PATCH - Update meeting (accept, reschedule, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    // Get the meeting first to check permissions
    const { data: existingMeeting, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Check if user is involved in this meeting
    const requestedBy = existingMeeting.requested_by || existingMeeting.requestedBy
    const requestedFor = existingMeeting.requested_for || existingMeeting.requestedFor
    
    if (requestedBy !== user.id && requestedFor !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateMeetingSchema.parse(body)

    const suggestedDate = existingMeeting.suggested_date || existingMeeting.suggestedDate
    const suggestedTime = existingMeeting.suggested_time || existingMeeting.suggestedTime

    let updateData: any = {
      last_action_by: user.id,
      updated_at: new Date().toISOString(),
    }

    switch (validatedData.action) {
      case 'accept':
        // Recipient can accept initial request
        // Requester can accept reschedule request (approve recipient's suggested time)
        const currentStatus = existingMeeting.status || 'pending'
        const isRescheduleRequest = currentStatus === 'reschedule_requested'
        
        if (requestedFor === user.id) {
          // Recipient accepting initial request
          updateData.status = 'accepted'
          updateData.meeting_date = validatedData.meetingDate || suggestedDate
          updateData.meeting_time = validatedData.meetingTime || suggestedTime
        } else if (requestedBy === user.id && isRescheduleRequest) {
          // Requester accepting recipient's reschedule request
          updateData.status = 'accepted'
          updateData.meeting_date = validatedData.meetingDate || suggestedDate
          updateData.meeting_time = validatedData.meetingTime || suggestedTime
        } else {
          return NextResponse.json(
            { error: 'You cannot accept this meeting' },
            { status: 403 }
          )
        }
        break

      case 'reschedule':
        // Request reschedule - recipient requests new time
        if (requestedFor !== user.id) {
          return NextResponse.json(
            { error: 'Only the recipient can request reschedule' },
            { status: 403 }
          )
        }
        if (!validatedData.suggestedDate) {
          return NextResponse.json(
            { error: 'New suggested date is required' },
            { status: 400 }
          )
        }
        updateData.status = 'reschedule_requested'
        updateData.suggested_date = validatedData.suggestedDate
        updateData.suggested_time = validatedData.suggestedTime || null
        updateData.reschedule_reason = validatedData.rescheduleReason || null
        break

      case 'propose_reschedule':
        // Manager proposes new time after reschedule request
        if (requestedBy !== user.id) {
          return NextResponse.json(
            { error: 'Only the requester can propose a reschedule' },
            { status: 403 }
          )
        }
        if (!validatedData.suggestedDate) {
          return NextResponse.json(
            { error: 'New suggested date is required' },
            { status: 400 }
          )
        }
        updateData.status = 'reschedule_proposed'
        updateData.suggested_date = validatedData.suggestedDate
        updateData.suggested_time = validatedData.suggestedTime || null
        updateData.reschedule_reason = validatedData.rescheduleReason || null
        break

      case 'cancel':
        // Either party can cancel
        updateData.status = 'cancelled'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating meeting:', error)
      return NextResponse.json(
        { error: 'Failed to update meeting' },
        { status: 500 }
      )
    }

    try {
      const [requestedByData, requestedForData] = await Promise.all([
        supabase.from('users').select('name, staffCode').eq('id', requestedBy).single(),
        supabase.from('users').select('name, staffCode').eq('id', requestedFor).single(),
      ])

      const byName = requestedByData.data?.name || `User ${requestedBy}`
      const forName = requestedForData.data?.name || `User ${requestedFor}`
      const actorName = user?.name || `User ${user.id}`

      const subject = `Meeting ${meeting.status}: ${existingMeeting.title}`
      const text = [
        `Meeting ID: ${meeting.id}`,
        `Title: ${existingMeeting.title}`,
        `Requested by: ${byName}`,
        `Requested for: ${forName}`,
        `Actor: ${actorName}`,
        `Action: ${validatedData.action}`,
        `New status: ${meeting.status}`,
        existingMeeting.meeting_date ? `Meeting date: ${existingMeeting.meeting_date}` : null,
        existingMeeting.meeting_time ? `Meeting time: ${existingMeeting.meeting_time}` : null,
        validatedData.suggestedDate ? `Suggested date: ${validatedData.suggestedDate}` : null,
        validatedData.suggestedTime ? `Suggested time: ${validatedData.suggestedTime}` : null,
        validatedData.rescheduleReason ? `Reschedule reason: ${validatedData.rescheduleReason}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      await sendEmailToChelsea(subject, text)
    } catch (e) {
      console.error('[email] Meeting update email failed:', e)
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in PATCH /api/meetings/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
