'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DisciplinariesSortFilter } from './DisciplinariesSortFilter'
import { Heart, Gavel, HeartHandshake, Skull } from 'lucide-react'
import type { User } from '@/types/database'

type SortOption = 'name' | 'most_disciplinaries' | 'least_disciplinaries' | 'site'
type FilterOption = 'All' | 'Garrison' | 'Spirits' | 'Bassment'

interface StaffMember extends User {
  disciplinaryCount: number
  remainingHearts: number
  disciplinaries: any[]
}

interface DisciplinariesListProps {
  initialStaff?: StaffMember[]
}

export function DisciplinariesList({ initialStaff }: DisciplinariesListProps) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff || [])
  const [loading, setLoading] = useState(!initialStaff)
  const [sortBy, setSortBy] = useState<SortOption>('most_disciplinaries')
  const [filterBy, setFilterBy] = useState<FilterOption>('All')
  const [breakingHeart, setBreakingHeart] = useState<string | null>(null)
  const [restoringHeart, setRestoringHeart] = useState<string | null>(null)

  // Fetch staff data on mount if not provided
  useEffect(() => {
    if (!initialStaff) {
      fetchStaff()
    }
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/disciplinaries')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter staff by site
  const filteredStaff = staff.filter((member) => {
    if (filterBy === 'All') return true
    return member.site === filterBy
  })

  // Sort staff
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'most_disciplinaries':
        return b.disciplinaryCount - a.disciplinaryCount
      case 'least_disciplinaries':
        return a.disciplinaryCount - b.disciplinaryCount
      case 'site':
        return (a.site || '').localeCompare(b.site || '')
      default:
        return 0
    }
  })

  const handleBreakHeart = async (userId: string) => {
    if (breakingHeart === userId) return

    const member = staff.find((s) => s.id === userId)
    if (!member || member.disciplinaryCount >= 3) {
      return
    }

    setBreakingHeart(userId)

    // Optimistically update the UI
    setStaff(prevStaff => 
      prevStaff.map(s => 
        s.id === userId 
          ? {
              ...s,
              disciplinaryCount: s.disciplinaryCount + 1,
              remainingHearts: Math.max(0, s.remainingHearts - 1),
            }
          : s
      )
    )

    try {
      const response = await fetch('/api/disciplinaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason: null,
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        setStaff(prevStaff => 
          prevStaff.map(s => 
            s.id === userId 
              ? {
                  ...s,
                  disciplinaryCount: s.disciplinaryCount - 1,
                  remainingHearts: Math.min(3, s.remainingHearts + 1),
                }
              : s
          )
        )
        const error = await response.json()
        console.error('Error response:', error)
        alert(error.error || 'Failed to create disciplinary')
        return
      }
    } catch (error) {
      // Revert optimistic update on error
      setStaff(prevStaff => 
        prevStaff.map(s => 
          s.id === userId 
            ? {
                ...s,
                disciplinaryCount: s.disciplinaryCount - 1,
                remainingHearts: Math.min(3, s.remainingHearts + 1),
              }
            : s
        )
      )
      console.error('Error breaking heart:', error)
      alert('Failed to create disciplinary')
    } finally {
      setBreakingHeart(null)
    }
  }

  const handleRestoreHeart = async (userId: string) => {
    if (restoringHeart === userId) return

    const member = staff.find((s) => s.id === userId)
    if (!member || member.disciplinaryCount === 0) {
      return
    }

    setRestoringHeart(userId)

    // Optimistically update the UI
    setStaff(prevStaff => 
      prevStaff.map(s => 
        s.id === userId 
          ? {
              ...s,
              disciplinaryCount: Math.max(0, s.disciplinaryCount - 1),
              remainingHearts: Math.min(3, s.remainingHearts + 1),
            }
          : s
      )
    )

    try {
      const response = await fetch('/api/disciplinaries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on error
        setStaff(prevStaff => 
          prevStaff.map(s => 
            s.id === userId 
              ? {
                  ...s,
                  disciplinaryCount: s.disciplinaryCount + 1,
                  remainingHearts: Math.max(0, s.remainingHearts - 1),
                }
              : s
          )
        )
        const error = await response.json()
        console.error('Error response:', error)
        alert(error.error || 'Failed to restore heart')
        return
      }
    } catch (error) {
      // Revert optimistic update on error
      setStaff(prevStaff => 
        prevStaff.map(s => 
          s.id === userId 
            ? {
                ...s,
                disciplinaryCount: s.disciplinaryCount + 1,
                remainingHearts: Math.max(0, s.remainingHearts - 1),
              }
            : s
        )
      )
      console.error('Error restoring heart:', error)
      alert('Failed to restore heart')
    } finally {
      setRestoringHeart(null)
    }
  }

  const renderHearts = (remainingHearts: number, disciplinaryCount: number) => {
    const hearts = []
    for (let i = 0; i < 3; i++) {
      if (i < remainingHearts) {
        hearts.push(
          <Heart
            key={i}
            className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-red-500 flex-shrink-0"
          />
        )
      } else {
        hearts.push(
          <Heart
            key={i}
            className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 fill-gray-500 opacity-50 flex-shrink-0"
          />
        )
      }
    }
    return hearts
  }

  return (
    <div className="space-y-4">
      {/* Sort and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Staff Disciplinaries</h2>
        <DisciplinariesSortFilter
          currentSort={sortBy}
          currentFilter={filterBy}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
        />
      </div>

      {/* Staff List */}
      {loading ? (
        <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading staff...</p>
          </CardContent>
        </Card>
      ) : sortedStaff.length === 0 ? (
        <Card className="bg-[#1e1e1e] rounded-2xl border border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No staff members found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedStaff.map((member) => (
            <Card
              key={member.id}
              className="bg-[#1e1e1e] rounded-2xl border border-border/50 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Left side - Restore heart button (25% width) */}
                  {member.disciplinaryCount > 0 ? (
                    <button
                      onClick={() => handleRestoreHeart(member.id)}
                      disabled={restoringHeart === member.id}
                      className="w-1/4 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed border-r border-border/50 transition-colors touch-manipulation min-h-[44px]"
                    >
                      {restoringHeart === member.id ? (
                        <span className="text-xs sm:text-sm text-blue-500 font-medium">Restoring...</span>
                      ) : (
                        <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  ) : (
                    <div className="w-1/4 flex items-center justify-center bg-blue-500/10 border-r border-border/50">
                      <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500/30 flex-shrink-0" />
                    </div>
                  )}

                  {/* Middle - Staff info (centered) */}
                  <div className="flex-1 p-4 sm:p-6 min-w-0 flex flex-col items-center justify-center">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground break-words text-center mb-3">
                      {member.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1">
                      {renderHearts(member.remainingHearts, member.disciplinaryCount)}
                    </div>
                  </div>
                  
                  {/* Right side - Break heart button (25% width) */}
                  {member.disciplinaryCount < 3 ? (
                    <button
                      onClick={() => handleBreakHeart(member.id)}
                      disabled={breakingHeart === member.id}
                      className="w-1/4 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed border-l border-border/50 transition-colors touch-manipulation min-h-[44px]"
                    >
                      {breakingHeart === member.id ? (
                        <span className="text-xs sm:text-sm text-red-500 font-medium">Breaking...</span>
                      ) : (
                        <Gavel className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
                      )}
                    </button>
                  ) : (
                    <div className="w-1/4 flex items-center justify-center bg-red-500/10 border-l border-border/50">
                      <Skull className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 opacity-70" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
