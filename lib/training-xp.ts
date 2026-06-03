const XP_KEY = 'gl_training_xp'
const STREAK_KEY = 'gl_training_streak'
const LAST_ACTIVITY_KEY = 'gl_training_last_activity'
const RESUME_PREFIX = 'gl_training_resume_'

export const PRACTICE_XP = 25

export function calculateCourseXP(duration: number | null | undefined): number {
  return Math.max(50, (duration ?? 0) * 10)
}

export function getTotalXP(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(XP_KEY) ?? '0', 10)
}

export function addXP(amount: number): number {
  const next = getTotalXP() + amount
  localStorage.setItem(XP_KEY, String(next))
  return next
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(STREAK_KEY) ?? '0', 10)
}

export function updateStreak(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toDateString()
  const last = localStorage.getItem(LAST_ACTIVITY_KEY)
  const yesterday = new Date(Date.now() - 86_400_000).toDateString()
  let streak = getStreak()
  if (last === today) return streak
  streak = last === yesterday ? streak + 1 : 1
  localStorage.setItem(STREAK_KEY, String(streak))
  localStorage.setItem(LAST_ACTIVITY_KEY, today)
  return streak
}

export function saveResumeState(courseId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${RESUME_PREFIX}${courseId}`, '1')
}

export function hasResumeState(courseId: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`${RESUME_PREFIX}${courseId}`) === '1'
}

export function clearResumeState(courseId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${RESUME_PREFIX}${courseId}`)
}

/**
 * Records a training activity (module completion or practice).
 * Updates localStorage immediately for instant UI feedback, then syncs to the
 * database via /api/checkin so both streak systems stay in lockstep.
 * Returns the authoritative streak (database value if reachable, localStorage fallback).
 */
export async function recordTrainingActivity(): Promise<number> {
  const localStreak = updateStreak() // sync, instant — keeps UI responsive
  try {
    const res = await fetch('/api/checkin', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      if (typeof data.currentStreak === 'number') {
        localStorage.setItem(STREAK_KEY, String(data.currentStreak))
        return data.currentStreak
      }
    }
  } catch {}
  return localStreak
}
