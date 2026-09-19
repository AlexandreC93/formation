import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protéger les routes /modules (stagiaires)
  if (pathname.startsWith('/modules')) {
    const sessionCode = request.cookies.get('session_code')?.value;
    if (!sessionCode) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protéger les routes /admin (sauf /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/modules/:path*',
    '/admin/:path*',
  ],
};
