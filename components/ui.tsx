'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlayfieldMetrics } from '@/components/brick-breaker-playfield-metrics'
import type { GameSnapshot, GameState } from './types'
import { formatScore } from './utils'

// ============================================================================
// Context
// ============================================================================

interface BrickBreakerUIContextValue {
  snapshot: GameSnapshot
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  advanceAfterLevelQuiz: (wasCorrect: boolean) => void
}

const BrickBreakerUIContext =
  React.createContext<BrickBreakerUIContextValue | null>(null)

export function useBrickBreakerUI() {
  const context = React.useContext(BrickBreakerUIContext)
  if (!context) {
    throw new Error(
      'BrickBreaker UI components must be used within BrickBreakerRoot'
    )
  }
  return context
}

export const BrickBreakerUIProvider = BrickBreakerUIContext.Provider

// ============================================================================
// HUD Components
// ============================================================================

interface ScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show combo multiplier */
  showCombo?: boolean
}

export function BrickBreakerScore({
  showCombo = true,
  className,
  ...props
}: ScoreProps) {
  const { snapshot } = useBrickBreakerUI()

  return (
    <div
      data-slot="brick-breaker-score"
      className={cn('flex min-w-0 flex-col', className)}
      {...props}
    >
      <span className="font-semibold tabular-nums tracking-tight text-zinc-50">
        {formatScore(snapshot.score)}
      </span>
      {showCombo && snapshot.combo > 0 && snapshot.state === 'playing' && (
        <span className="text-muted-foreground text-xs tabular-nums">
          ×
          {snapshot.garrisonDoubleActive
            ? (snapshot.combo + 1) * 2
            : snapshot.combo + 1}
        </span>
      )}
    </div>
  )
}

interface HighScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label prefix */
  label?: string
}

export function BrickBreakerHighScore({
  label = 'HI',
  className,
  ...props
}: HighScoreProps) {
  const { snapshot } = useBrickBreakerUI()

  return (
    <div
      data-slot="brick-breaker-highscore"
      className={cn('tabular-nums text-zinc-400', className)}
      {...props}
    >
      <span className="text-zinc-500">{label}</span>{' '}
      <span className="tabular-nums text-amber-200/95">
        {formatScore(snapshot.highScore)}
      </span>
    </div>
  )
}

interface LevelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show total levels */
  showTotal?: boolean
  /** Label prefix */
  label?: string
}

export function BrickBreakerLevel({
  showTotal = true,
  label = 'LVL',
  className,
  ...props
}: LevelProps) {
  const { snapshot } = useBrickBreakerUI()

  return (
    <div
      data-slot="brick-breaker-level"
      className={cn('tabular-nums text-zinc-400', className)}
      {...props}
    >
      <span className="text-zinc-500">{label}</span>{' '}
      <span className="tabular-nums text-zinc-200">
        {snapshot.level}
        {showTotal && `/${snapshot.totalLevels}`}
      </span>
    </div>
  )
}

interface LivesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render function for each life indicator */
  renderLife?: (index: number, isActive: boolean) => React.ReactNode
}

export function BrickBreakerLives({
  renderLife,
  className,
  ...props
}: LivesProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultRenderLife = (index: number) => (
    <span
      key={index}
      className="size-2 rounded-full bg-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.25)]"
    />
  )

  return (
    <div
      data-slot="brick-breaker-lives"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {Array.from({ length: snapshot.lives }, (_, i) =>
        renderLife ? renderLife(i, true) : defaultRenderLife(i)
      )}
    </div>
  )
}

// ============================================================================
// Canvas Slot - marks where the canvas should render
// ============================================================================

export interface BrickBreakerCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional class names for the canvas wrapper */
  className?: string
}

/**
 * Slot component that marks where the game canvas should be rendered.
 * Use this to control canvas placement within your layout.
 * Props are passed to the canvas wrapper div.
 */
export function BrickBreakerCanvas(_props: BrickBreakerCanvasProps) {
  // This is a marker component - actual canvas is rendered by BrickBreaker
  // The props are read by BrickBreaker and applied to the canvas wrapper
  return null
}

// Internal marker to identify canvas slot
BrickBreakerCanvas.displayName = 'BrickBreakerCanvas'

// ============================================================================
// HUD Container
// ============================================================================

