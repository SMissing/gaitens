import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth, requireManager } from '@/lib/auth'
import { sendEmailToChelsea } from '@/lib/email'

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').nullish(),
  requestedFor: z.string().uuid('Invalid user ID'),
  suggestedDate: z.string().min(1, 'Suggested date is required'),
  suggestedTime: z.string().nullish(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  ccUserIds: z.array(z.string().uuid('Invalid CC user ID')).optional().nullable(),
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
          site
        ),
        recipient:requested_for (
          id,
          name,
          site
        ),
        lastActionUser:last_action_by (
          id,
          name,
          site
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
        severity: meeting.severity || 'medium',
        requestedBy: requesterData ? {
          id: requesterData.id,
          name: requesterData.name,
          site: requesterData.site ?? null,
        } : null,
        requestedFor: recipientData ? {
          id: recipientData.id,
          name: recipientData.name,
          site: recipientData.site ?? null,
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
          site: lastActionData.site ?? null,
        } : null,
        createdAt: meeting.created_at || meeting.createdAt,
        updatedAt: meeting.updated_at || meeting.updatedAt,
      }
    })

    // Optional extra fields (CC users + follow-ups) - best-effort.
    // If the DB migrations haven't been run yet, these queries will fail safely.
    try {
      const meetingIds = transformedMeetings.map((m: any) => m.id)
      if (meetingIds.length > 0) {
        // CC users
        const { data: ccRows, error: ccErr } = await supabase
          .from('meeting_cc_users')
          .select('meeting_id, user_id')
          .in('meeting_id', meetingIds)

        if (!ccErr && ccRows) {
          const uniqueUserIds = Array.from(new Set((ccRows || []).map((r: any) => r.user_id))).filter(Boolean)
          const { data: usersRows } = await supabase
            .from('users')
            .select('id, name, site')
            .in('id', uniqueUserIds)

          const userMap = new Map(
            (usersRows || []).map((u: any) => [
              u.id,
              { id: u.id, name: u.name, site: u.site ?? null },
            ]),
          )

          const ccByMeeting = new Map<string, Array<{ id: string; name: string; site: string | null }>>()
          for (const row of ccRows as any[]) {
            const user = userMap.get(row.user_id)
            if (!user) continue
            const list = ccByMeeting.get(row.meeting_id) || []
            list.push(user)
            ccByMeeting.set(row.meeting_id, list)
          }

          for (const meeting of transformedMeetings as any[]) {
            meeting.ccUsers = ccByMeeting.get(meeting.id) || []
          }
        }

        // Follow-ups
        const { data: followRows, error: followErr } = await supabase
          .from('meeting_followups')
          .select('id, meeting_id, note, created_by, created_at')
          .in('meeting_id', meetingIds)

        if (!followErr && followRows) {
          const uniqueCreatorIds = Array.from(
            new Set((followRows || []).map((r: any) => r.created_by).filter(Boolean)),
          )
          const { data: followUsersRows } = await supabase
            .from('users')
            .select('id, name, site')
            .in('id', uniqueCreatorIds)

          const followUserMap = new Map(
            (followUsersRows || []).map((u: any) => [
              u.id,
              { id: u.id, name: u.name, site: u.site ?? null },
            ]),
          )

          const followByMeeting = new Map<
            string,
            Array<{ id: string; note: string; createdAt: string; createdBy: { id: string; name: string; site: string | null } | null }>
          >()

          for (const row of followRows as any[]) {
            const creator = followUserMap.get(row.created_by) || null
            const list = followByMeeting.get(row.meeting_id) || []
            list.push({
              id: row.id,
              note: row.note,
              createdAt: row.created_at,
              createdBy: creator,
            })
            followByMeeting.set(row.meeting_id, list)
          }

          for (const meeting of transformedMeetings as any[]) {
            meeting.followups = followByMeeting.get(meeting.id) || []
          }
        }
      }
    } catch (e) {
      // Ignore: migrations/tables might not exist yet.
      console.warn('[meetings] Optional CC/followups fetch failed:', e)
    }

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
    // Insert the meeting (severity support is best-effort if migrations aren't applied yet).
    let meeting: any = null
    let insertError: any = null
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: validatedData.title.trim(),
          description: validatedData.description?.trim() || null,
          requested_by: user.id,
          requested_for: validatedData.requestedFor,
          suggested_date: validatedData.suggestedDate,
          suggested_time: validatedData.suggestedTime || null,
          severity: validatedData.severity,
          status: 'pending',
          last_action_by: user.id,
        })
        .select()
        .single()

      meeting = data
      insertError = error
    } catch (e) {
      insertError = e
    }

    if (insertError) {
      const msg = String(insertError?.message || insertError)
      if (msg.toLowerCase().includes('severity')) {
        // Retry without severity column (before migrations).
        const { data, error } = await supabase
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

        if (error || !data) {
          console.error('Error creating meeting (retry without severity):', error)
          return NextResponse.json({ error: 'Failed to create meeting request' }, { status: 500 })
        }

        meeting = data
      } else {
        console.error('Error creating meeting:', insertError)
        return NextResponse.json({ error: 'Failed to create meeting request' }, { status: 500 })
      }
    }

    // Persist CC users (best-effort for MVP)
    try {
      const ccUserIds = validatedData.ccUserIds || []
      if (ccUserIds.length > 0) {
        await supabase.from('meeting_cc_users').insert(
          ccUserIds.map((ccId) => ({
            meeting_id: meeting.id,
            user_id: ccId,
          })),
        )
      }
    } catch (e) {
      console.warn('[meetings] Failed to persist meeting CC users (maybe migrations not run yet):', e)
    }

    try {
      const { data: recipientData } = await supabase
        .from('users')
        .select('name')
        .eq('id', validatedData.requestedFor)
        .single()

      const requesterName = user.name || `User ${user.id}`
      const recipientName = recipientData?.name || `User ${validatedData.requestedFor}`

      const subject = `Meeting request: ${validatedData.title}`
      const text = [
        `Meeting request ID: ${meeting.id}`,
        `Requester: ${requesterName}${user.id ? ` (${user.id})` : ''}`,
        `Recipient: ${recipientName}`,
        `Suggested: ${validatedData.suggestedDate}${validatedData.suggestedTime ? ` @ ${validatedData.suggestedTime}` : ''}`,
        validatedData.description ? `Description: ${validatedData.description}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      await sendEmailToChelsea(subject, text)
    } catch (e) {
      console.error('[email] Meeting request email failed:', e)
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
