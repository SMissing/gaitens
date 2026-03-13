import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// POST - Mark training module as complete
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const { courseId, score } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('training_courses')
      .select('id')
      .eq('id', courseId)
      .eq('active', true)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Training course not found' },
        { status: 404 }
      )
    }

    // Calculate expiration date (1 year from now)
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Check if already completed (and not expired)
    const { data: existing } = await supabase
      .from('training_completions')
      .select('id')
      .eq('userId', user.id)
      .eq('courseId', courseId)
      .gt('expiresAt', new Date().toISOString())
      .maybeSingle()

    if (existing) {
      // Update existing completion
      const { data: completion, error } = await supabase
        .from('training_completions')
        .update({
          completedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          score: score || null,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating training completion:', error)
        return NextResponse.json(
          { error: 'Failed to update completion' },
          { status: 500 }
        )
      }

      return NextResponse.json(completion)
    }

    // Create new completion
    const { data: completion, error } = await supabase
      .from('training_completions')
      .insert({
        userId: user.id,
        courseId,
        completedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        score: score || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating training completion:', error)
      return NextResponse.json(
        { error: 'Failed to mark as complete' },
        { status: 500 }
      )
    }

    return NextResponse.json(completion)
  } catch (error) {
    console.error('Error in POST /api/training/complete:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
