'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Menu, BookOpen, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Book {
  id: string
  title: string
  sections: Array<{
    id: string
    title: string
  }>
}

interface HandbookNavProps {
  books: Book[]
  currentBookId: string
  currentSectionId?: string
}

// Book interface for header
interface BookForHeader {
  id: string
  title: string
  sections: Array<{ id: string; title: string }>
}

export function HandbookNav({ books, currentBookId, currentSectionId }: HandbookNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const drawerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentBook = books.find(b => b.id === currentBookId) || books[0]

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const toggleDrawer = () => {
    setIsOpen(prev => !prev)
  }

  const handleBookSelect = (bookId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('book', bookId)
    params.delete('section')
    router.push(`/handbook?${params.toString()}`)
    setIsOpen(false)
  }

  const handleSectionSelect = (sectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('book', currentBookId)
    params.set('section', sectionId)
    router.push(`/handbook?${params.toString()}`)
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredSections = currentBook.sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Menu Button - Positioned in top bar */}
      <button
        ref={buttonRef}
        onClick={toggleDrawer}
        className={cn(
          "rounded-lg p-2 transition-colors",
          isOpen ? "bg-primary/80 text-primary-foreground" : "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Close handbook menu" : "Open handbook menu"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar/Drawer - Positioned below top bar, fully opaque */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-[73px] right-0 h-[calc(100vh-73px)] w-full max-w-sm bg-[#1e1e1e] border-l border-border z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Handbook</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-accent rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Book Selector */}
        <div className="p-4 border-b border-border overflow-y-auto">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Books
          </h3>
          <div className="space-y-1">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => handleBookSelect(book.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-colors",
                  currentBookId === book.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent text-foreground"
                )}
              >
                {book.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            {currentBook.title}
          </h3>
          <div className="space-y-1">
            {filteredSections.length > 0 ? (
              filteredSections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionSelect(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between",
                    currentSectionId === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </div>
                  {currentSectionId === section.id && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No sections found
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
