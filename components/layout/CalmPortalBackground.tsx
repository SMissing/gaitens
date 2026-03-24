'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CLASS = 'calm-portal-background'

/**
 * Applies the calmer Ideas-style body backdrop on all routes except dashboard and login.
 */
export function CalmPortalBackground() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname == null) return

    const useDefaultBackdrop =
      pathname === '/dashboard' ||
      pathname === '/login' ||
      pathname.startsWith('/login/')

    if (useDefaultBackdrop) {
      document.body.classList.remove(CLASS)
    } else {
      document.body.classList.add(CLASS)
    }

    return () => {
      document.body.classList.remove(CLASS)
    }
  }, [pathname])

  return null
}
