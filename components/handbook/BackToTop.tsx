'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-24 right-4 z-40 bg-primary text-primary-foreground rounded-full p-3 shadow-lg",
        "transition-all duration-300"
      )}
      style={{ bottom: 'calc(max(16px, env(safe-area-inset-bottom, 16px) + 16px) + 5rem)' }}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
