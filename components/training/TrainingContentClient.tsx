'use client'

import { useState, useEffect } from 'react'
import { TrainingContent } from './TrainingContent'
import { BusinessSelection } from './BusinessSelection'
import { Loader2, ArrowLeft } from 'lucide-react'
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
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)

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
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
      <Button
        variant="ghost"
        onClick={() => setSelectedBusiness(null)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Business Selection
      </Button>
      <TrainingContent 
        courses={filteredCourses} 
        userSite={userSite} 
        selectedBusiness={selectedBusiness}
        onRefresh={fetchCourses}
      />
    </div>
  )
}
