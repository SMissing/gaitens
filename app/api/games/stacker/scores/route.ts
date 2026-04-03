import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthUser } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

const postSchema = z.object({
  score: z.number().int().min(0).max(1_000_000_000),
})

type ScoreRow = {
  userId: string
  highScore: number
  updatedAt: string
  users: { name: string; active: boolean } | { name: string; active: boolean }[] | null
}

function unwrapUser(
  u: ScoreRow['users']
): { name: string; active: boolean } | null {
  if (!u) return null
  return Array.isArray(u) ? u[0] ?? null : u
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: rows, error } = await supabase
      .from('stacker_high_scores')
      .select('userId, highScore, updatedAt, users(name, active)')
      .order('highScore', { ascending: false })
      .limit(50)

    if (error) {
      console.error('stacker_high_scores GET:', error)
      return NextResponse.json(
        { error: 'Failed to load scores' },
        { status: 500 }
      )
    }

    const { data: mine } = await supabase
      .from('stacker_high_scores')
      .select('highScore, updatedAt')
      .eq('userId', user.id)
      .maybeSingle()

    const list = (rows || []) as ScoreRow[]
    const leaderboard = list
      .map((row) => {
        const u = unwrapUser(row.users)
        return {
          userId: row.userId,
          highScore: row.highScore,
          updatedAt: row.updatedAt,
          name: u?.name ?? 'Team member',
          active: u?.active ?? true,
        }
      })
      .filter((e) => e.active)
      .slice(0, 25)
      .map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        name: e.name,
        highScore: e.highScore,
        updatedAt: e.updatedAt,
      }))

    return NextResponse.json({
      myHighScore: mine?.highScore ?? 0,
      myUpdatedAt: mine?.updatedAt ?? null,
      leaderboard,
    })
  } catch (e) {
    console.error('GET /api/games/stacker/scores:', e)
    return NextResponse.json(
      { error: 'Failed to load scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    const submitted = parsed.data.score
    const supabase = createServerClient()

    const { data: existing, error: fetchErr } = await supabase
      .from('stacker_high_scores')
      .select('highScore')
      .eq('userId', user.id)
      .maybeSingle()

    if (fetchErr) {
      console.error('stacker_high_scores fetch:', fetchErr)
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      )
    }

    const prev = typeof existing?.highScore === 'number' ? existing.highScore : 0
    const next = Math.max(prev, submitted)
    const improved = next > prev

    if (!improved && existing) {
      return NextResponse.json({ highScore: next, improved: false })
    }

    const now = new Date().toISOString()
    const { error: upsertErr } = await supabase.from('stacker_high_scores').upsert(
      {
        userId: user.id,
        highScore: next,
        updatedAt: now,
      },
      { onConflict: 'userId' }
    )

    if (upsertErr) {
      console.error('stacker_high_scores upsert:', upsertErr)
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      )
    }

    return NextResponse.json({ highScore: next, improved })
  } catch (e) {
    console.error('POST /api/games/stacker/scores:', e)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}
