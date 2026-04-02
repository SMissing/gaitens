import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'
import {
  courseHasUsableQuiz,
  isValidQuizQuestion,
  trainingVenueLabel,
  userMayAccessTrainingCourse,
} from '@/lib/brick-breaker-training-quiz'
import type { QuizQuestion, TrainingCourse } from '@/types/database'

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * GET — random training quiz question the user is allowed to see (same rules as /api/training).
 * POST — verify answer without exposing correct index in GET.
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    let query = supabase
      .from('training_courses')
      .select('id, title, site, category, quizQuestions')
      .eq('active', true)
      .order('createdAt', { ascending: false })

    if (user.role === 'staff') {
      if (user.site) {
        query = query.or(`site.is.null,site.eq.${user.site}`)
      } else {
        query = query.is('site', null)
      }
    }

    const { data: courses, error } = await query

    if (error) {
      console.error('brick-breaker training-quiz GET:', error)
      return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 })
    }

    const list = (courses || []) as Pick<
      TrainingCourse,
      'id' | 'title' | 'site' | 'category' | 'quizQuestions'
    >[]

    const withQuiz = list.filter(courseHasUsableQuiz)
    const course = pickRandom(withQuiz)
    if (!course) {
      return NextResponse.json(
        { error: 'no_questions', message: 'No training quiz questions available yet.' },
        { status: 404 }
      )
    }

    const validIndices: number[] = []
    course.quizQuestions.forEach((q, i) => {
      if (isValidQuizQuestion(q)) validIndices.push(i)
    })
    const questionIndex = pickRandom(validIndices)
    if (questionIndex === undefined) {
      return NextResponse.json({ error: 'no_questions' }, { status: 404 })
    }

    const q = course.quizQuestions[questionIndex] as QuizQuestion

    return NextResponse.json({
      courseId: course.id,
      questionIndex,
      moduleTitle: course.title,
      category: course.category ?? 'General',
      venue: trainingVenueLabel(course.site),
      question: q.question,
      options: q.options,
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = (await request.json()) as {
      courseId?: string
      questionIndex?: number
      selectedIndex?: number
    }

    const courseId = typeof body.courseId === 'string' ? body.courseId : ''
    const questionIndex =
      typeof body.questionIndex === 'number' && Number.isInteger(body.questionIndex)
        ? body.questionIndex
        : -1
    const selectedIndex =
      typeof body.selectedIndex === 'number' && Number.isInteger(body.selectedIndex)
        ? body.selectedIndex
        : -1

    if (!courseId || questionIndex < 0 || selectedIndex < 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data: course, error } = await supabase
      .from('training_courses')
      .select('id, site, quizQuestions, active')
      .eq('id', courseId)
      .eq('active', true)
      .single()

    if (error || !course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const c = course as Pick<TrainingCourse, 'id' | 'site' | 'quizQuestions' | 'active'>

    if (!userMayAccessTrainingCourse(user, c)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const q = c.quizQuestions?.[questionIndex]
    if (!isValidQuizQuestion(q)) {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 })
    }

    const correct = q.correctAnswer === selectedIndex
    return NextResponse.json({ correct })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
