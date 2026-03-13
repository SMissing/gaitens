'use client'

import { usePathname } from 'next/navigation'

export function DockWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show dock on social page
  if (pathname === '/social') {
    return null
  }
  
  return <>{children}</>
}
