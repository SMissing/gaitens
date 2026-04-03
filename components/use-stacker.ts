'use client'

import * as React from 'react'

export type StackerGameState =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'checkpointQuiz'
  | 'lost'

export interface PlacedBlock {
  /** Left edge in grid columns (integer) */
  left: number
  /** Width in grid columns (integer) */
  width: number
}

export interface StackerSnapshot {
  state: StackerGameState
  score: number
  highScore: number
  gridCols: number
  /** Rows visible in the viewport (fixed grid height) */
  visibleRows: number
  /** Integer scroll — world row index at bottom of viewport (snapped; no camera pan) */
  scrollRowOffset: number
  /** Row index (from bottom) where the active row is anchored once scrolling starts */
  cameraAnchorRow: number
  stack: PlacedBlock[]
  /** Integer column of left edge */
  moverLeft: number
  moverWidth: number
  moverDir: 1 | -1
  stacksCompleted: number
  quizEvery: number
  placementFlashRow: number | null
  placementFlashStrength: number
}

export interface StackerGameEndResult {
  won: boolean
  score: number
  highScore: number
  height: number
}

export interface UseStackerOptions {
  gridCols?: number
  /**
   * Rows visible in the playfield (arcade cabinet window). The tower is infinite;
   * the view scrolls so the active row stays near the vertical center once reached.
   */
  gridRows?: number
  startWidthCells?: number
  /**
   * Milliseconds between moving one grid column (discrete arcade motion).
   * Base value; decreases slightly as the stack grows.
   */
  stepIntervalMs?: number
  /** Per stacked row: subtract this many ms from step (floored at a minimum) */
  speedUpPerRow?: number
  /** Pause for training quiz every N successful stacks */
  quizEvery?: number
  remoteHighScore?: number
  onGameEnd?: (result: StackerGameEndResult) => void
  onScoreChange?: (score: number) => void
  onStateChange?: (state: StackerGameState) => void
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function useStacker(options: UseStackerOptions) {
  const {
    gridCols = 10,
    gridRows: visibleRows = 15,
    startWidthCells: startWidthCellsOpt,
    stepIntervalMs = 165,
    speedUpPerRow = 4,
    quizEvery = 15,
    remoteHighScore,
    onGameEnd,
    onScoreChange,
    onStateChange,
  } = options

  const resolvedStartWidth = React.useMemo(() => {
    const fallback = Math.max(4, Math.floor(gridCols * 0.55))
    const raw = startWidthCellsOpt ?? fallback
    return Math.min(Math.max(3, raw), gridCols - 1)
  }, [gridCols, startWidthCellsOpt])

  const cameraAnchorRow = React.useMemo(
    () => Math.floor((visibleRows - 1) / 2),
    [visibleRows]
  )

  const [, forceRender] = React.useReducer((x) => x + 1, 0)

  const gameStateRef = React.useRef<StackerGameState>('idle')
  const stackRef = React.useRef<PlacedBlock[]>([])
  const moverLeftRef = React.useRef(0)
  const moverWidthRef = React.useRef(resolvedStartWidth)
  const moverDirRef = React.useRef<1 | -1>(1)
  const scoreRef = React.useRef(0)
  const highScoreRef = React.useRef(0)
  const stacksCompletedRef = React.useRef(0)

  const animationFrameRef = React.useRef(0)
  const lastFrameTimeRef = React.useRef(0)
  const stepAccumRef = React.useRef(0)

  const placementFlashRowRef = React.useRef<number | null>(null)
  const placementFlashUntilRef = React.useRef(0)

  React.useEffect(() => {
    const fromRemote =
      typeof remoteHighScore === 'number' && !Number.isNaN(remoteHighScore)
        ? remoteHighScore
        : 0
    const next = Math.max(highScoreRef.current, fromRemote)
    if (next !== highScoreRef.current) {
      highScoreRef.current = next
      forceRender()
    }
  }, [remoteHighScore])

  const scrollRowOffsetForStack = React.useCallback(
    (stackLen: number) => Math.max(0, stackLen - cameraAnchorRow),
    [cameraAnchorRow]
  )

  const resetRound = React.useCallback(() => {
    stackRef.current = []
    const w = resolvedStartWidth
    moverWidthRef.current = w
    moverLeftRef.current = clampInt((gridCols - w) / 2, 0, gridCols - w)
    moverDirRef.current = 1
    scoreRef.current = 0
    stacksCompletedRef.current = 0
    stepAccumRef.current = 0
    placementFlashRowRef.current = null
    placementFlashUntilRef.current = 0
  }, [gridCols, resolvedStartWidth])

  const initMoverForRow = React.useCallback(() => {
    const stack = stackRef.current
    if (stack.length === 0) {
      const w = resolvedStartWidth
      moverWidthRef.current = w
      moverLeftRef.current = clampInt((gridCols - w) / 2, 0, gridCols - w)
    } else {
      const below = stack[stack.length - 1]
      moverWidthRef.current = below.width
      moverLeftRef.current = below.left
    }
    moverDirRef.current = 1
  }, [gridCols, resolvedStartWidth])

  const currentStepMs = React.useCallback(() => {
    const stackLen = stackRef.current.length
    return Math.max(
      55,
      stepIntervalMs - stackLen * speedUpPerRow
    )
  }, [stepIntervalMs, speedUpPerRow])

  const gameLoop = React.useCallback(
    (timestamp: number) => {
      if (gameStateRef.current !== 'playing') return

      const last = lastFrameTimeRef.current || timestamp
      const deltaMs = Math.min(timestamp - last, 80)
      lastFrameTimeRef.current = timestamp

      stepAccumRef.current += deltaMs
      const stepMs = currentStepMs()
      const w = moverWidthRef.current
      const maxLeft = gridCols - w

      while (stepAccumRef.current >= stepMs) {
        stepAccumRef.current -= stepMs
        let left = moverLeftRef.current + moverDirRef.current
        if (left <= 0) {
          left = 0
          moverDirRef.current = 1
        } else if (left >= maxLeft) {
          left = maxLeft
          moverDirRef.current = -1
        }
        moverLeftRef.current = left
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
      forceRender()
    },
    [currentStepMs, gridCols]
  )

  const startGame = React.useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    resetRound()
    gameStateRef.current = 'playing'
    initMoverForRow()
    onStateChange?.('playing')
    lastFrameTimeRef.current = performance.now()
    stepAccumRef.current = 0
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    forceRender()
  }, [gameLoop, initMoverForRow, onStateChange, resetRound])

