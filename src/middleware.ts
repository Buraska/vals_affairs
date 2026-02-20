import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, isValidLocale } from '@/app/lib/localization/i18n'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)

  // First segment is locale?
  const maybeLocale = segments[0]
  if (isValidLocale(maybeLocale)) {
    return NextResponse.next()
  }

  // No locale: redirect to default locale with same path
  const newPath = `/${defaultLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(new URL(newPath, request.url))
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|admin|admin/.*).*)',
  ],
}
