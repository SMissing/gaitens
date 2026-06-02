'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Play, Clock, Trophy } from 'lucide-react'
import type { TrainingCourse } from '@/types/database'
import { cn } from '@/lib/utils'

interface TrainingCourseWithStatus extends TrainingCourse {
  completed: boolean
  required: boolean
  completion?: { completedAt: string; expiresAt: string }
}

interface CourseListProps {
  category: string
  courses: TrainingCourseWithStatus[]
  onSelectCourse: (courseId: string) => void
  onBack: () => void
}

export function CourseList({ category, courses, onSelectCourse, onBack }: CourseListProps) {
  // Sort courses: required first, then by completion status
  const sortedCourses = [...courses].sort((a, b) => {
    // Required courses first
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    
    // Then incomplete before complete
    if (!a.completed && b.completed) return -1
    if (a.completed && !b.completed) return 1
    
    // Then by creation date
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // Find first incomplete course index (for highlighting, but not locking)
  const firstIncompleteIndex = sortedCourses.findIndex(c => !c.completed)
  const nextCourseIndex = firstIncompleteIndex === -1 ? sortedCourses.length : firstIncompleteIndex

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

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-red-500 to-red-600'
      case 'text':
        return 'from-blue-500 to-cyan-600'
      case 'guide':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{category}</h1>
          <p className="text-muted-foreground">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCourses.map((course, index) => {
          const isCompleted = course.completed
          const isNext = index === nextCourseIndex
          const color = getModuleColor(course.moduleType)

          return (
            <Card
              key={course.id}
              className={cn(
                // DC-12: hover affordance
                "border-2 cursor-pointer transition-all duration-150 hover:bg-accent/50 hover:shadow-md active:scale-95",
                isCompleted && "border-green-500/50",
                isNext && "ring-2 ring-primary shadow-md"
              )}
              onClick={() => onSelectCourse(course.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Course Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0",
                    color,
                    isCompleted && "ring-2 ring-green-500/30",
                    isNext && "ring-2 ring-primary/30"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      getModuleIcon(course.moduleType)
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold line-clamp-1 mb-1">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}m
                        </span>
                      )}
                      {course.quizQuestions && course.quizQuestions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {course.quizQuestions.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Play className={cn(
                        "h-5 w-5",
                        isNext ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
