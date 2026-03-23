/**
 * Client-only: redirect to login with return path when the API returns 401.
 */
export function redirectToLoginWithFrom(): void {
  if (typeof window === 'undefined') return
  const from = window.location.pathname + window.location.search
  const url = new URL('/login', window.location.origin)
  url.searchParams.set('from', from)
  window.location.assign(url.toString())
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)
  if (response.status === 401 && typeof window !== 'undefined') {
    redirectToLoginWithFrom()
  }
  return response
}
