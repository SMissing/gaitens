'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HandbookNavigationProps {
  currentIndex: number
  totalSections: number
  sectionIds: string[]
  bookId: string
}

export function HandbookNavigation({ currentIndex, totalSections, sectionIds, bookId }: HandbookNavigationProps) {
  const router = useRouter()

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevId = sectionIds[currentIndex - 1]
      router.push(`/handbook?book=${bookId}&section=${prevId}`)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentIndex < totalSections - 1) {
      const nextId = sectionIds[currentIndex + 1]
      router.push(`/handbook?book=${bookId}&section=${nextId}`)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToContents = () => {
    router.push(`/handbook?book=${bookId}`)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (totalSections <= 1) return null

  return (
    <div className="space-y-4 mt-8 pt-6 border-t border-border">
      {/* Back to Contents button */}
      <div className="flex justify-center">
        <Button
          onClick={handleBackToContents}
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <List className="h-4 w-4" />
          Back to Contents
        </Button>
      </div>
      
      {/* Previous/Next navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className={cn(
            "flex items-center gap-2",
            currentIndex === 0 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {totalSections}
        </span>
        
        <Button
          onClick={handleNext}
          disabled={currentIndex === totalSections - 1}
          variant="outline"
          className={cn(
            "flex items-center gap-2",
            currentIndex === totalSections - 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
