'use client'

import * as React from 'react'
import type {
  GameState,
  GameSnapshot,
  GameEndResult,
  BrickBreakerConfig,
  Brick,
  Ball,
  Paddle,
  Level,
  CanvasDimensions,
  VenuePowerUp,
} from './types'
import { DEFAULT_CONFIG, GAME_CONSTANTS } from './config'
import { DEFAULT_LEVELS, getBrickHealth } from './levels'
import {
  detectCollision,
  resolveBallBrickCollision,
  resolveBallPaddleCollision,
  generateId,
  clamp,
  normalize,
  scale,
  magnitude,
  storage,
} from './utils'

interface UseBrickBreakerOptions {
  config: BrickBreakerConfig
  levels: Level[]
  startLevel: number
  canvasDimensions: CanvasDimensions
  /** Synced from server; merged with local persisted high score (max of both). */
  remoteHighScore?: number
  onGameEnd?: (result: GameEndResult) => void
  onScoreChange?: (score: number, combo: number) => void
  onStateChange?: (state: GameState) => void
  onLevelChange?: (level: number) => void
}

interface UseBrickBreakerReturn {
  snapshot: GameSnapshot
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  /** After level clear: wrong answer halves score, then advances. */
  advanceAfterLevelQuiz: (wasCorrect: boolean) => void
  /** Dev: instantly clear the level (last level → win). */
  debugCompleteLevel: () => void
  movePaddle: (direction: 'left' | 'right' | 'none') => void
  setPaddlePosition: (x: number) => void
  launchBall: () => void
}

/**
 * Create bricks from level definition
 */
function createBricksFromLevel(
  level: Level,
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions
): Brick[] {
  const { brickGap, topPadding, brickTopGap, sidePadding } = config.layout
  const { width, height } = dimensions

  const rows = level.bricks.length
  const cols = level.bricks[0]?.length || config.layout.cols

  const playAreaX = width * sidePadding
  const ceilingY = height * topPadding
  const playAreaWidth = width * (1 - 2 * sidePadding)
  const playAreaHeight = height * 0.35

  const brickWidth = (playAreaWidth - (cols - 1) * brickGap) / cols
  const brickHeight = (playAreaHeight - (rows - 1) * brickGap) / rows

  // One full brick row + gap below the ceiling line before the stack starts
  const oneBlockBelowCeiling = brickHeight + brickGap
  const playAreaY = ceilingY + brickTopGap + oneBlockBelowCeiling

  const bricks: Brick[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const def = level.bricks[row]?.[col]
      if (!def) continue

      const health = getBrickHealth(def.type)
      const points = def.points ?? config.scoring.pointsByType[def.type]

      bricks.push({
        id: generateId(),
        row,
        col,
        bounds: {
          x: playAreaX + col * (brickWidth + brickGap),
          y: playAreaY + row * (brickHeight + brickGap),
          width: brickWidth,
          height: brickHeight,
        },
        type: def.type,
        health,
        maxHealth: health,
        destroyed: false,
        points,
      })
    }
  }

  return bricks
}

const VENUES: VenuePowerUp[] = ['garrison', 'spirits', 'bassment']

function assignRandomVenuePowerBrick(bricks: Brick[]): void {
  const candidates = bricks.filter((b) => b.type !== 'indestructible')
  if (candidates.length === 0) return
  const pick = candidates[Math.floor(Math.random() * candidates.length)]!
  pick.powerUpVenue = VENUES[Math.floor(Math.random() * VENUES.length)]
}

/**
 * Create paddle
 */
function createPaddle(
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions
): Paddle {
  const { paddleWidth, paddleHeight, paddleOffset } = config.sizing
  const { width, height } = dimensions

  const w = width * paddleWidth
  const h = height * paddleHeight

  return {
    bounds: {
      x: (width - w) / 2,
      y: height * (1 - paddleOffset) - h,
      width: w,
      height: h,
    },
    targetX: null,
    speed: config.physics.paddleSpeed,
  }
}

/**
 * Create ball attached to paddle
 */
function createBall(
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions,
  paddle: Paddle,
  levelIndex: number
): Ball {
  const { ballRadius } = config.sizing
  const { width } = dimensions
  const { baseSpeed, speedPerLevel, maxSpeed } = config.physics

  const radius = width * ballRadius
  const speed = Math.min(baseSpeed + levelIndex * speedPerLevel, maxSpeed)

  return {
    position: {
      x: paddle.bounds.x + paddle.bounds.width / 2,
      y: paddle.bounds.y - radius - 2,
    },
    velocity: { x: 0, y: 0 },
    radius,
    speed,
    trail: [],
    isLaunched: false,
  }
}

