import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createAdminClient, createServerClient } from '@/lib/db'

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
      .select('id, title')
      .eq('id', courseId)
      .eq('active', true)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Training course not found' },
        { status: 404 }
      )
    }

    // Calculate expiration date (+4 months from now)
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 4)

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

    // Award matching achievement badge (best-effort MVP)
    // Mapping rule: training_courses.title === achievements.name
    try {
      const adminSupabase = createAdminClient()

      if (course?.title) {
        const { data: achievement } = await adminSupabase
          .from('achievements')
          .select('id, name, requiresProgress, requiredCount')
          .eq('name', course.title)
          .maybeSingle()

        if (achievement?.id) {
          const { data: existingUA } = await adminSupabase
            .from('user_achievements')
            .select('id, completed, currentProgress')
            .eq('userId', user.id)
            .eq('achievementId', achievement.id)
            .maybeSingle()

          const targetProgress = achievement.requiresProgress ? Math.max(achievement.requiredCount || 1, 1) : 1
          const completed = !achievement.requiresProgress || targetProgress >= (achievement.requiredCount || 1)

          if (!existingUA) {
            await adminSupabase.from('user_achievements').insert({
              userId: user.id,
              achievementId: achievement.id,
              currentProgress: targetProgress,
              completed,
              awardedBy: null,
              awardedAt: new Date().toISOString(),
            })
          } else if (!existingUA.completed && completed) {
            await adminSupabase
              .from('user_achievements')
              .update({
                currentProgress: targetProgress,
                completed: true,
                awardedBy: null,
                awardedAt: new Date().toISOString(),
              })
              .eq('id', existingUA.id)
          }
        }
      }
    } catch (e) {
      console.warn('[training] badge awarding failed (best-effort):', e)
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
