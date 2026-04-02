'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function EventsSubnav() {
  const pathname = usePathname()

  const item = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-medium transition-colors touch-manipulation',
        pathname === href
          ? 'bg-spirits-magenta/20 text-spirits-magenta'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70',
      )}
    >
      {label}
    </Link>
  )

  return (
    <nav className="flex flex-wrap gap-2 mb-4" aria-label="Events">
      {item('/upcoming-events', 'Upcoming')}
      {item('/past-events', 'Past')}
    </nav>
  )
}
