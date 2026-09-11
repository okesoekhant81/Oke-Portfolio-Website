import { NextResponse } from 'next/server'
import { SESSION_COOKIE, isValidSessionToken } from './lib/auth'

export default async function proxy(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!(await isValidSessionToken(token))) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
