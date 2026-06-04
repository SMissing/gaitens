'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

const CONTEXT_LABELS: { match: (p: string) => boolean; label: string }[] = [
  { match: (p) => p.startsWith('/holidays'),                           label: 'Holiday Tools' },
  { match: (p) => p.startsWith('/ideas'),                              label: 'Ideas' },
  { match: (p) => p.startsWith('/app-feedback'),                       label: 'App Feedback' },
  { match: (p) => p.startsWith('/manager/staff') && !p.startsWith('/manager/staff-training'), label: 'Staff Management' },
  { match: (p) => p.startsWith('/manager/barred'),                     label: 'Barred List' },
  { match: (p) => p.startsWith('/manager/meetings'),                   label: 'Meetings' },
  { match: (p) => p.startsWith('/manager/management-calendar'),        label: 'Management Calendar' },
  { match: (p) => p.startsWith('/manager/achievements') || p.startsWith('/manager/staff-training'), label: 'Staff Overview' },
  { match: (p) => p.startsWith('/manager/training'),                   label: 'Module Maker' },
  { match: (p) => p === '/manager/notices/post' || p.startsWith('/notices/edit/'), label: 'Post Notice' },
]

export function DockContextLabel() {
  const pathname = usePathname()

  const match = CONTEXT_LABELS.find((c) => c.match(pathname))

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          key={match.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 pointer-events-none"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap select-none">
            {match.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
