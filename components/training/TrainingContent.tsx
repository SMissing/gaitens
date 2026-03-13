'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import type { TrainingCourse } from '@/types/database'
import { CategoryList } from './CategoryList'
import { CourseList } from './CourseList'
import { CoursePage } from './CoursePage'

interface TrainingCourseWithStatus extends TrainingCourse {
  completed: boolean
  required: boolean
  completion?: { completedAt: string; expiresAt: string }
}

interface TrainingContentProps {
  courses: TrainingCourseWithStatus[]
  userSite: string | null
  selectedBusiness?: string | null
  onRefresh?: () => void
}

type ViewMode = 'categories' | 'courses' | 'course'

export function TrainingContent({ courses, userSite, selectedBusiness, onRefresh }: TrainingContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())

  // Initialize completed modules
  useEffect(() => {
    const completed = new Set(
      courses.filter(c => c.completed).map(c => c.id)
    )
    setCompletedModules(completed)
  }, [courses])

  // Calculate progress
  const requiredCourses = courses.filter(c => c.required)
  const totalRequired = requiredCourses.length
  const completedRequired = requiredCourses.filter(c => c.completed).length
  const progressPercentage = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0

  const handleSelectCategory = (category: string | null) => {
    setSelectedCategory(category)
    setViewMode('courses')
  }

  const handleSelectCourse = (courseId: string) => {
    setCurrentCourseId(courseId)
    setViewMode('course')
  }

  const handleCourseComplete = () => {
    if (currentCourseId) {
      setCompletedModules(prev => new Set([...prev, currentCourseId]))
    }
    setViewMode('courses')
    setCurrentCourseId(null)
    // Refresh courses data after a short delay to avoid race conditions
    if (onRefresh) {
      setTimeout(() => {
        onRefresh()
      }, 100)
    }
  }

  const handleBackToCourses = () => {
    setViewMode('courses')
    setCurrentCourseId(null)
  }

  const handleBackToCategories = () => {
    setViewMode('categories')
    setSelectedCategory(null)
    setCurrentCourseId(null)
  }

  // Show course page if in course mode
  if (viewMode === 'course' && currentCourseId) {
    const currentCourse = courses.find(c => c.id === currentCourseId)
    if (!currentCourse) {
      handleBackToCourses()
      return null
    }
    return (
      <CoursePage
        course={currentCourse}
        onComplete={handleCourseComplete}
        onBack={handleBackToCourses}
      />
    )
  }

  // Show course list if in courses mode
  if (viewMode === 'courses' && selectedCategory !== null) {
    const categoryCourses = courses.filter(c => {
      const courseCategory = c.category || 'General'
      return courseCategory === selectedCategory
    })
    return (
      <CourseList
        category={selectedCategory}
        courses={categoryCourses}
        onSelectCourse={handleSelectCourse}
        onBack={handleBackToCategories}
      />
    )
  }

  // Show category list (default)
  return (
    <div className="space-y-6">
      {/* Progress Section */}
      {totalRequired > 0 && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Progress
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {completedRequired} of {totalRequired} required completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userSite
                ? `Required training for ${userSite}. Complete all required modules to stay up to date.`
                : 'Complete all required training modules.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category List */}
      <CategoryList
        courses={courses}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  )
}
