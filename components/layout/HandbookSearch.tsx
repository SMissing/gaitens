'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, BookOpen, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Book {
  id: string
  title: string
  sections: Array<{
    id: string
    title: string
    content: React.ReactNode
  }>
}

interface HandbookSearchProps {
  books: Book[]
}

interface SearchResult {
  bookId: string
  bookTitle: string
  sectionId: string
  sectionTitle: string
  matches: number // Number of matches in this section
}

export function HandbookSearch({ books }: HandbookSearchProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Extract text content from React nodes for searching
  const extractText = (node: React.ReactNode): string => {
    if (node === null || node === undefined) return ''
    if (typeof node === 'string') return node
    if (typeof node === 'number') return String(node)
    if (typeof node === 'boolean') return ''
    if (Array.isArray(node)) {
      return node.map(extractText).filter(Boolean).join(' ')
    }
    if (typeof node === 'object') {
      // Handle React elements
      if ('props' in node && node.props) {
        const props = node.props as { children?: React.ReactNode }
        if (props.children) {
          return extractText(props.children)
        }
      }
      // Handle other object types
      if ('toString' in node) {
        return String(node)
      }
    }
    return ''
  }

  // Search through all books and sections
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []

    const query = searchQuery.toLowerCase().trim()
    const results: SearchResult[] = []

    books.forEach((book) => {
      book.sections.forEach((section) => {
        // Search in title
        const titleMatches = (section.title.toLowerCase().match(new RegExp(query, 'g')) || []).length
        
        // Search in content
        const contentText = extractText(section.content).toLowerCase()
        const contentMatches = (contentText.match(new RegExp(query, 'g')) || []).length
        
        const totalMatches = titleMatches + contentMatches

        if (totalMatches > 0) {
          results.push({
            bookId: book.id,
            bookTitle: book.title,
            sectionId: section.id,
            sectionTitle: section.title,
            matches: totalMatches,
          })
        }
      })
    })

    // Sort by number of matches (descending), then by book and section order
    return results.sort((a, b) => {
      if (b.matches !== a.matches) return b.matches - a.matches
      // If matches are equal, maintain original order
      return 0
    })
  }, [searchQuery, books])

  const handleResultClick = (bookId: string, sectionId: string) => {
    // Pass the search query as a highlight parameter
    const params = new URLSearchParams({
      book: bookId,
      section: sectionId,
    })
    if (searchQuery.trim()) {
      params.set('highlight', searchQuery.trim())
    }
    router.push(`/handbook?${params.toString()}`)
    setSearchQuery('')
    setIsFocused(false)
  }

  const handleClear = () => {
    setSearchQuery('')
    setIsFocused(false)
  }

  return (
    <div className="relative w-full mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search handbook (e.g., Tailscale, cocktails, safety)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click events on results
            setTimeout(() => setIsFocused(false), 200)
          }}
          className={cn(
            "pl-10 pr-10 h-12 text-base",
            "focus-visible:ring-spirits-cyan focus-visible:border-spirits-cyan",
            isFocused && searchQuery && "rounded-b-none"
          )}
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-[oklch(0.12_0_0)] border border-border rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
              </div>
              {searchResults.map((result, index) => (
                <button
                  key={`${result.bookId}-${result.sectionId}-${index}`}
                  onClick={() => handleResultClick(result.bookId, result.sectionId)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    "hover:bg-[oklch(0.14_0_0)] hover:border-spirits-cyan/30",
                    "border border-transparent",
                    "flex items-start gap-3"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-spirits-cyan" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {result.bookTitle}
                      </span>
                    </div>
                    <div className="font-medium text-foreground">
                      {result.sectionTitle}
                    </div>
                    {result.matches > 1 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.matches} matches
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No results found for &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
