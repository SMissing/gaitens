'use client'

import { useState, useEffect } from 'react'

interface EotmReasonRotatorProps {
  reasons: string[]
}

export function EotmReasonRotator({ reasons }: EotmReasonRotatorProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reasons.length === 0) return
    setVisible(true)

    if (reasons.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => {
          let next = Math.floor(Math.random() * reasons.length)
          while (next === prev) next = Math.floor(Math.random() * reasons.length)
          return next
        })
        setVisible(true)
      }, 400)
    }, 20000)
    return () => clearInterval(timer)
  }, [reasons.length])

  if (reasons.length === 0) return null

  return (
    <p
      className="text-xs text-muted-foreground text-center italic transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      &ldquo;{reasons[index]}&rdquo;
    </p>
  )
}
