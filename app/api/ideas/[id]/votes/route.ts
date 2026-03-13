import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const voteSchema = z.object({
  vote: z.enum(['up', 'down', 'remove']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    const ideaId = params.id

    const body = await request.json()
    const { vote } = voteSchema.parse(body)

    // Check if idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('idea_votes')
      .select('id, vote')
      .eq('ideaId', ideaId)
      .eq('userId', user.id)
      .single()

    if (vote === 'remove') {
      // Remove vote
      if (existingVote) {
        const { error } = await supabase
          .from('idea_votes')
          .delete()
          .eq('id', existingVote.id)

        if (error) {
          throw error
        }
      }
      return NextResponse.json({ success: true })
    }

    const voteValue = vote === 'up' ? 1 : -1

    if (existingVote) {
      // Update existing vote
      if (existingVote.vote === voteValue) {
        // Same vote, remove it
        const { error } = await supabase
          .from('idea_votes')
          .delete()
          .eq('id', existingVote.id)

        if (error) {
          throw error
        }
      } else {
        // Different vote, update it
        const { error } = await supabase
          .from('idea_votes')
          .update({ vote: voteValue })
          .eq('id', existingVote.id)

        if (error) {
          throw error
        }
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('idea_votes')
        .insert({
          ideaId,
          userId: user.id,
          vote: voteValue,
        })

      if (error) {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/ideas/[id]/votes:', error)
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    )
  }
}
