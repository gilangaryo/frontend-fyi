import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value
    const { pathname } = req.nextUrl

    const isDashboardPath = pathname.startsWith('/dashboard')
    const isLoginPath = pathname === '/login'

    if (isDashboardPath && !token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isLoginPath && token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
}
