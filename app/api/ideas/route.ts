import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ideaSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    // Fetch all ideas with vote counts
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select(`
        *,
        votes:idea_votes (
          vote,
          userId
        )
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching ideas:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
        { status: 500 }
      )
    }

    // Calculate vote totals, find user's vote, and sort by votes (most to least)
    const ideasWithVotes = (ideas || []).map((idea: any) => {
      const votes = idea.votes || []
      const voteTotal = votes.reduce((sum: number, v: any) => sum + (v.vote || 0), 0)
      const userVote = votes.find((v: any) => v.userId === user.id)?.vote || null
      return {
        ...idea,
        voteTotal,
        userVote,
        votes: undefined, // Remove votes array from response
      }
    }).sort((a: any, b: any) => b.voteTotal - a.voteTotal)

    return NextResponse.json({ ideas: ideasWithVotes })
  } catch (error) {
    console.error('Error in GET /api/ideas:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const body = await request.json()
    const validatedData = ideaSchema.parse(body)

    // Insert the idea
    const { data: idea, error } = await supabase
      .from('ideas')
      .insert({
        userId: user.id,
        venue: validatedData.venue,
        title: validatedData.title,
        description: validatedData.description,
        status: 'submitted',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating idea:', error)
      return NextResponse.json(
        { error: 'Failed to submit idea' },
        { status: 500 }
      )
    }

    return NextResponse.json({ idea }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/ideas:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
