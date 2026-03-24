'use client'

import { useState, type ReactNode } from 'react'
import { HandbookSearch } from '@/components/layout/HandbookSearch'
import { HandbookLanding } from '@/components/handbook/HandbookLanding'

export type HandbookSearchAreaBook = {
  id: string
  title: string
  sections: Array<{
    id: string
    title: string
    content: ReactNode
  }>
}

export function HandbookLandingWithSearchOverlay({ books }: { books: HandbookSearchAreaBook[] }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={searchOpen ? 'max-w-2xl mx-auto' : 'max-w-2xl mx-auto mb-12'}>
        <HandbookSearch books={books} onSearchExpandedChange={setSearchOpen} />
      </div>
      {!searchOpen && <HandbookLanding books={books} />}
    </div>
  )
}

export function HandbookBookViewWithSearchOverlay({
  books,
  children,
}: {
  books: HandbookSearchAreaBook[]
  children: ReactNode
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="w-full relative">
      <div className="fixed inset-0 bg-[#1e1e1e] -z-10" />
      <div
        className={
          searchOpen
            ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10'
            : 'mb-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10'
        }
      >
        <HandbookSearch books={books} onSearchExpandedChange={setSearchOpen} />
      </div>
      {!searchOpen && children}
    </div>
  )
}
