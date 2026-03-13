import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import { noticeSchema } from '@/lib/validation'
import type { Notice } from '@/types/database'

// PATCH - Update notice
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
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
      .update({
        title: validation.data.title,
        content: validation.data.content,
        expiresAt: validation.data.expiresAt ? new Date(validation.data.expiresAt).toISOString() : null,
        pinned: validation.data.pinned,
        attachments: attachments || null,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notice:', error)
      return NextResponse.json(
        { error: 'Failed to update notice' },
        { status: 500 }
      )
    }

    return NextResponse.json(data as Notice)
  } catch (error) {
    console.error('Error in PATCH /api/notices/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Delete notice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = createServerClient()

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting notice:', error)
      return NextResponse.json(
        { error: 'Failed to delete notice' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/notices/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
