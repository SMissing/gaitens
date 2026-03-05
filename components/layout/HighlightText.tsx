'use client'

import { useEffect, useRef, useMemo } from 'react'
import Highlighter from 'react-highlight-words'

interface HighlightTextProps {
  text: string
  searchWords: string[]
  className?: string
}

export function HighlightText({ text, searchWords, className }: HighlightTextProps) {
  const highlightRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (searchWords.length > 0 && highlightRef.current) {
      // Find the first highlighted element and scroll to it
      const firstHighlight = highlightRef.current.querySelector('mark')
      if (firstHighlight) {
        // Small delay to ensure page is rendered
        setTimeout(() => {
          firstHighlight.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          // Add a flash effect
          firstHighlight.classList.add('highlight-flash')
          setTimeout(() => {
            firstHighlight.classList.remove('highlight-flash')
          }, 2000)
        }, 300)
      }
    }
  }, [searchWords])

  if (searchWords.length === 0) {
    return <span className={className}>{text}</span>
  }

  return (
    <span ref={highlightRef} className={className}>
      <Highlighter
        highlightClassName="bg-spirits-cyan/30 text-foreground rounded px-0.5 font-semibold highlight-match"
        searchWords={searchWords}
        autoEscape={true}
        textToHighlight={text}
      />
    </span>
  )
}
