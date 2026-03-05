'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import Highlighter from 'react-highlight-words'

interface HighlightContentProps {
  children: React.ReactNode
  searchWords: string[]
}

// Recursively process React nodes to find and highlight text
function processNode(
  node: React.ReactNode,
  searchWords: string[],
  key: string = ''
): React.ReactNode {
  if (!node) return null

  // If it's a string, highlight it
  if (typeof node === 'string') {
    if (searchWords.length === 0 || !node.trim()) return node
    return (
      <Highlighter
        key={key}
        highlightClassName="bg-[oklch(0.6_0.15_240)] text-foreground rounded px-0.5 font-semibold highlight-match"
        searchWords={searchWords}
        autoEscape={true}
        textToHighlight={node}
      />
    )
  }

  // If it's a number, convert to string and highlight
  if (typeof node === 'number') {
    const str = String(node)
    if (searchWords.length === 0) return str
    return (
      <Highlighter
        key={key}
        highlightClassName="bg-[oklch(0.6_0.15_240)] text-foreground rounded px-0.5 font-semibold highlight-match"
        searchWords={searchWords}
        autoEscape={true}
        textToHighlight={str}
      />
    )
  }

  // If it's an array, process each element
  if (Array.isArray(node)) {
    return node.map((child, index) =>
      processNode(child, searchWords, `${key}-${index}`)
    )
  }

  // If it's a React element, process its children
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode; className?: string }
    const elementType = node.type as any
    
    // Preserve the original element type and props
    if (props.children) {
      const processedChildren = processNode(props.children, searchWords, key)
      return React.createElement(
        elementType,
        { ...props, key },
        processedChildren
      )
    }
    return React.createElement(elementType, { ...props, key })
  }

  return node
}

export function HighlightContent({ children, searchWords }: HighlightContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchWords.length > 0 && containerRef.current) {
      // Find the first highlighted element and scroll to it
      const firstHighlight = containerRef.current.querySelector('mark')
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

  const highlightedContent = useMemo(() => {
    if (searchWords.length === 0) return children
    return processNode(children, searchWords)
  }, [children, searchWords])

  return (
    <div ref={containerRef} className="highlight-container">
      {highlightedContent}
    </div>
  )
}
