'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Revalidates the server tree when the tab returns from sleep/BFCache so
 * requireAuth() runs again and expired sessions surface as login.
 */
export function SessionResumeRefresh() {
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedRefresh = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      router.refresh()
    }, 1000)
  }, [router])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') debouncedRefresh()
    }
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) router.refresh()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [debouncedRefresh, router])

  return null
}
