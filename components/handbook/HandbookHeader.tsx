'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HandbookNav } from './HandbookNav'
import { cn } from '@/lib/utils'

interface Book {
  id: string
  title: string
}

interface HandbookHeaderProps {
  books: Book[]
  currentBookId?: string
  currentSectionTitle?: string
  sections?: Array<{ id: string; title: string }>
}

export function HandbookHeader({ books, currentBookId, currentSectionTitle, sections }: HandbookHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentBook = currentBookId ? books.find(b => b.id === currentBookId) : null

  const handleBack = () => {
    if (currentSectionTitle && currentBookId) {
      // Go back to book contents
      const params = new URLSearchParams(searchParams.toString())
      params.delete('section')
      router.push(`/handbook?${params.toString()}`)
    } else if (currentBookId) {
      // Go back to landing page
      router.push('/handbook')
    }
  }

  return (
    <header 
      className="w-full bg-[oklch(0.08_0_0)]/90 backdrop-blur-md border-b border-border/50 fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center gap-3">
          {(currentSectionTitle || currentBookId) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
              <h1 className="text-xl font-bold truncate">
                {currentBook?.title || 'Staff Handbook'}
              </h1>
            </div>
            {currentSectionTitle && (
              <p className="text-sm text-muted-foreground truncate">
                {currentSectionTitle}
              </p>
            )}
            {!currentBookId && (
              <p className="text-sm text-muted-foreground">
                Your guide to working at Gaitens Leisure Group
              </p>
            )}
          </div>
          
          {/* Navigation Menu Button */}
          {currentBookId && sections && (
            <HandbookNav
              books={books.map(b => ({
                id: b.id,
                title: b.title,
                sections: b.id === currentBookId ? sections : []
              }))}
              currentBookId={currentBookId}
              currentSectionId={currentSectionTitle || undefined}
            />
          )}
        </div>
      </div>
    </header>
  )
}
