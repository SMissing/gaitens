/**
 * Training sound effects — preloaded as Blob URLs so playback is instant.
 *
 * Call SFX.preloadAll() when the lesson component mounts. All five files are
 * fetched in parallel and decoded into in-memory Audio elements. By the time
 * the user reaches the quiz, every sound fires with zero network latency.
 */

const SOUNDS = {
  correct:  '/sfx/CorrectAnswer.wav',
  wrong:    '/sfx/WrongAnswer.wav',
  victory:  '/sfx/Victory.wav',
  fail:     '/sfx/Fail.wav',
  complete: '/sfx/CompleteModule.wav',
} as const

type SoundKey = keyof typeof SOUNDS

const VOLUME: Record<SoundKey, number> = {
  correct:  0.75,
  wrong:    0.75,
  victory:  0.8,
  fail:     0.7,
  complete: 0.85,
}

const elements: Partial<Record<SoundKey, HTMLAudioElement>> = {}
let preloadStarted = false

async function doPreload() {
  const entries = Object.entries(SOUNDS) as [SoundKey, string][]

  await Promise.allSettled(
    entries.map(async ([key, path]) => {
      try {
        const res  = await fetch(path)
        const blob = await res.blob()
        const url  = URL.createObjectURL(blob)
        const el   = new Audio(url)
        el.volume  = VOLUME[key]
        el.preload = 'auto'
        el.load()                   // force browser to decode immediately
        elements[key] = el
      } catch {}
    }),
  )
}

function play(key: SoundKey) {
  const el = elements[key]
  if (!el) return
  try {
    el.currentTime = 0
    el.play().catch(() => {})
  } catch {}
}

export const SFX = {
  /** Fetch and decode all sounds in parallel. Safe to call multiple times. */
  preloadAll(): void {
    if (typeof window === 'undefined' || preloadStarted) return
    preloadStarted = true
    doPreload()
  },
  correct:  () => play('correct'),
  wrong:    () => play('wrong'),
  victory:  () => play('victory'),
  fail:     () => play('fail'),
  complete: () => play('complete'),
} as const
