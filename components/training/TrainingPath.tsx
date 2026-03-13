'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Lock, Play, Trophy, Clock, MapPin, Globe } from 'lucide-react'
import type { TrainingCourse } from '@/types/database'
import { cn } from '@/lib/utils'

interface TrainingCourseWithStatus extends TrainingCourse {
  completed: boolean
  required: boolean
  completion?: { completedAt: string; expiresAt: string }
}

interface TrainingPathProps {
  courses: TrainingCourseWithStatus[]
  onStartCourse: (courseId: string) => void
  userSite: string | null
}

export function TrainingPath({ courses, onStartCourse, userSite }: TrainingPathProps) {
  // Sort courses: required first, then by category, then by creation date
  const sortedCourses = [...courses].sort((a, b) => {
    // Required courses first
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    
    // Then by category
    if (a.category !== b.category) {
      if (!a.category) return 1
      if (!b.category) return -1
      return a.category.localeCompare(b.category)
    }
    
    // Then by creation date
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // Find first incomplete course
  const firstIncompleteIndex = sortedCourses.findIndex(c => !c.completed)
  const nextCourseIndex = firstIncompleteIndex === -1 ? sortedCourses.length : firstIncompleteIndex

  const getCourseStatus = (index: number, course: TrainingCourseWithStatus) => {
    if (course.completed) return 'completed'
    if (index === nextCourseIndex) return 'next'
    if (index < nextCourseIndex) return 'available' // Shouldn't happen with proper sorting, but handle it
    return 'locked'
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />
      case 'text':
        return <Trophy className="h-5 w-5" />
      case 'guide':
        return <Trophy className="h-5 w-5" />
      default:
        return <Trophy className="h-5 w-5" />
    }
  }

  const getModuleColor = (type: string, status: string) => {
    const baseColors = {
      video: 'from-red-500 to-red-600',
      text: 'from-blue-500 to-cyan-600',
      guide: 'from-purple-500 to-purple-600',
    }
    const color = baseColors[type as keyof typeof baseColors] || 'from-gray-500 to-gray-600'
    
    if (status === 'completed') return `bg-gradient-to-br ${color} opacity-100`
    if (status === 'next') return `bg-gradient-to-br ${color} opacity-100 ring-4 ring-primary/30`
    if (status === 'available') return `bg-gradient-to-br ${color} opacity-75`
    return `bg-gradient-to-br from-gray-400 to-gray-500 opacity-50`
  }

  return (
    <div className="space-y-8">
      {/* Path Visualization */}
      <div className="relative">
        {/* Connection Lines */}
        {sortedCourses.length > 1 && (
          <div className="absolute left-8 top-0 w-0.5 bg-gradient-to-b from-border/30 via-border/50 to-border/30" 
            style={{ height: `${(sortedCourses.length - 1) * 140}px` }} 
          />
        )}
        
        {/* Course Nodes */}
        <div className="space-y-8 relative z-10">
          {sortedCourses.map((course, index) => {
            const status = getCourseStatus(index, course)
            const isCompleted = status === 'completed'
            const isNext = status === 'next'
            const isLocked = status === 'locked'
            const isAvailable = status === 'available'

            return (
              <div key={course.id} className="relative flex items-start gap-6">
                {/* Status Indicator */}
                <div className="relative z-20 flex-shrink-0">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-white transition-all",
                    getModuleColor(course.moduleType, status),
                    isNext && "scale-110 shadow-lg",
                    isLocked && "cursor-not-allowed"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : isLocked ? (
                      <Lock className="h-6 w-6" />
                    ) : (
                      getModuleIcon(course.moduleType)
                    )}
                  </div>
                  
                  {/* Progress Ring for Next Course */}
                  {isNext && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
                  )}
                </div>

                {/* Course Card */}
                <Card className={cn(
                  "flex-1 transition-all",
                  isNext && "ring-2 ring-primary shadow-lg",
                  isLocked && "opacity-60"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{course.title}</h3>
                          {course.required && (
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full font-medium">
                              Required
                            </span>
                          )}
                          {course.category && (
                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-medium">
                              {course.category}
                            </span>
                          )}
                        </div>
                        
                        {course.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {course.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          {course.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration} min
                            </span>
                          )}
                          {course.site ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {course.site}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              All Sites
                            </span>
                          )}
                          {course.quizQuestions && course.quizQuestions.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {course.quizQuestions.length} questions
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <Button
                            onClick={() => onStartCourse(course.id)}
                            variant="outline"
                            className="min-w-[120px]"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        ) : isLocked ? (
                          <div className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Locked
                          </div>
                        ) : (
                          <Button
                            onClick={() => onStartCourse(course.id)}
                            className={cn(
                              "min-w-[120px]",
                              isNext && "bg-primary hover:bg-primary/90"
                            )}
                            variant={isNext ? "default" : "outline"}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {isNext ? "Start" : "Continue"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No training modules available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
