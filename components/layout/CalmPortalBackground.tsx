'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CLASS = 'calm-portal-background'
const TRAINING_BG = 'training-hub-bg'

/**
 * Applies the calmer Ideas-style body backdrop on all routes except dashboard, login, and training.
 * On /training it applies its own background class so no other backdrop bleeds through the edges.
 */
export function CalmPortalBackground() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname == null) return

    const isTraining = pathname === '/training' || pathname.startsWith('/training/')

    const useDefaultBackdrop =
      pathname === '/dashboard' ||
      pathname === '/login' ||
      pathname.startsWith('/login/') ||
      isTraining

    if (useDefaultBackdrop) {
      document.body.classList.remove(CLASS)
    } else {
      document.body.classList.add(CLASS)
    }

    // Paint body background to match the training world — eliminates edge bleed
    if (isTraining) {
      document.body.classList.add(TRAINING_BG)
    } else {
      document.body.classList.remove(TRAINING_BG)
    }

    return () => {
      document.body.classList.remove(CLASS)
      document.body.classList.remove(TRAINING_BG)
    }
  }, [pathname])

  return null
}
