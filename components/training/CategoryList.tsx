'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { TrainingCourse } from '@/types/database'
import { cn } from '@/lib/utils'

interface TrainingCourseWithStatus extends TrainingCourse {
  completed: boolean
  required: boolean
  completion?: { completedAt: string; expiresAt: string }
}

interface CategoryListProps {
  courses: TrainingCourseWithStatus[]
  onSelectCategory: (category: string | null) => void
}

// Duolingo-style color palette
const categoryColors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-green-500 to-green-600',
  'from-yellow-500 to-yellow-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600',
  'from-cyan-500 to-cyan-600',
]

export function CategoryList({ courses, onSelectCategory }: CategoryListProps) {
  // Group courses by category
  const categoriesMap = courses.reduce((acc, course) => {
    const category = course.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(course)
    return acc
  }, {} as Record<string, TrainingCourseWithStatus[]>)

  const categories = Object.entries(categoriesMap).map(([name, courses]) => {
    const completed = courses.filter(c => c.completed).length
    const total = courses.length
    const progress = total > 0 ? (completed / total) * 100 : 0
    
    return {
      name,
      courses,
      completed,
      total,
      progress,
    }
  })

  // Sort: categories with incomplete courses first
  categories.sort((a, b) => {
    const aHasIncomplete = a.completed < a.total
    const bHasIncomplete = b.completed < b.total
    if (aHasIncomplete && !bHasIncomplete) return -1
    if (!aHasIncomplete && bHasIncomplete) return 1
    return a.name.localeCompare(b.name)
  })

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length]
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No training categories available yet.</p>
        </CardContent>
      </Card>
    )
  }

  // DC-03: find the single "Up Next" category — first with incomplete required, else first incomplete
  const upNextName = categories.find(c => c.completed < c.total && c.courses.some(x => x.required && !x.completed))?.name
    ?? categories.find(c => c.completed < c.total)?.name

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category, index) => {
        const isComplete = category.completed === category.total
        const color = getCategoryColor(index)
        const isUpNext = category.name === upNextName
        // DC-11: does this category have required incomplete courses?
        const hasRequiredIncomplete = category.courses.some(c => c.required && !c.completed)

        return (
          <Card
            key={category.name}
            className={cn(
              // DC-12: hover affordance
              "cursor-pointer border-2 transition-all duration-150 hover:bg-accent/50 hover:shadow-md active:scale-95",
              isComplete && "border-green-500/50",
              isUpNext && !isComplete && "border-primary/50 ring-2 ring-primary/20",
            )}
            onClick={() => onSelectCategory(category.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-base font-semibold leading-tight">{category.name}</h3>
                <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                  {/* DC-03: Up Next badge */}
                  {isUpNext && !isComplete && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold animate-pulse">
                      Up Next
                    </span>
                  )}
                  {/* DC-11: Required badge */}
                  {hasRequiredIncomplete && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{category.completed} / {category.total}</span>
                  <span>{Math.round(category.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      isComplete ? "bg-green-500" : `bg-gradient-to-r ${color}`
                    )}
                    style={{ width: `${category.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
