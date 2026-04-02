'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, Trophy } from 'lucide-react'
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

/** White Gaitens head — used as playfield watermark (same asset as app shell) */
const GAITENS_HEAD_LOGO = '/logos/gaitens-logo-white.png'

/** Refined dark “arena” palette; bricks read as panels, gold accent on metal */
const PORTAL_GAME_CONFIG: DeepPartial<BrickBreakerConfig> = {
  layout: {
    topPadding: 0.19,
    brickTopGap: 12,
    brickBorderRadius: 5,
  },
  sizing: {
    paddleOffset: 0.11,
  },
  colors: {
    background: '#0e1016',
    ball: '#e8eaef',
    paddle: '#353b4a',
    ballTrail: 'rgba(232, 234, 239, 0.28)',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    bricks: {
      normal: '#4f566b',
      strong: '#5a4d6e',
      metal: '#c5a66b',
      indestructible: '#2a2e38',
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
    return <p className="py-6 text-center text-sm text-zinc-500">Loading…</p>
  }
  if (loadError) {
    return <p className="py-6 text-center text-sm text-red-400">{loadError}</p>
  }
  if (leaderboard.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500">
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
              'bg-amber-200/10 ring-1 ring-amber-200/25'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-7 shrink-0 tabular-nums text-zinc-500">{row.rank}.</span>
            <span className="truncate font-medium text-zinc-200">{row.name}</span>
          </span>
          <span className="shrink-0 tabular-nums font-semibold text-amber-200/95">
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
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden overscroll-none bg-[#07080c] text-zinc-100">
      <header
        className="shrink-0 border-b border-white/[0.06] bg-zinc-950/92 backdrop-blur-2xl supports-[backdrop-filter]:bg-zinc-950/80"
        style={{
          paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
          paddingBottom: '10px',
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.1] hover:text-zinc-50 active:scale-[0.97]"
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
          </Link>

          <div className="min-w-0 flex-1 px-1 text-center sm:px-2">
            <h1 className="truncate font-['Bebas_Neue',sans-serif] text-[1.15rem] leading-tight tracking-[0.16em] text-zinc-50 sm:text-xl">
              BRICK BREAKER
            </h1>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
              10 levels · team leaderboard
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open leaderboard"
            className="size-11 shrink-0 rounded-full bg-white/[0.06] text-amber-200/95 ring-1 ring-white/[0.08] hover:bg-amber-200/10 hover:text-amber-100 active:scale-[0.97]"
            onClick={() => setScoresOpen(true)}
          >
            <Trophy className="size-5" aria-hidden />
          </Button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 bg-[#060709]">
        <BrickBreaker
          canvasLayout="fill"
          className="absolute inset-0 flex min-h-0 flex-col"
          config={{
            ...PORTAL_GAME_CONFIG,
            storage: { persistHighScore: false },
          }}
          watermarkSrc={GAITENS_HEAD_LOGO}
          remoteHighScore={myHighScore}
          onGameEnd={onGameEnd}
          showFocusRing={false}
        />
      </div>

      <p
        className="shrink-0 border-t border-white/[0.06] bg-zinc-950/70 py-2 text-center text-[10px] leading-snug text-zinc-500 sm:text-xs"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <span className="hidden sm:inline">
          Move: ← → or A D · Pause: Esc · Restart after game over: R ·
        </span>
        Touch and drag under the paddle to move · tap the playfield to start
      </p>

      <Dialog open={scoresOpen} onOpenChange={setScoresOpen}>
        <DialogContent className="max-h-[min(90dvh,32rem)] w-[min(100%,24rem)] border-white/10 bg-zinc-900 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-['Bebas_Neue',sans-serif] text-2xl font-normal tracking-[0.1em] text-zinc-100">
              Team leaderboard
            </DialogTitle>
          </DialogHeader>
          <p className="px-4 pb-2 text-xs text-zinc-500 sm:px-6">
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
