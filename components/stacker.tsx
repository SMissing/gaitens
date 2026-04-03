'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  useStacker,
  type UseStackerOptions,
  type StackerSnapshot,
} from '@/components/use-stacker'
import {
  StackerUIProvider,
  StackerDefaultUI,
} from '@/components/stacker-ui'

interface CanvasDimensions {
  width: number
  height: number
  dpr: number
}

/** Viewport row from bottom (integer scroll); null if off-screen */
function viewportRowFromWorld(
  worldRow: number,
  scrollRows: number,
  visibleRows: number
): number | null {
  const vr = worldRow - scrollRows
  if (vr < 0 || vr >= visibleRows) return null
  return vr
}

function drawStackerFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  snapshot: StackerSnapshot,
  watermark: HTMLImageElement | null
): void {
  const dpr = (ctx.canvas.width / width + ctx.canvas.height / height) / 2
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const g = ctx.createLinearGradient(0, 0, width, height)
  g.addColorStop(0, '#0f172a')
  g.addColorStop(0.45, '#0c1220')
  g.addColorStop(1, '#1a0a1f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  const wash = ctx.createRadialGradient(
    width * 0.5,
    height * 0.35,
    0,
    width * 0.5,
    height * 0.55,
    height * 0.85
  )
  wash.addColorStop(0, 'rgba(34, 211, 238, 0.09)')
  wash.addColorStop(0.55, 'rgba(168, 85, 247, 0.04)')
  wash.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, width, height)

  const wash2 = ctx.createRadialGradient(
    width * 0.15,
    height * 0.85,
    0,
    width * 0.2,
    height * 0.9,
    height * 0.5
  )
  wash2.addColorStop(0, 'rgba(232, 121, 249, 0.06)')
  wash2.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = wash2
  ctx.fillRect(0, 0, width, height)

  if (watermark && watermark.width > 0) {
    const iw = watermark.width
    const ih = watermark.height
    const maxW = width * 0.45
    const maxH = height * 0.38
    const sc = Math.min(maxW / iw, maxH / ih)
    const dw = iw * sc
    const dh = ih * sc
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.drawImage(watermark, (width - dw) * 0.5, height * 0.42 - dh * 0.5, dw, dh)
    ctx.restore()
  }

  const padX = width * 0.08
  const padTop = height * 0.18
  const padBottom = height * 0.18
  const innerW = width - padX * 2
  const innerH = height - padTop - padBottom

  const { gridCols, visibleRows, scrollRowOffset, stack } = snapshot
  const cellSize = Math.min(innerW / gridCols, innerH / visibleRows)
  const playW = cellSize * gridCols
  const playH = cellSize * visibleRows
  const playX = padX + (innerW - playW) / 2
  const playY = padTop + (innerH - playH) / 2
  const cellW = cellSize
  const cellH = cellSize

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1
  ctx.strokeRect(playX - 4, playY - 4, playW + 8, playH + 8)

  ctx.save()
  ctx.beginPath()
  ctx.rect(playX, playY, playW, playH)
  ctx.clip()

  const drawBlock = (
    left: number,
    wCells: number,
    viewportRowFromBottom: number,
    alpha: number,
    flashBoost: number
  ) => {
    const x = playX + left * cellW
    const y = playY + (visibleRows - 1 - viewportRowFromBottom) * cellH
    const bw = wCells * cellW
    const bh = cellH - 1

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.shadowColor = 'rgba(34, 211, 238, 0.85)'
    ctx.shadowBlur = 14
    const fillG = ctx.createLinearGradient(x, y, x, y + bh)
    if (flashBoost > 0) {
      const f = flashBoost * 0.55
      fillG.addColorStop(0, `rgba(240, 253, 255, ${0.88 + f * 0.12})`)
      fillG.addColorStop(0.45, `rgba(165, 243, 252, ${0.82 + f * 0.15})`)
      fillG.addColorStop(1, `rgba(34, 211, 238, ${0.72 + f * 0.2})`)
    } else {
      fillG.addColorStop(0, 'rgba(103, 232, 249, 0.95)')
      fillG.addColorStop(0.45, 'rgba(34, 211, 238, 0.88)')
      fillG.addColorStop(1, 'rgba(6, 182, 212, 0.75)')
    }
    ctx.fillStyle = fillG
    ctx.fillRect(x + 0.5, y + 0.5, bw - 1, bh)

    ctx.shadowBlur = 0
    ctx.strokeStyle =
      flashBoost > 0
        ? `rgba(255, 255, 255, ${0.35 + flashBoost * 0.45})`
        : 'rgba(255, 255, 255, 0.22)'
    ctx.lineWidth = flashBoost > 0 ? 1.25 : 1
    ctx.strokeRect(x + 0.5, y + 0.5, bw - 1, bh)
    ctx.restore()
  }

  for (let i = 0; i < stack.length; i++) {
    const vr = viewportRowFromWorld(i, scrollRowOffset, visibleRows)
    if (vr === null) continue
    const b = stack[i]
    const flash =
      snapshot.placementFlashRow === i ? snapshot.placementFlashStrength : 0
    drawBlock(b.left, b.width, vr, 1, flash)
  }

  const showMover =
    snapshot.state === 'playing' ||
    snapshot.state === 'paused' ||
    snapshot.state === 'checkpointQuiz'
  if (showMover) {
    const worldRow = stack.length
    const vr = viewportRowFromWorld(worldRow, scrollRowOffset, visibleRows)
    if (vr !== null) {
      drawBlock(snapshot.moverLeft, snapshot.moverWidth, vr, 0.92, 0)
    }
  }

  ctx.restore()

  // Jet black grid on top — segments blocks into discrete "pixels"
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 1.25
  ctx.lineCap = 'square'
  ctx.lineJoin = 'miter'
  for (let c = 0; c <= gridCols; c++) {
    const x = playX + c * cellW
    ctx.beginPath()
    ctx.moveTo(x, playY)
    ctx.lineTo(x, playY + playH)
    ctx.stroke()
  }
  for (let r = 0; r <= visibleRows; r++) {
    const y = playY + r * cellH
    ctx.beginPath()
    ctx.moveTo(playX, y)
    ctx.lineTo(playX + playW, y)
    ctx.stroke()
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export interface StackerProps extends UseStackerOptions {
  className?: string
  watermarkSrc?: string
  autoFocus?: boolean
}

export function Stacker({
  className,
  watermarkSrc,
  autoFocus = true,
  gridCols,
  gridRows,
  startWidthCells,
  stepIntervalMs,
  speedUpPerRow,
  quizEvery,
  remoteHighScore,
  onGameEnd,
  onScoreChange,
  onStateChange,
}: StackerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasWrapperRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const [dimensions, setDimensions] = React.useState<CanvasDimensions>({
    width: 360,
    height: 560,
    dpr: 1,
  })

  const [watermarkImg, setWatermarkImg] = React.useState<HTMLImageElement | null>(
    null
  )

  React.useEffect(() => {
    if (!watermarkSrc) {
      setWatermarkImg(null)
      return
    }
    let cancelled = false
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      if (!cancelled) setWatermarkImg(img)
    }
    img.onerror = () => {
      if (!cancelled) setWatermarkImg(null)
    }
    img.src = watermarkSrc
    return () => {
      cancelled = true
    }
  }, [watermarkSrc])

  const {
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    tryStack,
    advanceAfterCheckpointQuiz,
  } = useStacker({
    gridCols,
    gridRows,
    startWidthCells,
    stepIntervalMs,
    speedUpPerRow,
    quizEvery,
    remoteHighScore,
    onGameEnd,
    onScoreChange,
    onStateChange,
  })

  const uiValue = React.useMemo(
    () => ({
      snapshot,
      startGame,
      pauseGame,
      resumeGame,
      resetGame,
      tryStack,
      advanceAfterCheckpointQuiz,
    }),
    [
      snapshot,
      startGame,
      pauseGame,
      resumeGame,
      resetGame,
      tryStack,
      advanceAfterCheckpointQuiz,
    ]
  )

  React.useEffect(() => {
    const wrapper = canvasWrapperRef.current
    if (!wrapper) return

    const ro = new ResizeObserver(() => {
      const rect = wrapper.getBoundingClientRect()
      const w = Math.max(rect.width, 1)
      const h = Math.max(rect.height, 1)
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      setDimensions({ width: w, height: h, dpr })
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height, dpr } = dimensions
    canvas.width = width * dpr
    canvas.height = height * dpr
    drawStackerFrame(ctx, width, height, snapshot, watermarkImg)
  }, [dimensions, snapshot, watermarkImg])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!document.activeElement?.closest('[data-slot="stacker-root"]')) return

      const code = e.code

      if (code === 'Space') {
        e.preventDefault()
        if (snapshot.state === 'playing') tryStack()
        else if (snapshot.state === 'idle') startGame()
        else if (snapshot.state === 'paused') resumeGame()
        return
      }

      if (code === 'Escape') {
        e.preventDefault()
        if (snapshot.state === 'playing') pauseGame()
        else if (snapshot.state === 'paused') resumeGame()
        return
      }

      if (code === 'KeyR') {
        if (snapshot.state === 'lost') {
          e.preventDefault()
          resetGame()
          setTimeout(startGame, 80)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    snapshot.state,
    tryStack,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
  ])

  return (
    <div
      ref={containerRef}
      data-slot="stacker-root"
      tabIndex={autoFocus ? 0 : undefined}
      className={cn(
        'relative flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40',
        className
      )}
    >
      <div
        ref={canvasWrapperRef}
        data-slot="stacker-canvas-wrap"
        className="relative min-h-0 flex-1"
      >
        <canvas
          ref={canvasRef}
          data-slot="stacker-canvas"
          className="absolute inset-0 block size-full touch-manipulation"
          style={{ touchAction: 'manipulation' }}
          onPointerDown={(e) => {
            if (snapshot.state !== 'playing') return
            e.preventDefault()
            tryStack()
          }}
        />
        <StackerUIProvider value={uiValue}>
          <StackerDefaultUI />
        </StackerUIProvider>
      </div>
    </div>
  )
}
