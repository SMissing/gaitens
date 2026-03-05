/**
 * Color system utilities for venue-specific theming
 * 
 * Venues:
 * - Spirits Bar and Games: Cyan, Magenta, Yellow
 * - The Garrison: Burnt Orange, Black, White
 * - Bassment: Bright Pink, Bright Green
 */

export type Venue = 'spirits' | 'garrison' | 'bassment' | null

/**
 * Get primary accent color for a venue
 */
export function getVenuePrimaryColor(venue: Venue): string {
  switch (venue) {
    case 'spirits':
      return 'spirits-cyan'
    case 'garrison':
      return 'garrison-orange'
    case 'bassment':
      return 'bassment-pink'
    default:
      return 'spirits-cyan' // Default to Spirits colors
  }
}

/**
 * Get secondary accent color for a venue
 */
export function getVenueSecondaryColor(venue: Venue): string {
  switch (venue) {
    case 'spirits':
      return 'spirits-magenta'
    case 'garrison':
      return 'garrison-black'
    case 'bassment':
      return 'bassment-green'
    default:
      return 'spirits-magenta'
  }
}

/**
 * Get tertiary accent color for a venue
 */
export function getVenueTertiaryColor(venue: Venue): string {
  switch (venue) {
    case 'spirits':
      return 'spirits-yellow'
    case 'garrison':
      return 'garrison-white'
    case 'bassment':
      return 'bassment-pink'
    default:
      return 'spirits-yellow'
  }
}

/**
 * Get venue name from site string
 */
export function getVenueFromSite(site: string | null): Venue {
  if (!site) return null
  
  const siteLower = site.toLowerCase()
  if (siteLower.includes('spirits') || siteLower.includes('bar') || siteLower.includes('games')) {
    return 'spirits'
  }
  if (siteLower.includes('garrison')) {
    return 'garrison'
  }
  if (siteLower.includes('bassment') || siteLower.includes('basement')) {
    return 'bassment'
  }
  
  return null
}

/**
 * Get Tailwind classes for a primary button based on venue
 */
export function getVenueButtonClasses(venue: Venue): string {
  const primary = getVenuePrimaryColor(venue)
  const primaryDark = primary.replace('-', '-').replace('cyan', 'cyanDark').replace('orange', 'orangeDark').replace('pink', 'pinkDark')
  
  return `bg-${primary} text-dark-bg hover:bg-${primaryDark}`
}
