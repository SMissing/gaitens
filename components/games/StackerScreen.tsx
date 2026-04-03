'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, Trophy } from 'lucide-react'
import { Stacker } from '@/components/stacker'
import type { StackerGameEndResult } from '@/components/use-stacker'
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

const GAITENS_HEAD_LOGO = '/logos/gaitens-logo-white.png'

interface StackerScreenProps {
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
            'flex items-center justify-between gap-2 rounded-xl border border-white/[0.04] bg-white/[0.03] px-3 py-2.5 transition-colors',
            row.userId === currentUserId &&
              'border-cyan-400/30 bg-cyan-500/10 ring-1 ring-cyan-400/35 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-7 shrink-0 tabular-nums text-zinc-500">{row.rank}.</span>
            <span className="truncate font-medium text-zinc-200">{row.name}</span>
          </span>
          <span className="shrink-0 tabular-nums font-semibold text-cyan-200/95">
            {formatScore(row.highScore)}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function StackerScreen({ currentUserId }: StackerScreenProps) {
  const [myHighScore, setMyHighScore] = React.useState(0)
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([])
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [scoresOpen, setScoresOpen] = React.useState(false)

  const refreshScores = React.useCallback(async () => {
    try {
      const res = await fetch('/api/games/stacker/scores')
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
    async (result: StackerGameEndResult) => {
      try {
        const res = await fetch('/api/games/stacker/scores', {
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
    <div className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden overscroll-none bg-[#050810] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.12),transparent_50%),radial-gradient(ellipse_90%_50%_at_100%_50%,rgba(192,38,211,0.08),transparent_45%),radial-gradient(ellipse_80%_60%_at_0%_80%,rgba(59,130,246,0.06),transparent_40%)]"
        aria-hidden
      />

      <header
        className="relative shrink-0 border-b border-cyan-500/15 bg-zinc-950/85 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/75"
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
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-cyan-100/90 ring-1 ring-cyan-400/20 transition-colors hover:bg-cyan-500/15 hover:text-white hover:ring-cyan-300/35 active:scale-[0.97]"
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
          </Link>

          <div className="min-w-0 flex-1 px-1 text-center sm:px-2">
            <h1 className="truncate bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text font-['Bebas_Neue',sans-serif] text-[1.15rem] leading-tight tracking-[0.2em] text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)] sm:text-xl">
              STACKER
            </h1>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-300/55 sm:text-[11px]">
              Pixel tower · team leaderboard
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open leaderboard"
            className="size-11 shrink-0 rounded-full bg-amber-400/10 text-amber-200 ring-1 ring-amber-300/25 shadow-[0_0_20px_rgba(251,191,36,0.12)] hover:bg-amber-400/20 hover:text-amber-50 hover:ring-amber-200/40 active:scale-[0.97]"
            onClick={() => setScoresOpen(true)}
          >
            <Trophy className="size-5" aria-hidden />
          </Button>
        </div>
      </header>

      <div
        className={cn(
          'relative min-h-0 flex-1 overflow-hidden',
          'bg-gradient-to-b from-[#082f4a]/90 via-[#0a0f1c] to-[#15051f]',
          'shadow-[inset_0_0_120px_rgba(0,0,0,0.5)]'
        )}
      >
        <div
          className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-fuchsia-600/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 4px)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_40%,rgba(34,211,238,0.12),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/25 to-transparent"
          aria-hidden
        />

        <Stacker
          className="absolute inset-0 flex min-h-0 flex-col"
          watermarkSrc={GAITENS_HEAD_LOGO}
          remoteHighScore={myHighScore}
          onGameEnd={onGameEnd}
          quizEvery={15}
        />
      </div>

      <p
        className="relative shrink-0 border-t border-cyan-500/20 bg-gradient-to-r from-zinc-950 via-[#0a1628] to-zinc-950 py-2.5 text-center text-[10px] font-semibold tracking-[0.2em] text-cyan-200/75 shadow-[0_-12px_40px_rgba(34,211,238,0.06)] sm:text-xs sm:tracking-[0.24em]"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        TAP TO DROP
      </p>

      <Dialog open={scoresOpen} onOpenChange={setScoresOpen}>
        <DialogContent className="max-h-[min(90dvh,32rem)] w-[min(100%,24rem)] border-cyan-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-2xl shadow-cyan-950/20">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text font-['Bebas_Neue',sans-serif] text-2xl font-normal tracking-[0.12em] text-transparent">
              Team leaderboard
            </DialogTitle>
          </DialogHeader>
          <p className="px-4 pb-2 text-xs text-zinc-500 sm:px-6">
            Best score per person is saved when a run ends. Your HI on the bar is your personal best.
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
