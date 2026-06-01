/**
 * Format a "YYYY-MM" voting month string into a human-readable month name.
 * e.g. "2025-05" → "May 2025"
 */
export function formatVotingMonth(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1)
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

/**
 * Format date consistently across server and client
 * Returns date in DD/MM/YYYY format
 */
export function formatDate(date: string | Date): string {
  const d =
    typeof date === 'string'
      ? /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? parseYyyyMmDdLocal(date)
        : new Date(date)
      : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Get the current voting month period (1st to 1st)
 * Returns the month string in YYYY-MM format for the current voting period
 * Voting period runs from the 1st of the month to the 1st of the next month
 */
export function getCurrentVotingMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Check if we're in a valid voting period (after the 1st of the month)
 */
export function isVotingPeriodActive(): boolean {
  const now = new Date()
  return now.getDate() >= 1
}

/**
 * Parse a `YYYY-MM-DD` string into a Date in *local* time.
 *
 * Important: `new Date('YYYY-MM-DD')` is interpreted as UTC by JS, which can
 * cause off-by-one-day issues for users in non-UTC timezones.
 */
export function parseYyyyMmDdLocal(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) {
    // Fallback: preserve previous behavior rather than silently producing wrong dates.
    return new Date(dateStr)
  }
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  return new Date(year, month, day)
}

/**
 * Format a Date into `YYYY-MM-DD` using *local* timezone fields.
 */
export function toYyyyMmDdLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Short relative time for compact UI (e.g. notice rows).
 */
export function formatRelativeShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  if (diffMs < 0) return formatDate(d)
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(d)
}
