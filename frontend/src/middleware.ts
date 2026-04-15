import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/transactions') || pathname.startsWith('/admin');
  const isRootPath = pathname === '/';

  if (isRootPath) {
    return NextResponse.next();
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Don't redirect from auth pages - let users see them
  //if (isAuthPage && token) {
  //  return NextResponse.redirect(new URL('/dashboard', request.url));
  //}
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
