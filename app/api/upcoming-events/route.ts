import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth, requireManager } from '@/lib/auth'

const upcomingEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').nullish(),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().nullish(),
  location: z.string().max(200, 'Location is too long').nullish(),
  imageUrl: z.string().nullish(),
  imagePath: z.string().nullish(),
})

// GET - Fetch upcoming events (all authenticated users)
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    let query = supabase
      .from('upcoming_events')
      .select(`
        *,
        users:createdBy (
          id,
          name,
          site
        )
      `)
      .order('eventDate', { ascending: true })
      .order('eventTime', { ascending: true, nullsFirst: false })

    if (fromDate) {
      query = query.gte('eventDate', fromDate)
    }

    if (toDate) {
      query = query.lte('eventDate', toDate)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching upcoming events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Transform the data to match component expectations
    const transformedEvents = (events || []).map((event: any) => {
      const userData = Array.isArray(event.users) ? event.users[0] : event.users
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        location: event.location,
        imageUrl: event.imageUrl,
        imagePath: event.imagePath,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        createdBy: userData ? {
          id: userData.id,
          name: userData.name,
          site: userData.site ?? null,
        } : { id: '', name: 'Unknown', site: null }
      }
    })

    return NextResponse.json({ events: transformedEvents })
  } catch (error) {
    console.error('Error in GET /api/upcoming-events:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create a new upcoming event (managers and admins only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager() // Managers and admins
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = upcomingEventSchema.parse(body)

    // Insert the event
    const { data: event, error } = await supabase
      .from('upcoming_events')
      .insert({
        title: validatedData.title.trim(),
        description: validatedData.description?.trim() || null,
        eventDate: validatedData.eventDate,
        eventTime: validatedData.eventTime || null,
        location: validatedData.location?.trim() || null,
        imageUrl: validatedData.imageUrl || null,
        imagePath: validatedData.imagePath || null,
        createdBy: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating upcoming event:', error)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/upcoming-events:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
