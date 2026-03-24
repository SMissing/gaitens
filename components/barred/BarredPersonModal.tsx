/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { BarredPerson, BarDurationUnit } from '@/types/database'
import { formatDate } from '@/lib/date-utils'

function unitLabel(unit: BarDurationUnit): string {
  switch (unit) {
    case 'days':
      return 'day'
    case 'weeks':
      return 'week'
    case 'months':
      return 'month'
    case 'years':
      return 'year'
    case 'life':
      return 'life'
    default:
      return unit
  }
}

function ceilDiv(a: number, b: number) {
  return Math.ceil(a / b)
}

function getRemainingText(person: BarredPerson): { text: string; ended: boolean } {
  if (person.barDurationUnit === 'life') {
    return { text: 'Permanent life bar', ended: false }
  }

  const end = new Date(person.barEndDate)
  const diffMs = end.getTime() - Date.now()
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return { text: 'Bar ended', ended: true }
  }

  const unit = person.barDurationUnit
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  switch (unit) {
    case 'days': {
      const daysLeft = ceilDiv(diffDays, 1)
      return { text: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`, ended: false }
    }
    case 'weeks': {
      const weeksLeft = ceilDiv(diffDays, 7)
      return { text: `${weeksLeft} ${weeksLeft === 1 ? 'week' : 'weeks'} left`, ended: false }
    }
    case 'months': {
      const monthsLeft = ceilDiv(diffDays, 30)
      return { text: `${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'} left`, ended: false }
    }
    case 'years': {
      const yearsLeft = ceilDiv(diffDays, 365)
      return { text: `${yearsLeft} ${yearsLeft === 1 ? 'year' : 'years'} left`, ended: false }
    }
    default:
      return { text: 'Remaining time unknown', ended: false }
  }
}

interface BarredPersonModalProps {
  person: BarredPerson
  onClose: () => void
}

export function BarredPersonModal({ person, onClose }: BarredPersonModalProps) {
  const remaining = useMemo(() => getRemainingText(person), [person])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 flex items-center justify-center"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()} // Best-effort: block right-click/copy
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      role="dialog"
      aria-modal="true"
      aria-label="Barred person details"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {person.name || 'Unnamed'}
            </h2>
            <div className="mt-1 text-sm text-muted-foreground">
              {remaining.text}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Photo */}
          <div className="relative w-full bg-muted rounded-xl overflow-hidden border border-border/30">
            {person.imageUrl ? (
              <Image
                src={person.imageUrl}
                alt={person.name || 'Barred person photo'}
                width={1200}
                height={1200}
                className="w-full h-[320px] sm:h-[420px] object-contain select-none pointer-events-none"
                unoptimized
                draggable={false}
              />
            ) : (
              <div className="h-[320px] sm:h-[420px] flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Reason
              </div>
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {person.reason}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Bar Length
              </div>
              <div className="text-foreground">
                {person.barDurationUnit === 'life' ? (
                  'Life (permanent)'
                ) : (
                  <>
                    {person.barDurationValue} {unitLabel(person.barDurationUnit)}
                    {person.barDurationValue === 1 ? '' : 's'}
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {person.barDurationUnit === 'life'
                  ? 'No end date'
                  : `Ends: ${formatDate(person.barEndDate)}`}
              </div>
            </div>
          </div>

          {person.createdAt && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border/30">
              Posted: {formatDate(person.createdAt)}
            </div>
          )}
        </div>

        {/* Small note (non-blocking) */}
        {!remaining.ended && (
          <div className="px-4 sm:px-6 pb-5 text-xs text-muted-foreground">
            {/*
              Real screenshot prevention isn't reliably possible in web apps.
              This is a best-effort UX guard (disable right-click + selection).
            */}
            Screenshot protection is best-effort.
          </div>
        )}
      </div>
    </div>
  )
}

