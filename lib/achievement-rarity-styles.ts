import { cn } from '@/lib/utils'

export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export function normalizeAchievementRarity(raw: string | null | undefined): AchievementRarity {
  if (raw && ['Common', 'Rare', 'Epic', 'Legendary'].includes(raw)) {
    return raw as AchievementRarity
  }
  return 'Common'
}

/**
 * Unlocked, not-completed badge face — matches {@link AchievementBadge} incomplete gradients.
 */
export function rarityBadgeFaceIncomplete(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'Common':
      return 'border-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-500/20'
    case 'Rare':
      return 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-lg shadow-blue-500/50'
    case 'Epic':
      return 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-xl shadow-purple-500/50'
    case 'Legendary':
      return 'border-yellow-500 bg-gradient-to-br from-yellow-400/30 via-orange-500/20 to-red-500/20 shadow-2xl shadow-yellow-500/60'
    default:
      return 'border-spirits-cyan bg-gradient-to-br from-spirits-cyan/20 to-spirits-magenta/20'
  }
}

/**
 * Completed check bubble fill — matches {@link AchievementBadge} completion check backgrounds.
 */
export function rarityCompletionCheckBg(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'Common':
      return 'bg-gray-400'
    case 'Rare':
      return 'bg-blue-500'
    case 'Epic':
      return 'bg-purple-500'
    case 'Legendary':
      return 'bg-yellow-500'
    default:
      return 'bg-spirits-yellow'
  }
}

/** Segmented control track + thumb — brand badge language (spirits), not zinc chrome */
export function achievementsViewToggleTrackClass(): string {
  return cn(
    'rounded-full border-2 border-spirits-cyan/45',
    'bg-gradient-to-br from-spirits-cyan/18 to-spirits-magenta/18',
    'shadow-lg shadow-spirits-cyan/25',
  )
}

export function achievementsViewToggleThumbClass(): string {
  return cn(
    'rounded-full border border-spirits-cyan/35',
    'bg-gradient-to-br from-spirits-cyan/50 to-spirits-magenta/45',
    'shadow-lg shadow-spirits-cyan/45',
  )
}
