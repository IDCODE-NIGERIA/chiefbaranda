import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Optimistic route guard. (Next 16 renamed Middleware to Proxy.)
 *
 * This only checks that an auth cookie is present — it deliberately does not
 * verify the JWT, because Proxy runs on every matched request and should stay
 * cheap. Real authorisation happens in the route handlers and pages via
 * `getSessionUser` / `getAdminUser`; this just keeps signed-out visitors from
 * landing on an empty dashboard.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get('auth')?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const signIn = new URL('/signin', request.url);
  signIn.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);

  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*', '/profile/:path*', '/my-listings/:path*'],
};
