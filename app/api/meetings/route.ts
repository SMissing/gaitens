import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth, requireManager } from '@/lib/auth'

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').nullish(),
  requestedFor: z.string().uuid('Invalid user ID'),
  suggestedDate: z.string().min(1, 'Suggested date is required'),
  suggestedTime: z.string().nullish(),
})

// GET - Fetch meetings for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'pending', 'upcoming', 'all'

    let query = supabase
      .from('meetings')
      .select(`
        *,
        requester:requested_by (
          id,
          name,
          "staffCode"
        ),
        recipient:requested_for (
          id,
          name,
          "staffCode"
        ),
        lastActionUser:last_action_by (
          id,
          name,
          "staffCode"
        )
      `)

    // Get meetings where user is involved
    query = query.or(`requested_by.eq.${user.id},requested_for.eq.${user.id}`)

    // Debug: Check all meetings for this user first
    const { data: allMeetings } = await supabase
      .from('meetings')
      .select('id, status, requested_by, requested_for')
      .or(`requested_by.eq.${user.id},requested_for.eq.${user.id}`)
    
    console.log('DEBUG - All meetings for user:', {
      userId: user.id,
      allMeetingsCount: allMeetings?.length || 0,
      allMeetings: allMeetings
    })

    if (type === 'pending') {
      query = query.in('status', ['pending', 'reschedule_requested', 'reschedule_proposed'])
    } else if (type === 'upcoming') {
      query = query.eq('status', 'accepted')
      query = query.gte('meeting_date', new Date().toISOString().split('T')[0])
    }

    query = query.order('created_at', { ascending: false })

    const { data: meetings, error } = await query

    if (error) {
      console.error('Error fetching meetings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      )
    }

    console.log('Meetings API - Raw data:', {
      userId: user.id,
      type,
      meetingsCount: meetings?.length || 0,
      meetings: meetings?.map((m: any) => ({
        id: m.id,
        status: m.status,
        requested_by: m.requested_by,
        requested_for: m.requested_for,
        requester: m.requester,
        recipient: m.recipient,
      }))
    })

    // Transform the data
    const transformedMeetings = (meetings || []).map((meeting: any) => {
      const requesterData = Array.isArray(meeting.requester) ? meeting.requester[0] : meeting.requester
      const recipientData = Array.isArray(meeting.recipient) ? meeting.recipient[0] : meeting.recipient
      const lastActionData = meeting.lastActionUser ? (Array.isArray(meeting.lastActionUser) ? meeting.lastActionUser[0] : meeting.lastActionUser) : null

      return {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        requestedBy: requesterData ? {
          id: requesterData.id,
          name: requesterData.name,
          staffCode: requesterData.staff_code || requesterData.staffCode
        } : null,
        requestedFor: recipientData ? {
          id: recipientData.id,
          name: recipientData.name,
          staffCode: recipientData.staff_code || recipientData.staffCode
        } : null,
        status: meeting.status,
        suggestedDate: meeting.suggested_date || meeting.suggestedDate,
        suggestedTime: meeting.suggested_time || meeting.suggestedTime,
        meetingDate: meeting.meeting_date || meeting.meetingDate,
        meetingTime: meeting.meeting_time || meeting.meetingTime,
        rescheduleReason: meeting.reschedule_reason || meeting.rescheduleReason,
        lastActionBy: lastActionData ? {
          id: lastActionData.id,
          name: lastActionData.name,
          staffCode: lastActionData.staff_code || lastActionData.staffCode
        } : null,
        createdAt: meeting.created_at || meeting.createdAt,
        updatedAt: meeting.updated_at || meeting.updatedAt,
      }
    })

    console.log('Meetings API - Transformed data:', {
      userId: user.id,
      transformedCount: transformedMeetings.length,
      transformed: transformedMeetings.map((m: any) => ({
        id: m.id,
        status: m.status,
        requestedById: m.requestedBy?.id,
        requestedForId: m.requestedFor?.id,
      }))
    })

    return NextResponse.json({ meetings: transformedMeetings })
  } catch (error) {
    console.error('Error in GET /api/meetings:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new meeting request (managers and admins only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager()
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = createMeetingSchema.parse(body)

    // Insert the meeting
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        title: validatedData.title.trim(),
        description: validatedData.description?.trim() || null,
        requested_by: user.id,
        requested_for: validatedData.requestedFor,
        suggested_date: validatedData.suggestedDate,
        suggested_time: validatedData.suggestedTime || null,
        status: 'pending',
        last_action_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating meeting:', error)
      return NextResponse.json(
        { error: 'Failed to create meeting request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/meetings:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
