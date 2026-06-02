'use client'

import { useState, useEffect } from 'react'
import { TrainingContent } from './TrainingContent'
import { BusinessSelection } from './BusinessSelection'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TrainingCourse } from '@/types/database'

interface TrainingContentClientProps {
  userSite: string | null
}

export function TrainingContentClient({ userSite }: TrainingContentClientProps) {
  const [courses, setCourses] = useState<Array<TrainingCourse & {
    completed: boolean
    required: boolean
    completion?: { completedAt: string; expiresAt: string }
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // DC-01: auto-select venue for assigned staff — skip picker entirely
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(userSite)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/training')
      if (!response.ok) {
        throw new Error('Failed to fetch training courses')
      }
      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training courses')
    } finally {
      setLoading(false)
    }
  }

  // Filter courses by selected business
  const filteredCourses = selectedBusiness
    ? courses.filter(course => course.site === selectedBusiness || course.site === null)
    : []

  if (loading) {
    // Skeleton that matches the hero layout — no jarring blank state
    return (
      <div className="px-5 pt-6 animate-pulse space-y-5">
        <div className="h-2.5 w-20 bg-white/10 rounded-full" />
        <div className="space-y-2">
          <div className="h-9 w-44 bg-white/10 rounded-2xl" />
          <div className="h-9 w-24 bg-white/10 rounded-2xl" />
        </div>
        <div className="h-3.5 w-24 bg-white/10 rounded-full" />
        <div className="space-y-2 pt-1">
          <div className="h-4 w-full bg-white/10 rounded-full" />
          <div className="h-3 w-40 bg-white/10 rounded-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-xl">
        {error}
      </div>
    )
  }

  // Show business selection if no business is selected
  if (!selectedBusiness) {
    return <BusinessSelection onSelect={setSelectedBusiness} />
  }

  // Show training content for selected business
  return (
    <div className="space-y-6">
      {/* Only show venue switcher for managers/unassigned staff */}
      {!userSite && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedBusiness(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change venue
        </Button>
      )}
      <TrainingContent
        courses={filteredCourses}
        userSite={userSite}
        selectedBusiness={selectedBusiness}
        onRefresh={fetchCourses}
      />
    </div>
  )
}
