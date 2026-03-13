'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Book {
  id: string
  title: string
}

interface BookSelectorProps {
  books: Book[]
  currentBookId: string
}

export function BookSelector({ books, currentBookId }: BookSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleBookChange = (bookId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('book', bookId)
    // Reset to first section of the new book
    params.delete('section')
    router.push(`/handbook?${params.toString()}`)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <BookOpen className="h-5 w-5 text-spirits-cyan" />
        <span className="text-sm font-medium text-muted-foreground">Select Book:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => handleBookChange(book.id)}
            className={cn(
              "px-4 py-2 rounded-2xl border transition-all",
              "hover:bg-[#262626] hover:border-spirits-cyan/50",
              currentBookId === book.id
                ? "bg-spirits-cyan/10 border-spirits-cyan text-foreground font-semibold"
                : "bg-[#1e1e1e] border-border/30 text-muted-foreground"
            )}
          >
            {book.title}
          </button>
        ))}
      </div>
    </div>
  )
}
