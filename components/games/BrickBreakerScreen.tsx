'use client'

import * as React from 'react'
import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { BrickBreaker } from '@/components/brick-breaker'
import type { BrickBreakerConfig, DeepPartial, GameEndResult } from '@/components/types'
import { formatScore } from '@/components/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type LeaderboardEntry = {
  rank: number
  userId: string
  name: string
  highScore: number
  updatedAt: string
}

/** Canvas + HUD colors aligned with portal / venue palette */
const PORTAL_GAME_CONFIG: DeepPartial<BrickBreakerConfig> = {
  layout: {
    /** Align with tall HUD; bricks start below ceiling + brickTopGap + one row */
    topPadding: 0.19,
    brickTopGap: 12,
  },
  sizing: {
    paddleOffset: 0.11,
  },
  colors: {
    background: 'oklch(0.065 0.025 265)',
    ball: 'var(--spirits-cyan)',
    paddle: 'var(--spirits-magenta)',
    ballTrail: 'var(--spirits-cyan)',
    text: 'var(--foreground)',
    textMuted: 'var(--muted-foreground)',
    bricks: {
      normal: 'var(--spirits-cyan)',
      strong: 'var(--spirits-magenta)',
      metal: 'var(--spirits-yellow)',
      indestructible: 'var(--muted-foreground)',
    },
  },
}

interface BrickBreakerScreenProps {
  currentUserId: string
}

function LeaderboardList({
  loading,
  loadError,
  leaderboard,
  currentUserId,
}: {
  loading: boolean
  loadError: string | null
  leaderboard: LeaderboardEntry[]
  currentUserId: string
}) {
  if (loading) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
  }
  if (loadError) {
    return <p className="py-6 text-center text-sm text-destructive">{loadError}</p>
  }
  if (leaderboard.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No scores yet — be the first on the board.
      </p>
    )
  }
  return (
    <ol className="max-h-[min(60vh,24rem)] space-y-1 overflow-y-auto overscroll-contain py-1 text-sm">
      {leaderboard.map((row) => (
        <li
          key={row.userId}
          className={cn(
            'flex items-center justify-between gap-2 rounded-xl px-3 py-2.5',
            row.userId === currentUserId &&
              'bg-spirits-cyan/15 ring-1 ring-spirits-cyan/35'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-7 shrink-0 tabular-nums text-muted-foreground">{row.rank}.</span>
            <span className="truncate font-medium">{row.name}</span>
          </span>
          <span className="shrink-0 tabular-nums font-semibold text-spirits-cyan">
            {formatScore(row.highScore)}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function BrickBreakerScreen({ currentUserId }: BrickBreakerScreenProps) {
  const [myHighScore, setMyHighScore] = React.useState(0)
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([])
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [scoresOpen, setScoresOpen] = React.useState(false)

  const refreshScores = React.useCallback(async () => {
    try {
      const res = await fetch('/api/games/brick-breaker/scores')
      if (!res.ok) {
        setLoadError('Could not load leaderboard.')
        return
      }
      const data = (await res.json()) as {
        myHighScore?: number
        leaderboard?: LeaderboardEntry[]
      }
      setMyHighScore(typeof data.myHighScore === 'number' ? data.myHighScore : 0)
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : [])
      setLoadError(null)
    } catch {
      setLoadError('Could not load leaderboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refreshScores()
  }, [refreshScores])

  const onGameEnd = React.useCallback(
    async (result: GameEndResult) => {
      try {
        const res = await fetch('/api/games/brick-breaker/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: result.highScore }),
        })
        if (res.ok) {
          const data = (await res.json()) as { highScore?: number }
          if (typeof data.highScore === 'number') {
            setMyHighScore(data.highScore)
          }
          void refreshScores()
        }
      } catch {
        /* non-blocking */
      }
    },
    [refreshScores]
  )

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden overscroll-none bg-background text-foreground">
      <header
        className="flex shrink-0 items-center gap-2 border-b border-border/60 bg-card/85 px-3 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 sm:gap-3 sm:px-4 sm:py-3"
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
        }}
      >
        <Link
          href="/dashboard"
          className="min-h-[44px] min-w-[44px] shrink-0 content-center text-center text-sm font-medium text-muted-foreground transition-colors hover:text-spirits-cyan sm:min-w-0 sm:text-left"
        >
          ← <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-['Bebas_Neue',sans-serif] text-xl tracking-wide text-spirits-cyan sm:text-2xl">
            Brick breaker
          </h1>
          <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
            10 levels · tap the game, then play · team high scores
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 gap-1.5 border-spirits-cyan/35 bg-spirits-cyan/10 px-2.5 text-spirits-cyan hover:bg-spirits-cyan/20 sm:px-3"
          onClick={() => setScoresOpen(true)}
        >
          <Trophy className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Scores</span>
        </Button>
      </header>

      <div className="relative min-h-0 flex-1">
        <BrickBreaker
          canvasLayout="fill"
          className="absolute inset-0 flex min-h-0 flex-col"
          config={{
            ...PORTAL_GAME_CONFIG,
            storage: { persistHighScore: false },
          }}
          remoteHighScore={myHighScore}
          onGameEnd={onGameEnd}
          showFocusRing={false}
        />
      </div>

      <p
        className="shrink-0 border-t border-border/40 bg-card/40 px-3 py-2 text-center text-[10px] leading-snug text-muted-foreground sm:text-xs"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        <span className="hidden sm:inline">
          Move: ← → or A D · Pause: Esc · Restart after game over: R ·
        </span>
        Touch and drag under the paddle to move · tap the playfield to start
      </p>

      <Dialog open={scoresOpen} onOpenChange={setScoresOpen}>
        <DialogContent className="max-h-[min(90dvh,32rem)] w-[min(100%,24rem)] border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle className="font-['Bebas_Neue',sans-serif] text-2xl font-normal tracking-wide text-spirits-cyan">
              Team leaderboard
            </DialogTitle>
          </DialogHeader>
          <p className="px-4 pb-2 text-xs text-muted-foreground sm:px-6">
            Best score per person is saved when a run ends (win or lose). Your HI on the game
            bar is your personal best.
          </p>
          <div className="px-4 pb-4 sm:px-6">
            <LeaderboardList
              loading={loading}
              loadError={loadError}
              leaderboard={leaderboard}
              currentUserId={currentUserId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
