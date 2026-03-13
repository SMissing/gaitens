'use client'

import { useEffect } from 'react'

export function PreventScroll() {
  useEffect(() => {
    // Lock body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow
    const originalPosition = window.getComputedStyle(document.body).position
    const originalWidth = window.getComputedStyle(document.body).width
    const originalHeight = window.getComputedStyle(document.body).height
    const originalTop = window.getComputedStyle(document.body).top
    
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    document.body.style.top = '0'
    document.body.style.touchAction = 'none'
    document.body.style.overscrollBehavior = 'none'
    
    // Also lock html
    const html = document.documentElement
    const htmlOriginalOverflow = window.getComputedStyle(html).overflow
    html.style.overflow = 'hidden'
    html.style.touchAction = 'none'
    html.style.overscrollBehavior = 'none'
    
    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyle
      document.body.style.position = originalPosition
      document.body.style.width = originalWidth
      document.body.style.height = originalHeight
      document.body.style.top = originalTop
      document.body.style.touchAction = ''
      document.body.style.overscrollBehavior = ''
      
      html.style.overflow = htmlOriginalOverflow
      html.style.touchAction = ''
      html.style.overscrollBehavior = ''
    }
  }, [])

  return null
}
