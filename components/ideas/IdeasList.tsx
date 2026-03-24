'use client'

import { useEffect, useState, useMemo } from 'react'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GlowEffect } from '@/components/ui/glow-effect'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import type { Idea } from '@/types/database'

interface IdeaWithVotes extends Idea {
  voteTotal: number
  userVote: 1 | -1 | null
}

type SortOption = 'recent' | 'most_liked' | 'most_disliked' | 'oldest'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

interface IdeasListProps {
  initialIdeas: IdeaWithVotes[]
  refreshKey?: number
  sortBy?: SortOption
  filterBy?: FilterOption
}

const getVenueGlowColors = (venue: string): string[] => {
  switch (venue) {
    case 'Garrison':
      return ['#f97316', '#fb923c', '#fdba74']
    case 'Spirits':
      return ['#eab308', '#facc15', '#fde047']
    case 'Bassment':
      return ['#d946ef', '#e879f9', '#f0abfc']
    default:
      return ['#71717a', '#a1a1aa', '#71717a']
  }
}

const getVenueLogo = (venue: string): string | null => {
  if (venue === 'Garrison') return '/logos/garrison-head-logo.png'
  if (venue === 'Spirits') return '/logos/spirits-head-logo.png'
  if (venue === 'Bassment') return '/logos/bassment-logo.png'
  return null
}

const getVenueFallback = (venue: string): string => {
  if (venue === 'All') return 'ALL'
  return venue.slice(0, 2).toUpperCase()
}

export function IdeasList({ initialIdeas, refreshKey, sortBy = 'recent', filterBy = 'All' }: IdeasListProps) {
  const [ideas, setIdeas] = useState<IdeaWithVotes[]>(initialIdeas)
  const [loading, setLoading] = useState(false)
  const [votingIdeas, setVotingIdeas] = useState<Set<string>>(new Set())
  const [voteFlash, setVoteFlash] = useState<Record<string, 'up' | 'down'>>({})

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas

    // Apply filter
    if (filterBy !== 'All') {
      filtered = filtered.filter(idea => idea.venue === filterBy)
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'most_liked':
          return b.voteTotal - a.voteTotal
        case 'most_disliked':
          return a.voteTotal - b.voteTotal
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return sorted
  }, [ideas, sortBy, filterBy])

  useEffect(() => {
    const refreshIdeas = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/ideas')
        const data = await response.json()
        if (data.ideas) {
          setIdeas(data.ideas)
        }
      } catch (error) {
        console.error('Failed to refresh ideas:', error)
      } finally {
        setLoading(false)
      }
    }

    if (refreshKey !== undefined && refreshKey > 0) {
      refreshIdeas()
    }
  }, [refreshKey])

  const handleVote = async (ideaId: string, voteType: 'up' | 'down') => {
    const idea = ideas.find(i => i.id === ideaId)
    if (!idea) return

    // If clicking the same vote, remove it
    const newVote = idea.userVote === (voteType === 'up' ? 1 : -1) ? 'remove' : voteType

    setVotingIdeas(prev => new Set(prev).add(ideaId))

    try {
      const response = await fetchWithAuth(`/api/ideas/${ideaId}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: newVote }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      // Refresh ideas list
      const refreshResponse = await fetchWithAuth('/api/ideas')
      const data = await refreshResponse.json()
      if (data.ideas) {
        setIdeas(data.ideas)
      }

      // Trigger a short glow flash on successful vote actions.
      if (newVote !== 'remove') {
        setVoteFlash(prev => ({ ...prev, [ideaId]: voteType }))
        window.setTimeout(() => {
          setVoteFlash(prev => {
            const next = { ...prev }
            delete next[ideaId]
            return next
          })
        }, 900)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setVotingIdeas(prev => {
        const next = new Set(prev)
        next.delete(ideaId)
        return next
      })
    }
  }

  if (filteredAndSortedIdeas.length === 0) {
    return (
      <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No ideas submitted yet. Be the first to share your idea!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedIdeas.map((idea) => {
        const isVoting = votingIdeas.has(idea.id)
        const hasUpvoted = idea.userVote === 1
        const hasDownvoted = idea.userVote === -1
        const flashType = voteFlash[idea.id]

        return (
          <Card 
            key={idea.id} 
            className="relative overflow-hidden rounded-2xl border border-transparent bg-[#1e1e1e]"
          >
            <GlowEffect
              colors={getVenueGlowColors(idea.venue)}
              mode="rotate"
              blur="strong"
              duration={6}
              scale={1.06}
              className="opacity-80"
            />
            {flashType ? (
              <GlowEffect
                colors={flashType === 'up' ? ['#16a34a', '#22c55e', '#86efac'] : ['#dc2626', '#ef4444', '#fca5a5']}
                mode="pulse"
                blur="strongest"
                duration={0.9}
                scale={1.22}
                className="opacity-100"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-[2px] z-0 rounded-[calc(1rem-2px)] bg-[#1e1e1e]" />
            <CardContent className="relative z-10 p-4 sm:p-6 pb-1">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground flex-1">
                    {idea.title}
                  </h3>
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-transparent bg-[#1e1e1e]">
                    {getVenueLogo(idea.venue) ? (
                      <AvatarImage src={getVenueLogo(idea.venue) ?? ''} alt={idea.venue} className="object-contain p-1" />
                    ) : null}
                    <AvatarFallback className="rounded-full bg-[#1e1e1e] text-[10px] sm:text-xs tracking-wide">
                      {getVenueFallback(idea.venue)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Description */}
                <div>
                  <p className="text-foreground whitespace-pre-wrap">{idea.description}</p>
                </div>

                {/* Voting buttons - bottom right */}
                <div className="flex items-center justify-end gap-1.5 pt-0.5 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote(idea.id, 'down')}
                    disabled={isVoting}
                    className="h-7 w-7 rounded-xl transition-all hover:bg-accent"
                  >
                    <ThumbsDown className={`h-4 w-4 ${hasDownvoted ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
                  </Button>
                  <span className={`text-xs font-semibold min-w-[1.5rem] text-center ${
                    idea.voteTotal > 0 ? 'text-green-500' :
                    idea.voteTotal < 0 ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {idea.voteTotal > 0 ? '+' : ''}{idea.voteTotal}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVote(idea.id, 'up')}
                    disabled={isVoting}
                    className="h-7 w-7 rounded-xl transition-all hover:bg-accent"
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-green-500 text-green-500' : 'text-foreground'}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
