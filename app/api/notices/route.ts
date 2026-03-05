import { NextRequest, NextResponse } from 'next/server'
import { requireManager, getCurrentUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { noticeSchema } from '@/lib/validation'
import type { Notice } from '@/types/database'

// POST - Create new notice
export async function POST(request: NextRequest) {
  try {
    const user = await requireManager()
    const supabase = createServerClient()
    
    const body = await request.json()
    const { title, content, expiresAt, pinned, attachments } = body

    // Validate input
    const validation = noticeSchema.safeParse({
      title,
      content,
      expiresAt: expiresAt || null,
      pinned: pinned || false,
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notices')
      .insert({
        title: validation.data.title,
        content: validation.data.content,
        expiresAt: validation.data.expiresAt ? new Date(validation.data.expiresAt).toISOString() : null,
        pinned: validation.data.pinned,
        attachments: attachments || null,
        createdBy: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notice:', error)
      return NextResponse.json(
        { error: 'Failed to create notice' },
        { status: 500 }
      )
    }

    return NextResponse.json(data as Notice, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/notices:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
