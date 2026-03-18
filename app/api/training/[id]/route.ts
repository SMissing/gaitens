import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// PUT - Update training module (managers only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()
    const supabase = createServerClient()

    const body = await request.json()
    const { title, description, videoUrl, content, quizQuestions, site, category, moduleType, duration, active, requiredScope } = body

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl
    if (content !== undefined) updateData.content = content
    if (quizQuestions !== undefined) updateData.quizQuestions = quizQuestions
    if (site !== undefined) updateData.site = site
    if (category !== undefined) updateData.category = category
    if (moduleType !== undefined) updateData.moduleType = moduleType
    if (duration !== undefined) updateData.duration = duration
    if (requiredScope !== undefined) updateData.requiredScope = requiredScope
    if (active !== undefined) updateData.active = active

    const { data: course, error } = await supabase
      .from('training_courses')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating training course:', error)
      return NextResponse.json(
        { error: 'Failed to update training course' },
        { status: 500 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error in PUT /api/training/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Delete training module (managers only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireManager()
    const supabase = createServerClient()

    // Soft delete by setting active to false
    const { error } = await supabase
      .from('training_courses')
      .update({ active: false })
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting training course:', error)
      return NextResponse.json(
        { error: 'Failed to delete training course' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/training/[id]:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
