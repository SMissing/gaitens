import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/lib/session-constants'

// Maintenance accounts are bare-bones: everything lives under /dashboard.
const MAINTENANCE_ALLOWED_PREFIXES = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  if (!request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    const loginUrl = new URL('/login', request.url)
    const from = pathname + search
    if (from && from !== '/login') {
      loginUrl.searchParams.set('from', from)
    }
    return NextResponse.redirect(loginUrl)
  }

  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value
  if (
    role === 'maintenance' &&
    !MAINTENANCE_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json|sw\\.js|icons/|logos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
