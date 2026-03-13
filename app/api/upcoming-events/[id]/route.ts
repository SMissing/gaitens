import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient, createAdminClient } from '@/lib/db'
import { requireManager } from '@/lib/auth'

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().max(2000, 'Description is too long').nullish(),
  eventDate: z.string().optional(),
  eventTime: z.string().nullish(),
  location: z.string().max(200, 'Location is too long').nullish(),
  imageUrl: z.string().nullish(),
  imagePath: z.string().nullish(),
})

// PATCH - Update upcoming event (managers and admins only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title.trim()
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description?.trim() || null
    }
    if (validatedData.eventDate !== undefined) {
      updateData.eventDate = validatedData.eventDate
    }
    if (validatedData.eventTime !== undefined) {
      updateData.eventTime = validatedData.eventTime || null
    }
    if (validatedData.location !== undefined) {
      updateData.location = validatedData.location?.trim() || null
    }
    if (validatedData.imageUrl !== undefined) {
      updateData.imageUrl = validatedData.imageUrl || null
    }
    if (validatedData.imagePath !== undefined) {
      updateData.imagePath = validatedData.imagePath || null
    }

    const { data: event, error } = await supabase
      .from('upcoming_events')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating upcoming event:', error)
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in PATCH /api/upcoming-events/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Delete upcoming event (managers and admins only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()
    // Try to use admin client (bypasses RLS), fallback to regular client
    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      // Fallback to regular client if service key not available
      supabase = createServerClient()
    }

    // Get event to delete image if it exists
    const { data: event } = await supabase
      .from('upcoming_events')
      .select('imagePath')
      .eq('id', params.id)
      .single()

    // Delete image from storage if it exists
    if (event?.imagePath) {
      await supabase.storage
        .from('photo-albums')
        .remove([event.imagePath])
    }

    // Delete event from database
    const { error } = await supabase
      .from('upcoming_events')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting upcoming event:', error)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/upcoming-events/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
