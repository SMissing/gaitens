'use client'

import { usePathname } from 'next/navigation'

export function DockWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Full-screen experiences without the dock
  if (pathname === '/social') {
    return null
  }
  if (pathname.startsWith('/games')) {
    return null
  }
  
  return <>{children}</>
}
