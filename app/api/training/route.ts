import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireManager } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import type { TrainingCourse } from '@/types/database'

// GET - Get training modules (filtered by user's site for required ones)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('all') === 'true' // For managers/admins to see all

    let query = supabase
      .from('training_courses')
      .select('*, users:createdBy(id, name)')
      .eq('active', true)
      .order('createdAt', { ascending: false })

    // Managers and admins see all modules, staff see filtered modules
    if (user.role === 'staff') {
      // Staff see: all modules (site = null) OR modules for their site
      // Required modules are those matching their site
      if (user.site) {
        query = query.or(`site.is.null,site.eq.${user.site}`)
      } else {
        // Staff with no site only see general modules
        query = query.is('site', null)
      }
    }
    // Managers and admins see all modules (no filtering)

    const { data: courses, error } = await query

    if (error) {
      console.error('Error fetching training courses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch training courses' },
        { status: 500 }
      )
    }

    // Get user's completions
    const { data: completions } = await supabase
      .from('training_completions')
      .select('courseId, completedAt, expiresAt')
      .eq('userId', user.id)
      .gt('expiresAt', new Date().toISOString())

    const completedCourseIds = new Set(
      completions?.map(c => c.courseId) || []
    )

    // Mark which courses are required for this user's site
    const coursesWithStatus = courses?.map(course => ({
      ...course,
      completed: completedCourseIds.has(course.id),
      required:
        course.requiredScope === 'all'
          ? true
          : course.requiredScope === 'site'
            ? course.site === user.site
            : false,
      completion: completions?.find(c => c.courseId === course.id),
    }))

    return NextResponse.json(coursesWithStatus || [])
  } catch (error) {
    console.error('Error in GET /api/training:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// POST - Create new training module (managers only)
export async function POST(request: NextRequest) {
  try {
    await requireManager()
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const { title, description, videoUrl, content, quizQuestions, site, category, moduleType, duration, requiredScope } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate quiz questions format if provided
    if (quizQuestions && Array.isArray(quizQuestions)) {
      for (const q of quizQuestions) {
        if (!q.question || !Array.isArray(q.options) || typeof q.correctAnswer !== 'number') {
          return NextResponse.json(
            { error: 'Invalid quiz question format' },
            { status: 400 }
          )
        }
      }
    }

    const { data: course, error } = await supabase
      .from('training_courses')
      .insert({
        title,
        description: description || null,
        videoUrl: videoUrl || null,
        content: content || null,
        quizQuestions: quizQuestions || [],
        site: site || null, // null means available to all sites
        category: category || null,
        createdBy: user.id,
        moduleType: moduleType || 'video',
        duration: duration || null,
        requiredScope: requiredScope || 'none',
        active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating training course:', error)
      return NextResponse.json(
        { error: 'Failed to create training course' },
        { status: 500 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error in POST /api/training:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
