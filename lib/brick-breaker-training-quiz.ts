import type { QuizQuestion, TrainingCourse, User } from '@/types/database'

/** Human-readable venue label for training `site` (matches training UI naming). */
export function trainingVenueLabel(site: string | null): string {
  if (!site) return 'All venues'
  const map: Record<string, string> = {
    Garrison: 'Garrison',
    Spirits: 'Spirits Bar & Games',
    Bassment: 'Bassment',
  }
  return map[site] ?? site
}

export function userMayAccessTrainingCourse(
  user: User,
  course: Pick<TrainingCourse, 'site'>
): boolean {
  if (user.role !== 'staff') return true
  if (!user.site) return course.site === null
  return course.site === null || course.site === user.site
}

export function isValidQuizQuestion(q: unknown): q is QuizQuestion {
  if (!q || typeof q !== 'object') return false
  const o = q as Record<string, unknown>
  return (
    typeof o.question === 'string' &&
    o.question.length > 0 &&
    Array.isArray(o.options) &&
    o.options.length >= 2 &&
    o.options.every((x) => typeof x === 'string') &&
    typeof o.correctAnswer === 'number' &&
    o.correctAnswer >= 0 &&
    o.correctAnswer < o.options.length
  )
}

export function courseHasUsableQuiz(course: Pick<TrainingCourse, 'quizQuestions'>): boolean {
  const qs = course.quizQuestions
  if (!Array.isArray(qs) || qs.length === 0) return false
  return qs.some(isValidQuizQuestion)
}
