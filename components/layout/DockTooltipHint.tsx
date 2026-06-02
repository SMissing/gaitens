'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export function DockTooltipHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const shown = localStorage.getItem('dock_hint_v1')
    if (!shown) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        localStorage.setItem('dock_hint_v1', '1')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
        >
          <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-xl px-3 py-2 shadow-xl text-xs text-muted-foreground whitespace-nowrap">
            Tap any icon to see its options
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
