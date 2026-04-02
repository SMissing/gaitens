'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  achievementsViewToggleThumbClass,
  achievementsViewToggleTrackClass,
} from '@/lib/achievement-rarity-styles'

export type AchievementsViewMode = 'grid' | 'list'

interface AchievementsViewToggleProps {
  mode: AchievementsViewMode
  onChange: (mode: AchievementsViewMode) => void
  /** Hide when there are no achievements */
  disabled?: boolean
}

/**
 * Segmented control — same spirits/cyan–magenta badge language as default {@link AchievementBadge} chrome.
 */
export function AchievementsViewToggle({ mode, onChange, disabled }: AchievementsViewToggleProps) {
  if (disabled) return null

  return (
    <div
      className="relative flex h-[38px] w-[84px] shrink-0 items-stretch rounded-full"
      role="group"
      aria-label="Achievement layout"
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          achievementsViewToggleTrackClass(),
        )}
        aria-hidden
      />

      <span
        className={cn(
          'pointer-events-none absolute inset-y-0.5 w-[calc(50%-3px)] transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          achievementsViewToggleThumbClass(),
          mode === 'grid' ? 'left-0.5' : 'left-[calc(50%+1.5px)]',
        )}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'relative z-10 flex flex-1 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-spirits-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          mode === 'grid' ? 'text-white' : 'text-muted-foreground/75 sm:hover:text-foreground/90',
        )}
        aria-pressed={mode === 'grid'}
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={mode === 'grid' ? 2.25 : 1.75} />
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={cn(
          'relative z-10 flex flex-1 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-spirits-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          mode === 'list' ? 'text-white' : 'text-muted-foreground/75 sm:hover:text-foreground/90',
        )}
        aria-pressed={mode === 'list'}
        aria-label="List view"
        title="List view"
      >
        <List className="h-[18px] w-[18px]" strokeWidth={mode === 'list' ? 2.25 : 1.75} />
      </button>
    </div>
  )
}
