/**
 * Training sound effects.
 * Caches Audio elements after first call so subsequent plays are instant.
 * All errors (autoplay policy, missing file, etc.) are swallowed silently.
 */

const cache: Partial<Record<string, HTMLAudioElement>> = {}

function play(path: string, volume = 0.75) {
  if (typeof window === 'undefined') return
  try {
    if (!cache[path]) cache[path] = new Audio(path)
    const el = cache[path]!
    el.volume = volume
    el.currentTime = 0
    el.play().catch(() => {})
  } catch {}
}

export const SFX = {
  correct:  () => play('/sfx/CorrectAnswer.wav'),
  wrong:    () => play('/sfx/WrongAnswer.wav'),
  victory:  () => play('/sfx/Victory.wav'),
  fail:     () => play('/sfx/Fail.wav'),
  complete: () => play('/sfx/CompleteModule.wav', 0.8),
} as const
