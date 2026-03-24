import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import {
  createEventSchema,
  rowToClientEvent,
  type ManagementCalendarEventRow,
  validatedBodyToUpdateRow,
} from '@/lib/management-calendar-events-schema'

const idSchema = z.string().uuid()

// GET — load one event (admins only; used for edit form)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin()
    const parsedId = idSchema.safeParse(params.id)
    if (!parsedId.success) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('management_calendar_events')
      .select('*')
      .eq('id', parsedId.data)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const row = data as ManagementCalendarEventRow
    return NextResponse.json({ event: rowToClientEvent(row) })
  } catch (err) {
    console.error('Error in GET /api/management-calendar/events/[id]:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// PATCH — replace event fields (admins only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin()
    const parsedId = idSchema.safeParse(params.id)
    if (!parsedId.success) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
    }

    const body = await request.json()
    const validated = createEventSchema.parse(body)
    const updates = validatedBodyToUpdateRow(validated)

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('management_calendar_events')
      .update(updates)
      .eq('id', parsedId.data)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating management calendar event:', error)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const row = data as ManagementCalendarEventRow
    return NextResponse.json({ event: rowToClientEvent(row) })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 })
    }
    console.error('Error in PATCH /api/management-calendar/events/[id]:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// DELETE — remove event (admins only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin()
    const parsedId = idSchema.safeParse(params.id)
    if (!parsedId.success) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase.from('management_calendar_events').delete().eq('id', parsedId.data)

    if (error) {
      console.error('Error deleting management calendar event:', error)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in DELETE /api/management-calendar/events/[id]:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