interface HUDProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BrickBreakerHUD({ children, className, ...props }: HUDProps) {
  return (
    <div
      data-slot="brick-breaker-hud"
      className={cn(
        'flex shrink-0 items-center justify-between gap-2 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// Overlay Components
// ============================================================================

interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BrickBreakerOverlay({
  children,
  className,
  ...props
}: OverlayProps) {
  const { snapshot } = useBrickBreakerUI()

  if (snapshot.state === 'playing') return null

  return (
    <div
      data-slot="brick-breaker-overlay"
      data-state={snapshot.state}
      className={cn(
        'pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/58 backdrop-blur-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

BrickBreakerOverlay.displayName = 'BrickBreakerOverlay'

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
}

export function BrickBreakerTitle({
  children,
  className,
  ...props
}: TitleProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultTitles: Record<GameState, string> = {
    idle: 'BRICK BREAKER',
    playing: '',
    paused: 'PAUSED',
    won: 'YOU WIN!',
    lost: 'GAME OVER',
    levelComplete: 'LEVEL COMPLETE!',
  }

  return (
    <h2
      data-slot="brick-breaker-title"
      className={cn(
        "text-center font-['Bebas_Neue',sans-serif] text-3xl font-normal tracking-[0.14em] text-zinc-50 sm:text-4xl",
        className
      )}
      {...props}
    >
      {children ?? defaultTitles[snapshot.state]}
    </h2>
  )
}

interface MessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export function BrickBreakerMessage({
  children,
  className,
  ...props
}: MessageProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultMessages: Partial<Record<GameState, string>> = {
    idle: 'Click or press Space to start',
    paused: 'Press Space to resume',
    won: snapshot.score >= snapshot.highScore ? 'NEW HIGH SCORE!' : undefined,
    lost: `Score: ${formatScore(snapshot.score)}`,
    levelComplete: `Score: ${formatScore(snapshot.score)}`,
  }

  const message = children ?? defaultMessages[snapshot.state]
  if (!message) return null

  return (
    <p
      data-slot="brick-breaker-message"
      className={cn('mt-2 text-zinc-400', className)}
      {...props}
    >
      {message}
    </p>
  )
}

interface HintProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export function BrickBreakerHint({ children, className, ...props }: HintProps) {
  const { snapshot } = useBrickBreakerUI()

  const defaultHints: Partial<Record<GameState, string>> = {
    won: 'Press R to play again',
    lost: 'Press R to try again',
    levelComplete: 'Click to continue',
  }

  const hint = children ?? defaultHints[snapshot.state]
  if (!hint) return null

  return (
    <p
      data-slot="brick-breaker-hint"
      className={cn('mt-4 text-sm text-zinc-500', className)}
      {...props}
    >
      {hint}
    </p>
  )
}

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function BrickBreakerScoreDisplay({
  children,
  className,
  ...props
}: ScoreDisplayProps) {
  const { snapshot } = useBrickBreakerUI()

  if (snapshot.state === 'idle' || snapshot.state === 'playing') return null

  return (
    <div
      data-slot="brick-breaker-score-display"
      className={cn('mt-4 text-lg font-medium text-zinc-100', className)}
      {...props}
    >
      {children ?? `Score: ${formatScore(snapshot.score)}`}
    </div>
  )
}

// ============================================================================
// Action Button
// ============================================================================

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

export function BrickBreakerActionButton({
  children,
  className,
  onClick,
  ...props
}: ActionButtonProps) {
  const { snapshot, startGame, resumeGame, resetGame } = useBrickBreakerUI()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)

    switch (snapshot.state) {
      case 'idle':
        startGame()
        break
      case 'paused':
        resumeGame()
        break
      case 'won':
      case 'lost':
        resetGame()
        setTimeout(startGame, 100)
        break
      case 'levelComplete':
        break
    }
  }

  const defaultLabels: Partial<Record<GameState, string>> = {
    idle: 'Start Game',
    paused: 'Resume',
    won: 'Play Again',
    lost: 'Try Again',
    levelComplete: 'Use quiz to continue',
  }

  if (snapshot.state === 'playing' || snapshot.state === 'levelComplete')
    return null

  return (
    <button
      type="button"
      data-slot="brick-breaker-action"
      className={cn(
        'pointer-events-auto mt-6 rounded-full border border-amber-200/35 bg-amber-200/10 px-6 py-2.5 text-sm font-semibold text-amber-100/95 shadow-[0_0_24px_rgba(245,200,120,0.08)] transition-colors hover:bg-amber-200/18 active:scale-[0.98]',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children ?? defaultLabels[snapshot.state]}
    </button>
  )
}

// ============================================================================
// Multiplier strip (between score HUD and canvas ceiling)
// ============================================================================

const MULT_TIER_STYLES = [
  { fg: '#a1a1aa', bar: 'rgba(161, 161, 170, 0.12)', glow: 'rgba(161, 161, 170, 0.2)' },
  { fg: '#d4d4d8', bar: 'rgba(212, 212, 216, 0.14)', glow: 'rgba(228, 228, 231, 0.35)' },
  { fg: '#fde68a', bar: 'rgba(253, 230, 138, 0.14)', glow: 'rgba(253, 224, 71, 0.45)' },
  { fg: '#fcd34d', bar: 'rgba(252, 211, 77, 0.16)', glow: 'rgba(250, 204, 21, 0.5)' },
  { fg: '#fbbf24', bar: 'rgba(251, 191, 36, 0.18)', glow: 'rgba(245, 158, 11, 0.55)' },
  { fg: '#fb923c', bar: 'rgba(251, 146, 60, 0.18)', glow: 'rgba(249, 115, 22, 0.55)' },
  { fg: '#f87171', bar: 'rgba(248, 113, 113, 0.16)', glow: 'rgba(239, 68, 68, 0.5)' },
  { fg: '#fda4af', bar: 'rgba(253, 164, 175, 0.14)', glow: 'rgba(244, 114, 182, 0.55)' },
  { fg: '#fef3c7', bar: 'rgba(254, 243, 199, 0.2)', glow: 'rgba(252, 211, 77, 0.65)' },
] as const

function tierIndexForMult(mult: number): number {
  return Math.min(Math.max(mult - 1, 0), MULT_TIER_STYLES.length - 1)
}

export function BrickBreakerMultiplierBand() {
  const { snapshot } = useBrickBreakerUI()
  const { hudBottomPx, ceilingPx } = usePlayfieldMetrics()

  const gapTop = 3
  const gapBottom = 5
  const top = hudBottomPx + gapTop
  const rawH = ceilingPx - hudBottomPx - gapTop - gapBottom
  const height = Math.max(0, rawH)

  if (snapshot.state !== 'playing' || height < 20) {
    return null
  }

  const baseComboMult = Math.max(1, snapshot.combo + 1)
  const mult = snapshot.garrisonDoubleActive ? baseComboMult * 2 : baseComboMult
  const tier = tierIndexForMult(mult)
  const style = MULT_TIER_STYLES[tier]

  return (
    <div
      className="pointer-events-none absolute left-2 right-2 z-[21] flex items-center justify-center overflow-hidden rounded-lg border border-white/[0.07] backdrop-blur-md sm:left-3 sm:right-3"
      style={{
        top,
        height,
        background: `linear-gradient(180deg, ${style.bar} 0%, rgba(0,0,0,0.12) 100%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 24px ${style.glow}`,
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mult}
          initial={{ scale: 0.72, opacity: 0, y: 6 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
            textShadow: [
              `0 0 0px ${style.glow}`,
              `0 0 18px ${style.glow}`,
              `0 0 8px ${style.glow}`,
            ],
          }}
          exit={{ scale: 0.85, opacity: 0, y: -4 }}
          transition={{
            type: 'spring',
            stiffness: 560,
            damping: 24,
            mass: 0.85,
            textShadow: { duration: 0.45, times: [0, 0.35, 1] },
          }}
          className="font-['Bebas_Neue',sans-serif] tabular-nums tracking-[0.2em]"
          style={{
            color: style.fg,
            fontSize: `${Math.max(15, Math.min(height * 0.52, 44))}px`,
            lineHeight: 1,
          }}
        >
          ×{mult}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Between-level training quiz (from live training modules)
// ============================================================================

type InterstitialQuizPayload = {
  courseId: string
  questionIndex: number
  moduleTitle: string
  venue: string
  question: string
  options: string[]
}

export function BrickBreakerInterstitialQuiz() {
  const { advanceAfterLevelQuiz } = useBrickBreakerUI()
  const [payload, setPayload] = React.useState<InterstitialQuizPayload | null>(null)
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
    advanceAfterLevelQuiz(true)
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
      advanceAfterLevelQuiz(correct)
    } catch {
      setLoadError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const actionButtonClass =
    'rounded-full border border-amber-200/35 bg-amber-200/10 px-6 py-2.5 text-sm font-semibold text-amber-100/95 shadow-[0_0_24px_rgba(245,200,120,0.08)] transition-colors hover:bg-amber-200/18 active:scale-[0.98]'

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
        <div className="space-y-3 rounded-xl border border-amber-200/20 bg-zinc-900/80 p-4 text-center">
          <p className="text-sm text-zinc-300">
            No training quiz questions are available yet. You can continue to the next level.
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
            <h2
              className={cn(
                "px-1 font-['Bebas_Neue',sans-serif] text-[clamp(2rem,8vw,3.25rem)] font-normal leading-[1.05] tracking-[0.12em] text-zinc-50"
              )}
            >
              {payload.venue}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug text-amber-200/90 sm:text-base">
              {payload.moduleTitle}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Wrong answer halves your score. Select an option, then confirm.
            </p>
          </div>

          <p
            data-slot="brick-breaker-quiz-question"
            className="text-center text-sm leading-relaxed text-zinc-300 sm:text-[0.95rem]"
          >
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
                    ? 'border-amber-200/50 bg-amber-200/10 text-zinc-50'
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
              Correct — next level!
            </p>
          )}
          {feedback === 'wrong' && (
            <p className="text-center text-sm font-medium text-amber-300/95">
              Not quite — score halved. Next level…
            </p>
          )}

          <button
            type="button"
            disabled={selected === null || submitting || feedback !== null}
            className={cn('w-full', actionButtonClass, 'disabled:pointer-events-none disabled:opacity-40')}
            onClick={() => void handleConfirm()}
          >
            {submitting && !feedback ? 'Checking…' : 'Confirm answer'}
          </button>
        </div>
      )}
    </div>
  )
}

function BrickBreakerLevelCompleteFlow() {
  const { snapshot } = useBrickBreakerUI()
  const [phase, setPhase] = React.useState<'summary' | 'quiz'>('summary')

  React.useEffect(() => {
    if (snapshot.state === 'levelComplete') {
      setPhase('summary')
    }
  }, [snapshot.state, snapshot.level])

  if (phase === 'summary') {
    return (
      <div className="pointer-events-auto flex max-w-[min(100%,22rem)] flex-col items-center px-4 py-2 text-center sm:max-w-md">
        <BrickBreakerTitle />
        <BrickBreakerMessage />
        <BrickBreakerHint className="max-w-[min(100%,18rem)] text-center text-xs sm:text-sm">
          Click Continue for a training question.
        </BrickBreakerHint>
        <button
          type="button"
          className="pointer-events-auto mt-6 rounded-full border border-amber-200/35 bg-amber-200/10 px-6 py-2.5 text-sm font-semibold text-amber-100/95 shadow-[0_0_24px_rgba(245,200,120,0.08)] transition-colors hover:bg-amber-200/18 active:scale-[0.98]"
          onClick={() => setPhase('quiz')}
        >
          Continue
        </button>
      </div>
    )
  }

  return <BrickBreakerInterstitialQuiz />
}

function BrickBreakerOverlayIdleContent() {
  const { snapshot } = useBrickBreakerUI()

  if (snapshot.state === 'levelComplete') {
    return <BrickBreakerLevelCompleteFlow />
  }

  return (
    <>
      <BrickBreakerTitle />
      <BrickBreakerMessage className="max-w-[min(100%,20rem)] text-center" />
      <BrickBreakerHint className="max-w-[min(100%,18rem)] text-center text-xs sm:text-sm" />
    </>
  )
}

// ============================================================================
// Default UI Preset
// ============================================================================

export function BrickBreakerDefaultUI() {
  return (
    <>
      <BrickBreakerHUD className="pointer-events-none absolute inset-x-0 top-0 z-20 min-h-[4.25rem] items-center border-b-0 bg-zinc-950/65 px-3 py-3 backdrop-blur-xl sm:min-h-[5rem] sm:px-5 sm:py-4">
        <BrickBreakerScore showCombo={false} className="[&>span:first-child]:text-lg sm:[&>span:first-child]:text-xl" />
        <BrickBreakerLevel className="[&>span:last-child]:text-base sm:[&>span:last-child]:text-lg" />
        <BrickBreakerHighScore className="[&>span:last-child]:text-base sm:[&>span:last-child]:text-lg" />
      </BrickBreakerHUD>

      <BrickBreakerMultiplierBand />

      <BrickBreakerLives className="pointer-events-none absolute bottom-3 left-3 z-20 sm:bottom-4 sm:left-4" />

      <BrickBreakerOverlay>
        <BrickBreakerOverlayIdleContent />
      </BrickBreakerOverlay>
    </>
  )
}
