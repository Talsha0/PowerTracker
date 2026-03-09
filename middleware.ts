import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase stores the session as a cookie named sb-<project-ref>-auth-token.
  // We only need to know a token is present here — the actual JWT verification
  // and session refresh happens in each page via the Supabase browser client.
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.includes('-auth-token')
  )

  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register')

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/workout') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/social') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/calendar')

  if (!hasSession && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (hasSession && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
