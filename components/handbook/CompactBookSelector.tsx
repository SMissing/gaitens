'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Book {
  id: string
  title: string
}

interface CompactBookSelectorProps {
  books: Book[]
  currentBookId: string
}

export function CompactBookSelector({ books, currentBookId }: CompactBookSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleBookChange = (bookId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('book', bookId)
    params.delete('section')
    router.push(`/handbook?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {books.map((book) => (
        <button
          key={book.id}
          onClick={() => handleBookChange(book.id)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            currentBookId === book.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {book.title}
        </button>
      ))}
    </div>
  )
}
