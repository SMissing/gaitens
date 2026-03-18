import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

const venueSchema = z.enum(['Garrison', 'Spirits', 'Bassment'])

const createVenueNumberLogSchema = z.object({
  venue: venueSchema,
  numbers: z.string().min(1).max(50),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const validated = createVenueNumberLogSchema.parse(body)

    const { data, error } = await supabase
      .from('venue_numbers_log')
      .insert({
        user_id: user.id,
        venue: validated.venue,
        numbers: validated.numbers.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating venue numbers log:', error)
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
    }

    return NextResponse.json({ entry: data })
  } catch (err) {
    console.error('Error in POST /api/venue-numbers:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit') || 20), 100)

    const { data, error } = await supabase
      .from('venue_numbers_log')
      .select('id, user_id, venue, numbers, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching my venue numbers log:', error)
      return NextResponse.json({ entries: [] })
    }

    return NextResponse.json({ entries: data })
  } catch (err) {
    console.error('Error in GET /api/venue-numbers:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

