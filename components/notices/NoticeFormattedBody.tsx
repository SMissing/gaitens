'use client'

import { cn } from '@/lib/utils'

interface NoticeFormattedBodyProps {
  content: string
  className?: string
  /** Larger lead paragraph on first block */
  lead?: boolean
}

/**
 * Splits notice body on blank lines so content reads as sections, not one slab of text.
 */
export function NoticeFormattedBody({ content, className, lead = false }: NoticeFormattedBodyProps) {
  const trimmed = content?.trim() ?? ''
  if (!trimmed) return null

  const parts = trimmed.split(/\n\s*\n/).filter(Boolean)

  return (
    <div className={cn('space-y-4', className)}>
      {parts.map((part, i) => (
        <p
          key={i}
          className={cn(
            'whitespace-pre-line leading-relaxed',
            lead && i === 0 && 'text-lg font-medium tracking-tight text-foreground sm:text-xl'
          )}
        >
          {part}
        </p>
      ))}
    </div>
  )
}