  const pauseGame = React.useCallback(() => {
    if (gameStateRef.current === 'playing') {
      gameStateRef.current = 'paused'
      onStateChange?.('paused')
      cancelAnimationFrame(animationFrameRef.current)
      forceRender()
    }
  }, [onStateChange])

  const resumeGame = React.useCallback(() => {
    if (gameStateRef.current === 'paused') {
      gameStateRef.current = 'playing'
      onStateChange?.('playing')
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      forceRender()
    }
  }, [gameLoop, onStateChange])

  const resetGame = React.useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    resetRound()
    gameStateRef.current = 'idle'
    initMoverForRow()
    onStateChange?.('idle')
    forceRender()
  }, [initMoverForRow, onStateChange, resetRound])

  const tryStack = React.useCallback(() => {
    if (gameStateRef.current !== 'playing') return

    const below =
      stackRef.current.length === 0
        ? { left: 0, width: gridCols }
        : stackRef.current[stackRef.current.length - 1]

    const mLeft = moverLeftRef.current
    const mW = moverWidthRef.current
    const bLeft = below.left
    const bW = below.width

    const overlapLeft = Math.max(mLeft, bLeft)
    const overlapRight = Math.min(mLeft + mW, bLeft + bW)
    const overlapW = overlapRight - overlapLeft

    if (overlapW <= 0) {
      cancelAnimationFrame(animationFrameRef.current)
      gameStateRef.current = 'lost'
      onStateChange?.('lost')
      highScoreRef.current = Math.max(scoreRef.current, highScoreRef.current)
      onGameEnd?.({
        won: false,
        score: scoreRef.current,
        highScore: highScoreRef.current,
        height: stackRef.current.length,
      })
      forceRender()
      return
    }

    stackRef.current.push({
      left: overlapLeft,
      width: overlapW,
    })
    const len = stackRef.current.length

    placementFlashRowRef.current = len - 1
    placementFlashUntilRef.current = performance.now() + 260

    stacksCompletedRef.current += 1
    const layer = len
    scoreRef.current += 12 * layer
    onScoreChange?.(scoreRef.current)

    if (quizEvery > 0 && stacksCompletedRef.current % quizEvery === 0) {
      placementFlashRowRef.current = null
      placementFlashUntilRef.current = 0
      cancelAnimationFrame(animationFrameRef.current)
      gameStateRef.current = 'checkpointQuiz'
      onStateChange?.('checkpointQuiz')
      forceRender()
      return
    }

    initMoverForRow()
    forceRender()
  }, [
    gridCols,
    initMoverForRow,
    onGameEnd,
    onScoreChange,
    onStateChange,
    quizEvery,
    scrollRowOffsetForStack,
  ])

  const advanceAfterCheckpointQuiz = React.useCallback(
    (wasCorrect: boolean) => {
      if (gameStateRef.current !== 'checkpointQuiz') return

      if (!wasCorrect) {
        scoreRef.current = Math.max(0, Math.floor(scoreRef.current / 2))
        onScoreChange?.(scoreRef.current)
      }

      gameStateRef.current = 'playing'
      onStateChange?.('playing')
      initMoverForRow()
      lastFrameTimeRef.current = performance.now()
      stepAccumRef.current = 0
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      forceRender()
    },
    [gameLoop, initMoverForRow, onScoreChange, onStateChange]
  )

  const stackLen = stackRef.current.length
  const scrollRowOffset = scrollRowOffsetForStack(stackLen)
  const now = typeof performance !== 'undefined' ? performance.now() : 0
  let placementFlashStrength = 0
  let placementFlashRow: number | null = placementFlashRowRef.current
  if (
    placementFlashRow !== null &&
    placementFlashUntilRef.current > now
  ) {
    placementFlashStrength = Math.min(
      1,
      (placementFlashUntilRef.current - now) / 260
    )
  } else {
    placementFlashRow = null
  }

  const snapshot: StackerSnapshot = {
    state: gameStateRef.current,
    score: scoreRef.current,
    highScore: Math.max(highScoreRef.current, scoreRef.current),
    gridCols,
    visibleRows,
    scrollRowOffset,
    cameraAnchorRow,
    stack: stackRef.current.map((b) => ({ ...b })),
    moverLeft: moverLeftRef.current,
    moverWidth: moverWidthRef.current,
    moverDir: moverDirRef.current,
    stacksCompleted: stacksCompletedRef.current,
    quizEvery,
    placementFlashRow,
    placementFlashStrength,
  }

  return {
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    tryStack,
    advanceAfterCheckpointQuiz,
  }
}
