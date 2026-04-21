import type { QuizQuestion, TrainingCourse, User, UserRole } from '@/types/database'

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

/** Same rules as staff training list: all-site modules + venue-specific when assigned. */
export function trainingCourseAvailableToUser(
  role: UserRole,
  userSite: string | null,
  course: Pick<TrainingCourse, 'site'>
): boolean {
  if (role !== 'staff') return true
  if (!userSite) return course.site === null
  return course.site === null || course.site === userSite
}

export function userMayAccessTrainingCourse(
  user: User,
  course: Pick<TrainingCourse, 'site'>
): boolean {
  return trainingCourseAvailableToUser(user.role, user.site, course)
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
