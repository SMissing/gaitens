'use client'

import { useEffect, useState, useMemo } from 'react'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
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

const getVenueBorderStyle = (venue: string): React.CSSProperties => {
  switch (venue) {
    case 'Garrison':
      return { borderColor: 'oklch(0.5500 0.2000 50)' } // Burnt orange
    case 'Spirits':
      return { borderColor: 'oklch(0.9500 0.2000 100)' } // Yellow
    case 'Bassment':
      return { borderColor: 'oklch(0.6500 0.3000 320)' } // Magenta
    default:
      return {} // Use default border color
  }
}

const statusColors = {
  submitted: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  under_review: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  implemented: 'bg-green-500/20 text-green-500 border-green-500/50',
  rejected: 'bg-red-500/20 text-red-500 border-red-500/50',
}

export function IdeasList({ initialIdeas, refreshKey, sortBy = 'recent', filterBy = 'All' }: IdeasListProps) {
  const [ideas, setIdeas] = useState<IdeaWithVotes[]>(initialIdeas)
  const [loading, setLoading] = useState(false)
  const [votingIdeas, setVotingIdeas] = useState<Set<string>>(new Set())

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

        return (
          <Card 
            key={idea.id} 
            className="bg-[#1e1e1e] rounded-2xl border-2"
            style={getVenueBorderStyle(idea.venue)}
          >
            <CardContent className="p-4 sm:p-6 pb-1">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground flex-1">
                    {idea.title}
                  </h3>
                  <div className="flex items-center flex-shrink-0">
                    {idea.venue === 'All' ? (
                      <span className="text-sm text-muted-foreground">All</span>
                    ) : (
                      <div className="relative h-5 w-16 sm:h-6 sm:w-20">
                        <Image
                          src={
                            idea.venue === 'Garrison'
                              ? '/logos/garrison-head-logo.png'
                              : idea.venue === 'Spirits'
                              ? '/logos/spirits-head-logo.png'
                              : '/logos/bassment-logo.png'
                          }
                          alt={idea.venue}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
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
