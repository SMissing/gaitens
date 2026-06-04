export const ACHIEVEMENT_TIERS = [
  { label: 'Newbie',  threshold: 0 },
  { label: 'Novice',  threshold: 25 },
  { label: 'Trooper', threshold: 50 },
  { label: 'Expert',  threshold: 75 },
  { label: 'Legend',  threshold: 100 },
] as const

export function getAchievementTier(percentage: number): string {
  if (percentage >= 100) return 'Legend'
  if (percentage >= 75) return 'Expert'
  if (percentage >= 50) return 'Trooper'
  if (percentage >= 25) return 'Novice'
  return 'Newbie'
}

export function getNextTierInfo(
  percentage: number,
  completedCount: number,
  totalCount: number,
): { nextLabel: string; badgesNeeded: number } | null {
  if (percentage >= 100 || totalCount === 0) return null
  const next = ACHIEVEMENT_TIERS.find((t) => t.threshold > percentage)
  if (!next) return null
  const badgesAtNext = Math.ceil((next.threshold / 100) * totalCount)
  return { nextLabel: next.label, badgesNeeded: Math.max(badgesAtNext - completedCount, 1) }
}

export const RARITY_ORDER = ['Legendary', 'Epic', 'Rare', 'Common'] as const
export type RarityTier = typeof RARITY_ORDER[number]

export function rarityTextColor(rarity: string | null | undefined): string {
  switch (rarity) {
    case 'Legendary': return 'text-yellow-400'
    case 'Epic':      return 'text-purple-400'
    case 'Rare':      return 'text-blue-400'
    case 'Common':    return 'text-gray-400'
    default:          return 'text-muted-foreground'
  }
}

export function rarityGlowColor(rarity: string | null | undefined): string {
  switch (rarity) {
    case 'Legendary': return 'shadow-yellow-500/30'
    case 'Epic':      return 'shadow-purple-500/30'
    case 'Rare':      return 'shadow-blue-500/20'
    default:          return ''
  }
}

export function rarityBorderColor(rarity: string | null | undefined): string {
  switch (rarity) {
    case 'Legendary': return 'border-yellow-500/40'
    case 'Epic':      return 'border-purple-500/35'
    case 'Rare':      return 'border-blue-500/30'
    default:          return 'border-white/10'
  }
}

export function rarityCardBg(rarity: string | null | undefined): string {
  switch (rarity) {
    case 'Legendary': return 'bg-gradient-to-br from-yellow-500/8 to-orange-500/5'
    case 'Epic':      return 'bg-gradient-to-br from-purple-500/10 to-pink-500/6'
    case 'Rare':      return 'bg-gradient-to-br from-blue-500/8 to-blue-600/5'
    default:          return 'bg-white/[0.03]'
  }
}
