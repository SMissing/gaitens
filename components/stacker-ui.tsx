'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatScore } from '@/components/utils'
import type { StackerGameState, StackerSnapshot } from '@/components/use-stacker'

// ============================================================================
// Context
// ============================================================================

interface StackerUIContextValue {
  snapshot: StackerSnapshot
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  tryStack: () => void
  advanceAfterCheckpointQuiz: (wasCorrect: boolean) => void
}

const StackerUIContext = React.createContext<StackerUIContextValue | null>(null)

export function useStackerUI() {
  const context = React.useContext(StackerUIContext)
  if (!context) {
    throw new Error('Stacker UI components must be used within Stacker')
  }
  return context
}

export const StackerUIProvider = StackerUIContext.Provider

// ============================================================================
// HUD
// ============================================================================

export function StackerScore({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { snapshot } = useStackerUI()
  return (
    <div
      data-slot="stacker-score"
      className={cn(
        'tabular-nums font-semibold text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]',
        className
      )}
      {...props}
    >
      {formatScore(snapshot.score)}
    </div>
  )
}

export function StackerHighScore({
  label = 'HI',
  className,
  ...props
}: { label?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const { snapshot } = useStackerUI()
  return (
    <div
      data-slot="stacker-highscore"
      className={cn('tabular-nums text-zinc-400/90', className)}
      {...props}
    >
      <span className="text-zinc-500">{label}</span>{' '}
      <span className="text-fuchsia-200/90 drop-shadow-[0_0_12px_rgba(232,121,249,0.25)]">
        {formatScore(snapshot.highScore)}
      </span>
    </div>
  )
}

export function StackerHeight({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { snapshot } = useStackerUI()
  return (
    <div
      data-slot="stacker-height"
      className={cn('tabular-nums text-zinc-400/90', className)}
      {...props}
    >
      <span className="text-zinc-500">HT</span>{' '}
      <span className="text-amber-200/95 tabular-nums drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]">
        {snapshot.stack.length}
      </span>
      <span className="text-amber-200/35"> drops</span>
    </div>
  )
}

export function StackerHUD({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="stacker-hud"
      className={cn(
        'flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] bg-zinc-950/70 px-3 py-2.5 text-sm backdrop-blur-md sm:px-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// Overlay
// ============================================================================

export function StackerOverlay({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { snapshot } = useStackerUI()

  if (snapshot.state === 'playing') return null

  return (
    <div
      data-slot="stacker-overlay"
      data-state={snapshot.state}
      className={cn(
        'absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-black/65 via-cyan-950/40 to-fuchsia-950/30 backdrop-blur-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function StackerTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { snapshot } = useStackerUI()

  const titles: Record<StackerGameState, string> = {
    idle: 'STACKER',
    playing: '',
    paused: 'PAUSED',
    checkpointQuiz: 'CHECKPOINT',
    lost: 'MISSED',
  }

  return (
    <h2
      className={cn(
        "bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-center font-['Bebas_Neue',sans-serif] text-3xl font-normal tracking-[0.22em] text-transparent sm:text-4xl",
        className
      )}
      style={{ filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.5))' }}
      {...props}
    >
      {children ?? titles[snapshot.state]}
    </h2>
  )
}

function StackerMessage({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { snapshot } = useStackerUI()

  const messages: Partial<Record<StackerGameState, string>> = {
    idle: 'Space or tap the playfield to stack',
    paused: 'Space to resume',
    checkpointQuiz: `Score: ${formatScore(snapshot.score)}`,
    lost: `${snapshot.stack.length} drops · Score ${formatScore(snapshot.score)}`,
  }

  const m = messages[snapshot.state]
  if (!m) return null

  return (
    <p
      className={cn('mt-2 max-w-[20rem] text-center text-sm text-cyan-100/55', className)}
      {...props}
    >
      {m}
    </p>
  )
}

function StackerActionButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { snapshot, startGame, resumeGame, resetGame } = useStackerUI()

  if (
    snapshot.state === 'playing' ||
    snapshot.state === 'checkpointQuiz'
  ) {
    return null
  }

  const label: Partial<Record<StackerGameState, string>> = {
    idle: 'Start',
    paused: 'Resume',
    lost: 'Try again',
  }

  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto mt-6 rounded-full border border-cyan-300/45 bg-gradient-to-b from-cyan-400/25 to-cyan-600/10 px-6 py-2.5 text-sm font-semibold text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.25)] transition-colors hover:from-cyan-400/35 hover:to-cyan-500/20 active:scale-[0.98]',
        className
      )}
      onClick={() => {
        if (snapshot.state === 'idle') startGame()
        else if (snapshot.state === 'paused') resumeGame()
        else if (snapshot.state === 'lost') {
          resetGame()
          setTimeout(startGame, 80)
        }
      }}
      {...props}
    >
      {label[snapshot.state]}
    </button>
  )
}

// ============================================================================
// Training quiz (same API as Brick Breaker)
// ============================================================================

type QuizPayload = {
  courseId: string
  questionIndex: number
  moduleTitle: string
  venue: string
  question: string
  options: string[]
}

export function StackerInterstitialQuiz() {
  const { advanceAfterCheckpointQuiz } = useStackerUI()
  const [payload, setPayload] = React.useState<QuizPayload | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [noQuestions, setNoQuestions] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [feedback, setFeedback] = React.useState<'correct' | 'wrong' | null>(null)

  const fetchQuiz = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    setNoQuestions(false)
    setPayload(null)
    setSelected(null)
    setFeedback(null)
    try {
      const res = await fetch('/api/games/brick-breaker/training-quiz')
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        courseId?: string
        questionIndex?: number
        moduleTitle?: string
        venue?: string
        question?: string
        options?: string[]
      }

      if (res.status === 404 && data.error === 'no_questions') {
        setNoQuestions(true)
        return
      }

      if (!res.ok) {
        setLoadError(data.error || 'Could not load question')
        return
      }

      if (
        typeof data.courseId !== 'string' ||
        typeof data.questionIndex !== 'number' ||
        !Array.isArray(data.options)
      ) {
        setLoadError('Invalid response')
        return
      }

      setPayload({
        courseId: data.courseId,
        questionIndex: data.questionIndex,
        moduleTitle: data.moduleTitle ?? 'Training module',
        venue: data.venue ?? 'All venues',
        question: data.question ?? '',
        options: data.options,
      })
    } catch {
      setLoadError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void fetchQuiz()
  }, [fetchQuiz])

  const handleContinueWithoutQuiz = () => {
    advanceAfterCheckpointQuiz(true)
  }

  const handleConfirm = async () => {
    if (selected === null || !payload || submitting || feedback) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/games/brick-breaker/training-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: payload.courseId,
          questionIndex: payload.questionIndex,
          selectedIndex: selected,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { correct?: boolean }
      if (!res.ok) {
        setLoadError('Could not verify answer')
        setSubmitting(false)
        return
      }
      const correct = data.correct === true
      setFeedback(correct ? 'correct' : 'wrong')
      const delay = correct ? 550 : 1100
      await new Promise((r) => setTimeout(r, delay))
      advanceAfterCheckpointQuiz(correct)
    } catch {
      setLoadError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const actionButtonClass =
    'rounded-full border border-cyan-300/35 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-50/95 shadow-[0_0_24px_rgba(34,211,238,0.1)] transition-colors hover:bg-cyan-400/16 active:scale-[0.98]'

  return (
    <div
      className={cn(
        'pointer-events-auto mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-2',
        'max-h-[min(78dvh,34rem)] overflow-y-auto overscroll-contain'
      )}
    >
      {loading && (
        <div className="flex flex-col items-center gap-2 py-10 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          <span className="text-sm text-zinc-500">Loading question…</span>
        </div>
      )}

      {!loading && loadError && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/80 p-4 text-center">
          <p className="text-sm text-red-300/90">{loadError}</p>
          <button
            type="button"
            className={cn('w-full', actionButtonClass)}
            onClick={() => void fetchQuiz()}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && noQuestions && (
        <div className="space-y-3 rounded-xl border border-cyan-400/20 bg-zinc-900/80 p-4 text-center">
          <p className="text-sm text-zinc-300">
            No training quiz questions yet. Continue stacking.
          </p>
          <button
            type="button"
            className={cn('w-full', actionButtonClass)}
            onClick={handleContinueWithoutQuiz}
          >
            Continue
          </button>
        </div>
      )}

      {!loading && !loadError && !noQuestions && payload && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3
              className={cn(
                "px-1 font-['Bebas_Neue',sans-serif] text-[clamp(1.75rem,6vw,2.75rem)] font-normal leading-tight tracking-[0.12em] text-zinc-50"
              )}
            >
              {payload.venue}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug text-cyan-200/85 sm:text-base">
              {payload.moduleTitle}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Wrong answer halves your score. Select an option, then confirm.
            </p>
          </div>

          <p className="text-center text-sm leading-relaxed text-zinc-300 sm:text-[0.95rem]">
            {payload.question}
          </p>

          <div className="flex flex-col gap-2">
            {payload.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={submitting || feedback !== null}
                onClick={() => setSelected(i)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                  selected === i
                    ? 'border-cyan-300/45 bg-cyan-400/10 text-zinc-50'
                    : 'border-white/[0.1] bg-zinc-950/50 text-zinc-300 hover:border-white/20',
                  (submitting || feedback !== null) && 'opacity-60'
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback === 'correct' && (
            <p className="text-center text-sm font-medium text-emerald-400/95">
              Correct — keep going!
            </p>
          )}
          {feedback === 'wrong' && (
            <p className="text-center text-sm font-medium text-amber-300/95">
              Not quite — score halved. Continue…
            </p>
          )}

          <button
            type="button"
            disabled={selected === null || submitting || feedback !== null}
            className={cn(
              'w-full',
              actionButtonClass,
              'disabled:pointer-events-none disabled:opacity-40'
            )}
            onClick={() => void handleConfirm()}
          >
            {submitting && !feedback ? 'Checking…' : 'Confirm answer'}
          </button>
        </div>
      )}
    </div>
  )
}

function StackerCheckpointFlow() {
  const { snapshot } = useStackerUI()
  const [phase, setPhase] = React.useState<'summary' | 'quiz'>('summary')

  React.useEffect(() => {
    if (snapshot.state === 'checkpointQuiz') {
      setPhase('summary')
    }
  }, [snapshot.state])

  if (phase === 'summary') {
    return (
      <div className="pointer-events-auto flex max-w-[min(100%,22rem)] flex-col items-center px-4 py-2 text-center sm:max-w-md">
        <StackerTitle />
        <StackerMessage />
        <p className="mt-4 max-w-[18rem] text-xs text-zinc-500 sm:text-sm">
          Quick training question before the next block moves faster.
        </p>
        <button
          type="button"
          className="pointer-events-auto mt-6 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-6 py-2.5 text-sm font-semibold text-cyan-50/95 shadow-[0_0_24px_rgba(34,211,238,0.1)] transition-colors hover:bg-cyan-400/16 active:scale-[0.98]"
          onClick={() => setPhase('quiz')}
        >
          Continue
        </button>
      </div>
    )
  }

  return <StackerInterstitialQuiz />
}

function StackerOverlayBody() {
  const { snapshot } = useStackerUI()

  if (snapshot.state === 'checkpointQuiz') {
    return <StackerCheckpointFlow />
  }

  return (
    <>
      <StackerTitle />
      <StackerMessage />
      <p className="pointer-events-auto mt-4 max-w-[18rem] text-center text-xs text-zinc-500">
        {snapshot.state === 'idle' &&
          'Grid-based motion — misalignment shrinks your block. Stack as high as you can.'}
      </p>
      <StackerActionButton />
    </>
  )
}

/** Score strip (title lives in page header only) */
export function StackerChrome() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 border-b border-cyan-400/25 bg-gradient-to-r from-zinc-950/95 via-cyan-950/35 to-fuchsia-950/25 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <StackerHUD className="border-0 bg-transparent py-2 shadow-none backdrop-blur-none sm:py-2.5">
        <StackerScore className="text-base sm:text-lg" />
        <StackerHeight className="text-base sm:text-lg" />
        <StackerHighScore className="text-base sm:text-lg" />
      </StackerHUD>
    </div>
  )
}

export function StackerDefaultUI() {
  return (
    <>
      <StackerChrome />
      <StackerOverlay>
        <StackerOverlayBody />
      </StackerOverlay>
    </>
  )
}
