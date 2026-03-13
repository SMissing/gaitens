/**
 * Format date consistently across server and client
 * Returns date in DD/MM/YYYY format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
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
