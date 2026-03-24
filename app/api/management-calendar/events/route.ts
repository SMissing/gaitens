import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { parseYyyyMmDdLocal, toYyyyMmDdLocal } from '@/lib/date-utils'
import {
  createEventSchema,
  ymdSchema,
  type ManagementCalendarEventRow,
  validatedBodyToInsertRow,
} from '@/lib/management-calendar-events-schema'

type Occurrence = {
  occurrenceId: string
  eventId: string
  title: string
  eventType: ManagementCalendarEventRow['event_type']
  description: string | null
  site: string | null
  date: string // YYYY-MM-DD
  startTime: string | null
  endTime: string | null
}

function diffInDays(a: Date, b: Date): number {
  // Use UTC midnight to avoid DST skew.
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((utcB - utcA) / 86400000)
}

function clampDate(d: Date, min: Date, max: Date): Date {
  if (d < min) return min
  if (d > max) return max
  return d
}

function expandOccurrencesForEvent(params: {
  event: ManagementCalendarEventRow
  rangeStart: Date
  rangeEnd: Date
}): Occurrence[] {
  const { event, rangeStart, rangeEnd } = params

  const eventStart = parseYyyyMmDdLocal(event.start_date)
  const eventEnd = event.end_date ? parseYyyyMmDdLocal(event.end_date) : eventStart
  const effectiveStart = clampDate(eventStart, rangeStart, rangeEnd)

  if (event.recurrence_type === 'none') {
    const effectiveEnd = clampDate(eventEnd, rangeStart, rangeEnd)
    if (effectiveStart > effectiveEnd) return []

    const occurrences: Occurrence[] = []
    const current = new Date(effectiveStart)
    while (current <= effectiveEnd) {
      const date = toYyyyMmDdLocal(current)
      occurrences.push({
        occurrenceId: `${event.id}:${date}`,
        eventId: event.id,
        title: event.title,
        eventType: event.event_type,
        description: event.description,
        site: event.site,
        date,
        startTime: event.start_time,
        endTime: event.end_time,
      })
      current.setDate(current.getDate() + 1)
    }

    return occurrences
  }

  // Weekly recurrence MVP: expand occurrences matching recurrence_weekday
  const weekday = event.recurrence_weekday ?? eventStart.getDay()
  const intervalWeeks = Math.max(1, event.recurrence_interval || 1)
  const until = event.recurrence_end_date ? parseYyyyMmDdLocal(event.recurrence_end_date) : rangeEnd

  const occStart = clampDate(effectiveStart, eventStart, until)
  const occEnd = clampDate(rangeEnd, occStart, until)
  if (occStart > occEnd) return []

  // Find the first matching weekday occurrence on/after occStart.
  const current = new Date(occStart)
  while (current <= occEnd && current.getDay() !== weekday) {
    current.setDate(current.getDate() + 1)
  }
  if (current > occEnd) return []

  // Align interval parity to the event's original start_date.
  // If intervalWeeks > 1, we might land on the "wrong" week.
  while (current <= occEnd) {
    const weekIndex = Math.floor(diffInDays(eventStart, current) / 7)
    if (weekIndex % intervalWeeks === 0) {
      return expandWeeklyFollowingOccurrences({
        event,
        eventStart,
        weekday,
        intervalWeeks,
        current,
        occEnd,
        rangeEnd,
      })
    }
    current.setDate(current.getDate() + 7)
  }

  return []
}

function expandWeeklyFollowingOccurrences(params: {
  event: ManagementCalendarEventRow
  eventStart: Date
  weekday: number
  intervalWeeks: number
  current: Date
  occEnd: Date
  rangeEnd: Date
}): Occurrence[] {
  const { event, eventStart, intervalWeeks, occEnd, weekday } = params
  const occurrences: Occurrence[] = []

  let cursor = new Date(params.current)
  // cursor already represents a matching weekday with correct parity.
  while (cursor <= occEnd) {
    const weekIndex = Math.floor(diffInDays(eventStart, cursor) / 7)
    if (cursor.getDay() === weekday && weekIndex % intervalWeeks === 0) {
      const date = toYyyyMmDdLocal(cursor)
      occurrences.push({
        occurrenceId: `${event.id}:${date}`,
        eventId: event.id,
        title: event.title,
        eventType: event.event_type,
        description: event.description,
        site: event.site,
        date,
        startTime: event.start_time,
        endTime: event.end_time,
      })
    }
    cursor.setDate(cursor.getDate() + 7 * intervalWeeks)
  }

  return occurrences
}

// GET - List expanded occurrences for a date range
export async function GET(request: NextRequest) {
  try {
    await requireManager()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required (YYYY-MM-DD)' },
        { status: 400 },
      )
    }

    const parsedRange = z.object({ startDate: ymdSchema, endDate: ymdSchema }).safeParse({
      startDate,
      endDate,
    })
    if (!parsedRange.success) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const rangeStart = parseYyyyMmDdLocal(startDate)
    const rangeEnd = parseYyyyMmDdLocal(endDate)
    if (rangeEnd < rangeStart) {
      return NextResponse.json({ error: 'endDate must be >= startDate' }, { status: 400 })
    }

    const { data: events, error } = await supabase
      .from('management_calendar_events')
      .select('*')
      .eq('visible', true)
      .lte('start_date', endDate) // basic prefilter; expansion will handle recurrence

    if (error) {
      console.error('Error fetching management_calendar_events:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    const rows = (events || []) as ManagementCalendarEventRow[]
    const expanded = rows.flatMap((event) =>
      expandOccurrencesForEvent({
        event,
        rangeStart,
        rangeEnd,
      }),
    )

    expanded.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    return NextResponse.json({ occurrences: expanded })
  } catch (err) {
    console.error('Error in GET /api/management-calendar/events:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// POST - Create a new management calendar event
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager()
    const supabase = createServerClient()

    const body = await request.json()
    const validated = createEventSchema.parse(body)

    const event = {
      ...validatedBodyToInsertRow(validated),
      created_by: user.id,
    }

    const { data, error } = await supabase
      .from('management_calendar_events')
      .insert(event)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating management calendar event:', error)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 })
    }
    console.error('Error in POST /api/management-calendar/events:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

