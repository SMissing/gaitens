import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/session-constants'

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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|manifest.json|sw\\.js|icons/|logos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
