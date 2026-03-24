'use client'

import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookCoverProps {
  id: string
  title: string
  cardClassName: string
  iconClassName: string
}

export function BookCover({ id, title, cardClassName, iconClassName }: BookCoverProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/handbook?book=${id}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group flex w-full flex-col items-center gap-3 rounded-xl p-5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        cardClassName
      )}
    >
      <BookOpen
        className={cn('h-12 w-12 shrink-0 transition-transform group-hover:scale-105', iconClassName)}
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="text-center text-sm font-semibold leading-snug text-foreground">{title}</span>
    </button>
  )
}
