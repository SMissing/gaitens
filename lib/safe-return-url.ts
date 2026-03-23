const MAX_LEN = 2048

/**
 * Returns a safe same-origin path for post-login redirect, or null if untrusted.
 */
export function getSafeInternalPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (trimmed.includes('://')) return null
  if (trimmed.length > MAX_LEN) return null
  return trimmed
}

/**
 * Target path after successful login (defaults to dashboard).
 */
export function getPostLoginPath(fromParam: string | null | undefined): string {
  const safe = getSafeInternalPath(fromParam)
  if (!safe || safe === '/') return '/dashboard'
  return safe
}
