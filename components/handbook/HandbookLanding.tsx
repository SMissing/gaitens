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

const bookTileStyles: Record<string, { card: string; icon: string }> = {
  'spirit-guide': {
    card: 'bg-spirits-cyan/10 hover:bg-spirits-cyan/18',
    icon: 'text-spirits-cyan',
  },
  'the-safety-bit': {
    card: 'bg-spirits-yellow/10 hover:bg-spirits-yellow/18',
    icon: 'text-spirits-yellow',
  },
}

const fallbackTileStyles = [
  {
    card: 'bg-spirits-magenta/10 hover:bg-spirits-magenta/18',
    icon: 'text-spirits-magenta',
  },
  {
    card: 'bg-primary/10 hover:bg-primary/18',
    icon: 'text-primary',
  },
] as const

export function HandbookLanding({ books }: HandbookLandingProps) {
  return (
    <div className="w-full">
      <div>
        <h2 className="mb-6 text-center text-xl font-semibold">Select a Book</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
          {books.map((book, index) => {
            const styles = bookTileStyles[book.id] ?? fallbackTileStyles[index % fallbackTileStyles.length]
            return (
              <BookCover
                key={book.id}
                id={book.id}
                title={book.title}
                cardClassName={styles.card}
                iconClassName={styles.icon}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
