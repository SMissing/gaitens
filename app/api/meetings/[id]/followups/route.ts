import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

const createFollowupSchema = z.object({
  note: z.string().min(1, 'Note is required').max(5000, 'Note is too long'),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const meetingId = params.id

    const supabase = createServerClient()

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, requested_by, requested_for')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const isInvolved = meeting.requested_by === user.id || meeting.requested_for === user.id
    if (!isInvolved) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: followupRows, error } = await supabase
      .from('meeting_followups')
      .select('id, meeting_id, note, created_by, created_at')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching follow-ups:', error)
      return NextResponse.json({ followups: [] })
    }

    const creatorIds = Array.from(new Set((followupRows || []).map((r: any) => r.created_by).filter(Boolean)))
    let usersById = new Map<string, { id: string; name: string; staffCode: string }>()
    if (creatorIds.length > 0) {
      const { data: usersRows } = await supabase
        .from('users')
        .select('id, name, staffCode')
        .in('id', creatorIds)

      usersById = new Map(
        (usersRows || []).map((u: any) => [
          u.id,
          { id: u.id, name: u.name, staffCode: u.staff_code || u.staffCode },
        ]),
      )
    }

    const followups = (followupRows || []).map((r: any) => ({
      id: r.id,
      note: r.note,
      createdAt: r.created_at,
      createdBy: usersById.get(r.created_by) || null,
    }))

    return NextResponse.json({ followups })
  } catch (err) {
    console.error('Error in GET /api/meetings/[id]/followups:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth()
    const meetingId = params.id

    const supabase = createAdminClient()

    const body = await request.json()
    const validated = createFollowupSchema.parse(body)

    // Permission check: requester/recipient can add follow-ups
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, requested_by, requested_for')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const isInvolved = meeting.requested_by === user.id || meeting.requested_for === user.id
    if (!isInvolved) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: created, error: insertErr } = await supabase
      .from('meeting_followups')
      .insert({
        meeting_id: meetingId,
        note: validated.note,
        created_by: user.id,
      })
      .select('id, note, created_by, created_at')
      .single()

    if (insertErr || !created) {
      console.error('Error inserting follow-up:', insertErr)
      return NextResponse.json({ error: 'Failed to create follow-up' }, { status: 500 })
    }

    const { data: creator } = await supabase
      .from('users')
      .select('id, name, staffCode')
      .eq('id', created.created_by)
      .single()

    const followup = {
      id: created.id,
      note: created.note,
      createdAt: created.created_at,
      createdBy: creator
        ? { id: creator.id, name: creator.name, staffCode: creator.staff_code || creator.staffCode }
        : null,
    }

    return NextResponse.json({ followup }, { status: 201 })
  } catch (err) {
    console.error('Error in POST /api/meetings/[id]/followups:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

