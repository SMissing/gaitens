'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// Pages that have a context dock (2nd dock state) in addition to the main nav
const CONTEXT_DOCK_PATHS = [
  '/holidays',
  '/ideas',
  '/app-feedback',
  '/manager/staff',
  '/manager/barred',
  '/manager/meetings',
  '/manager/management-calendar',
  '/manager/achievements',
  '/manager/staff-training',
  '/manager/training',
  '/manager/notices/post',
  '/notices/edit/',
]

const SHIMMER_KEY = 'dock_swipe_hint_shown'

export function DockPageDots() {
  const pathname = usePathname()
  const hasContext = CONTEXT_DOCK_PATHS.some((p) => pathname.startsWith(p))
  const [shimmer, setShimmer] = useState(false)

  useEffect(() => {
    if (!hasContext) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem(SHIMMER_KEY)) return
    // Show shimmer hint on first encounter of a context-dock page
    setShimmer(true)
    localStorage.setItem(SHIMMER_KEY, '1')
    const t = setTimeout(() => setShimmer(false), 2000)
    return () => clearTimeout(t)
  }, [hasContext])

  if (!hasContext) return null

  return (
    <div className="flex items-center justify-center gap-1.5 pb-0.5">
      {/* Main nav dot */}
      <div className="h-1 w-1 rounded-full bg-white/30" />
      {/* Context dock dot */}
      <motion.div
        className={`h-1 rounded-full bg-white/30 ${shimmer ? 'bg-white/70' : ''}`}
        animate={shimmer ? { width: [4, 16, 4], opacity: [0.3, 0.9, 0.3] } : { width: 4, opacity: 0.3 }}
        transition={shimmer ? { duration: 1.5, ease: 'easeInOut' } : {}}
        style={{ width: 4 }}
      />
    </div>
  )
}
