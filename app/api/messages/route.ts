import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
})

// GET /api/messages - Fetch messages with pagination
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const supabase = createServerClient()

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch messages with user information
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        userId,
        content,
        createdAt,
        users:userId (
          id,
          name,
          site
        )
      `)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: messages || [] }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = messageSchema.parse(body)

    // Insert new message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        userId: user.id,
        content: validatedData.content.trim(),
      })
      .select(`
        id,
        userId,
        content,
        createdAt,
        users:userId (
          id,
          name,
          site
        )
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to create message', details: error.message },
        { status: 500 }
      )
    }

    if (!message) {
      console.error('Message created but no data returned')
      return NextResponse.json(
        { error: 'Message created but failed to retrieve' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error in POST /api/messages:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
