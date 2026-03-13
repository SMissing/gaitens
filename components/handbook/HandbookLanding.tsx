'use client'

import { BookCover } from './BookCover'

interface Book {
  id: string
  title: string
  sections: Array<{
    id: string
    title: string
  }>
}

interface HandbookLandingProps {
  books: Book[]
}

// Book cover images
const bookCovers: Record<string, string> = {
  'spirit-guide': '/books/SpiritGuide.png',
  'the-safety-bit': '/books/SafetyBit.png',
}

export function HandbookLanding({ books }: HandbookLandingProps) {
  return (
    <div className="w-full">
      {/* Books Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-center">Select a Book</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {books.map((book) => (
            <BookCover
              key={book.id}
              id={book.id}
              title={book.title}
              coverImage={bookCovers[book.id]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