/**
 * Launch ball from paddle with random angle
 */
function createSpiritsMultiball(
  config: BrickBreakerConfig,
  dimensions: CanvasDimensions,
  paddle: Paddle,
  levelIndex: number,
  levelSpeedMultiplier?: number
): Ball[] {
  const base = createBall(config, dimensions, paddle, levelIndex)
  if (levelSpeedMultiplier) {
    base.speed *= levelSpeedMultiplier
  }
  const cx = paddle.bounds.x + paddle.bounds.width / 2
  const cy = paddle.bounds.y - base.radius - 2
  const n = GAME_CONSTANTS.SPIRITS_BALL_COUNT
  const balls: Ball[] = []
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + ((i / (n - 1 || 1)) - 0.5) * (Math.PI * 0.72)
    balls.push({
      position: { x: cx, y: cy },
      velocity: {
        x: Math.cos(angle) * base.speed,
        y: Math.sin(angle) * base.speed,
      },
      radius: base.radius,
      speed: base.speed,
      trail: [],
      isLaunched: true,
    })
  }
  return balls
}

/**
 * Main game hook with proper refs-based physics engine
 */
export function useBrickBreaker(
  options: UseBrickBreakerOptions
): UseBrickBreakerReturn {
  const {
    config,
    levels,
    startLevel,
    canvasDimensions,
    remoteHighScore,
    onGameEnd,
    onScoreChange,
    onStateChange,
    onLevelChange,
  } = options

  // React state for rendering (updated each frame)
  const [, forceRender] = React.useReducer((x) => x + 1, 0)

  // Game state stored in refs for mutation during game loop
  const gameStateRef = React.useRef<GameState>('idle')
  const levelIndexRef = React.useRef(startLevel - 1)
  const scoreRef = React.useRef(0)
  const highScoreRef = React.useRef(0)
  const livesRef = React.useRef(config.gameplay.startingLives)
  const comboRef = React.useRef(0)
  const lastHitTimeRef = React.useRef(0)

  const bricksRef = React.useRef<Brick[]>([])
  const paddleRef = React.useRef<Paddle>(createPaddle(config, canvasDimensions))
  const ballsRef = React.useRef<Ball[]>([
    createBall(
      config,
      canvasDimensions,
      paddleRef.current,
      levelIndexRef.current
    ),
  ])

  const garrisonExpiresRef = React.useRef(0)
  const bassmentExpiresRef = React.useRef(0)
  const spiritsMultiballRef = React.useRef(false)

  const animationFrameRef = React.useRef<number>(0)
  const lastFrameTimeRef = React.useRef<number>(0)
  const paddleDirectionRef = React.useRef<'left' | 'right' | 'none'>('none')
  const totalBricksRef = React.useRef(0)
  const destroyedBricksRef = React.useRef(0)

  // Load high score: localStorage (optional) + server-backed value
  React.useEffect(() => {
    let fromLocal = 0
    if (config.storage.persistHighScore) {
      fromLocal = storage.get(`${config.storage.storageKey}-highscore`, 0)
    }
    const fromRemote =
      typeof remoteHighScore === 'number' && !Number.isNaN(remoteHighScore)
        ? remoteHighScore
        : 0
    const merged = Math.max(fromLocal, fromRemote)
    const next = Math.max(highScoreRef.current, merged)
    if (next !== highScoreRef.current) {
      highScoreRef.current = next
      forceRender()
    }
  }, [
    config.storage.persistHighScore,
    config.storage.storageKey,
    remoteHighScore,
  ])

  // Initialize level
  const initLevel = React.useCallback(
    (levelIndex: number) => {
      const level = levels[levelIndex] || levels[0]
      if (!level) return

      const newBricks = createBricksFromLevel(level, config, canvasDimensions)
      assignRandomVenuePowerBrick(newBricks)
      const newPaddle = createPaddle(config, canvasDimensions)
      let newBall = createBall(config, canvasDimensions, newPaddle, levelIndex)

      if (level.speedMultiplier) {
        newBall.speed *= level.speedMultiplier
      }

      bricksRef.current = newBricks
      paddleRef.current = newPaddle
      ballsRef.current = [newBall]
      comboRef.current = 0

      garrisonExpiresRef.current = 0
      bassmentExpiresRef.current = 0
      spiritsMultiballRef.current = false

      totalBricksRef.current = newBricks.filter(
        (b) => b.type !== 'indestructible'
      ).length
      destroyedBricksRef.current = 0

      forceRender()
    },
    [config, canvasDimensions, levels]
  )

  // Initialize on mount
  React.useEffect(() => {
    initLevel(levelIndexRef.current)
  }, [initLevel])

  // Reinitialize on dimension change
  React.useEffect(() => {
    if (gameStateRef.current === 'idle') {
      initLevel(levelIndexRef.current)
    }
  }, [canvasDimensions, initLevel])

  // Game loop
  const gameLoop = React.useCallback(
    (timestamp: number) => {
      if (gameStateRef.current !== 'playing') return

      const deltaTime = timestamp - lastFrameTimeRef.current
      lastFrameTimeRef.current = timestamp

      // Cap delta time to prevent physics issues
      const dt = Math.min(deltaTime, 50) / GAME_CONSTANTS.FRAME_TIME

      const paddle = paddleRef.current
      const bricks = bricksRef.current

      // Bassment: double paddle width (time-limited)
      const basePaddleW = canvasDimensions.width * config.sizing.paddleWidth
      const wide =
        Date.now() < bassmentExpiresRef.current ? basePaddleW * 2 : basePaddleW
      paddle.bounds.width = wide

      // ========== UPDATE PADDLE ==========
      let newPaddleX = paddle.bounds.x

      if (paddleDirectionRef.current === 'left') {
        newPaddleX -= paddle.speed * dt
      } else if (paddleDirectionRef.current === 'right') {
        newPaddleX += paddle.speed * dt
      }

      if (paddle.targetX !== null) {
        const targetX = paddle.targetX - paddle.bounds.width / 2
        const diff = targetX - newPaddleX
        newPaddleX += diff * 0.2 * dt
      }

      newPaddleX = clamp(
        newPaddleX,
        0,
        canvasDimensions.width - paddle.bounds.width
      )
      paddle.bounds.x = newPaddleX

      for (const b of ballsRef.current) {
        if (!b.isLaunched) {
          b.position.x = paddle.bounds.x + paddle.bounds.width / 2
          b.position.y = paddle.bounds.y - b.radius - 2
        }
      }

      const playfieldTopY = canvasDimensions.height * config.layout.topPadding

      const loseLifeAndRespawn = () => {
        spiritsMultiballRef.current = false
        livesRef.current -= 1

        if (livesRef.current <= 0) {
          gameStateRef.current = 'lost'
          onStateChange?.('lost')
          onGameEnd?.({
            won: false,
            score: scoreRef.current,
            highScore: Math.max(scoreRef.current, highScoreRef.current),
            level: levelIndexRef.current + 1,
            totalLevels: levels.length,
            bricksDestroyed: destroyedBricksRef.current,
            totalBricks: totalBricksRef.current,
          })
          return
        }

        let nb = createBall(
          config,
          canvasDimensions,
          paddle,
          levelIndexRef.current
        )
        const lev = levels[levelIndexRef.current]
        if (lev?.speedMultiplier) {
          nb.speed *= lev.speedMultiplier
        }
        ballsRef.current = [nb]
        comboRef.current = 0
      }

      for (let bi = ballsRef.current.length - 1; bi >= 0; bi--) {
        const ball = ballsRef.current[bi]
        if (!ball.isLaunched) continue

        if (config.effects.showTrail) {
          ball.trail.push({ ...ball.position })
          if (ball.trail.length > config.effects.trailLength) {
            ball.trail.shift()
          }
        }

        let newX = ball.position.x + ball.velocity.x * dt
        let newY = ball.position.y + ball.velocity.y * dt
        let newVelX = ball.velocity.x
        let newVelY = ball.velocity.y

        if (newX - ball.radius < 0) {
          newX = ball.radius
          newVelX = Math.abs(newVelX)
        } else if (newX + ball.radius > canvasDimensions.width) {
          newX = canvasDimensions.width - ball.radius
          newVelX = -Math.abs(newVelX)
        }

        if (newY - ball.radius < playfieldTopY) {
          newY = playfieldTopY + ball.radius
          newVelY = Math.abs(newVelY)
        }

        ball.position.x = newX
        ball.position.y = newY
        ball.velocity.x = newVelX
        ball.velocity.y = newVelY

        if (newY - ball.radius > canvasDimensions.height) {
          ballsRef.current.splice(bi, 1)

          if (ballsRef.current.length === 0) {
            loseLifeAndRespawn()
            forceRender()
            animationFrameRef.current = requestAnimationFrame(gameLoop)
            return
          }
          continue
        }

        const paddleCollision = detectCollision(
          ball.position,
          ball.radius,
          ball.velocity,
          paddle.bounds
        )

        if (paddleCollision.collided && ball.velocity.y > 0) {
          const resolved = resolveBallPaddleCollision(
            ball,
            paddle,
            paddleCollision,
            config
          )
          ball.position = resolved.position
          ball.velocity = resolved.velocity
          comboRef.current = 0
        }

        let hitBrick = false
        for (const brick of bricks) {
          if (brick.destroyed || hitBrick) continue

          const collision = detectCollision(
            ball.position,
            ball.radius,
            ball.velocity,
            brick.bounds
          )

          if (collision.collided) {
            hitBrick = true

            const resolved = resolveBallBrickCollision(
              ball,
              brick,
              collision,
              config
            )
            ball.position = resolved.position
            ball.velocity = resolved.velocity

            if (brick.type !== 'indestructible') {
              brick.health--

              if (brick.health <= 0) {
                brick.destroyed = true
                brick.destroyedAt = Date.now()
                destroyedBricksRef.current++

                const now = Date.now()
                if (now - lastHitTimeRef.current < config.scoring.comboTimeout) {
                  comboRef.current = Math.min(
                    comboRef.current + 1,
                    config.scoring.maxCombo
                  )
                } else {
                  comboRef.current = 1
                }
                lastHitTimeRef.current = now

                const multiplier =
                  1 + comboRef.current * config.scoring.comboMultiplier
                let points = Math.floor(brick.points * multiplier)
                if (Date.now() < garrisonExpiresRef.current) {
                  points *= 2
                }
                scoreRef.current += points

                if (scoreRef.current > highScoreRef.current) {
                  highScoreRef.current = scoreRef.current
                  if (config.storage.persistHighScore) {
                    storage.set(
                      `${config.storage.storageKey}-highscore`,
                      highScoreRef.current
                    )
                  }
                }

                onScoreChange?.(scoreRef.current, comboRef.current)

                const pu = brick.powerUpVenue
                if (pu === 'garrison') {
                  garrisonExpiresRef.current =
                    Date.now() + GAME_CONSTANTS.POWER_UP_DURATION_MS
                } else if (pu === 'bassment') {
                  bassmentExpiresRef.current =
                    Date.now() + GAME_CONSTANTS.POWER_UP_DURATION_MS
                } else if (pu === 'spirits') {
                  spiritsMultiballRef.current = true
                  const lev = levels[levelIndexRef.current]
                  ballsRef.current = createSpiritsMultiball(
                    config,
                    canvasDimensions,
                    paddle,
                    levelIndexRef.current,
                    lev?.speedMultiplier
                  )
                  forceRender()
                  animationFrameRef.current = requestAnimationFrame(gameLoop)
                  return
                }
              }
            }

            break
          }
        }
      }

      const remainingBricks = bricks.filter(
        (b) => !b.destroyed && b.type !== 'indestructible'
      )

      if (remainingBricks.length === 0) {
        spiritsMultiballRef.current = false
        scoreRef.current += config.scoring.levelBonus
        onScoreChange?.(scoreRef.current, comboRef.current)

        if (levelIndexRef.current >= levels.length - 1) {
          gameStateRef.current = 'won'
          onStateChange?.('won')
          onGameEnd?.({
            won: true,
            score: scoreRef.current,
            highScore: Math.max(scoreRef.current, highScoreRef.current),
            level: levelIndexRef.current + 1,
            totalLevels: levels.length,
            bricksDestroyed: destroyedBricksRef.current,
            totalBricks: totalBricksRef.current,
          })
        } else {
          gameStateRef.current = 'levelComplete'
          onStateChange?.('levelComplete')
        }

        forceRender()
        return
      }

      forceRender()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    },
    [config, canvasDimensions, levels, onGameEnd, onScoreChange, onStateChange]
  )

  // Start/stop loop based on state
  React.useEffect(() => {
    if (gameStateRef.current === 'playing') {
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [gameLoop])

  // ========== PUBLIC ACTIONS ==========

  const startGame = React.useCallback(() => {
    if (gameStateRef.current === 'idle' || gameStateRef.current === 'lost') {
      levelIndexRef.current = startLevel - 1
      scoreRef.current = 0
      livesRef.current = config.gameplay.startingLives
      destroyedBricksRef.current = 0
      initLevel(levelIndexRef.current)
    }

    const waiting = ballsRef.current.filter((b) => !b.isLaunched)
    if (waiting.length > 0) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2)
      for (const b of waiting) {
        b.velocity = {
          x: Math.cos(angle) * b.speed,
          y: Math.sin(angle) * b.speed,
        }
        b.isLaunched = true
      }
    }

    gameStateRef.current = 'playing'
    onStateChange?.('playing')
    lastFrameTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    forceRender()
  }, [config.gameplay.startingLives, startLevel, initLevel, onStateChange, gameLoop])

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
  }, [onStateChange, gameLoop])

  const resetGame = React.useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    levelIndexRef.current = startLevel - 1
    scoreRef.current = 0
    livesRef.current = config.gameplay.startingLives
    destroyedBricksRef.current = 0
    gameStateRef.current = 'idle'
    initLevel(levelIndexRef.current)
    onStateChange?.('idle')
    forceRender()
  }, [config.gameplay.startingLives, startLevel, initLevel, onStateChange])

  const advanceAfterLevelQuiz = React.useCallback(
    (wasCorrect: boolean) => {
      if (
        gameStateRef.current !== 'levelComplete' ||
        levelIndexRef.current >= levels.length - 1
      ) {
        return
      }

      if (!wasCorrect) {
        scoreRef.current = Math.max(0, Math.floor(scoreRef.current / 2))
        onScoreChange?.(scoreRef.current, comboRef.current)
      }

      levelIndexRef.current++
      initLevel(levelIndexRef.current)
      onLevelChange?.(levelIndexRef.current + 1)

      gameStateRef.current = 'playing'
      onStateChange?.('playing')
      lastFrameTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      forceRender()
    },
    [levels.length, initLevel, onLevelChange, onStateChange, onScoreChange, gameLoop]
  )

  const debugCompleteLevel = React.useCallback(() => {
    if (gameStateRef.current !== 'playing') return

    cancelAnimationFrame(animationFrameRef.current)

    const bricks = bricksRef.current
    for (const b of bricks) {
      if (b.type === 'indestructible') continue
      b.destroyed = true
      b.health = 0
    }
    destroyedBricksRef.current = totalBricksRef.current

    scoreRef.current += config.scoring.levelBonus
    onScoreChange?.(scoreRef.current, comboRef.current)

    if (levelIndexRef.current >= levels.length - 1) {
      gameStateRef.current = 'won'
      onStateChange?.('won')
      onGameEnd?.({
        won: true,
        score: scoreRef.current,
        highScore: Math.max(scoreRef.current, highScoreRef.current),
        level: levelIndexRef.current + 1,
        totalLevels: levels.length,
        bricksDestroyed: destroyedBricksRef.current,
        totalBricks: totalBricksRef.current,
      })
    } else {
      gameStateRef.current = 'levelComplete'
      onStateChange?.('levelComplete')
    }

    forceRender()
  }, [
    config.scoring.levelBonus,
    levels.length,
    onGameEnd,
    onScoreChange,
    onStateChange,
  ])

  const movePaddle = React.useCallback((direction: 'left' | 'right' | 'none') => {
    paddleDirectionRef.current = direction
    paddleRef.current.targetX = null
  }, [])

  const setPaddlePosition = React.useCallback((x: number) => {
    paddleRef.current.targetX = x
    paddleDirectionRef.current = 'none'
  }, [])

  const launchBallAction = React.useCallback(() => {
    if (gameStateRef.current !== 'playing') return
    const waiting = ballsRef.current.filter((b) => !b.isLaunched)
    if (waiting.length === 0) return
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2)
    for (const b of waiting) {
      b.velocity = {
        x: Math.cos(angle) * b.speed,
        y: Math.sin(angle) * b.speed,
      }
      b.isLaunched = true
    }
    forceRender()
  }, [])

  // Create snapshot for rendering
  const currentLevel = levels[levelIndexRef.current] || levels[0]
  const snapshot: GameSnapshot = {
    state: gameStateRef.current,
    level: levelIndexRef.current + 1,
    levelName: currentLevel?.name || `Level ${levelIndexRef.current + 1}`,
    score: scoreRef.current,
    highScore: highScoreRef.current,
    lives: livesRef.current,
    bricks: bricksRef.current,
    paddle: paddleRef.current,
    balls: ballsRef.current.map((b) => ({
      ...b,
      trail: [...b.trail],
    })),
    combo: comboRef.current,
    totalLevels: levels.length,
    garrisonDoubleActive: Date.now() < garrisonExpiresRef.current,
    bassmentWideActive: Date.now() < bassmentExpiresRef.current,
    spiritsMultiballActive: spiritsMultiballRef.current,
  }

  return {
    snapshot,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    advanceAfterLevelQuiz,
    debugCompleteLevel,
    movePaddle,
    setPaddlePosition,
    launchBall: launchBallAction,
  }
}
