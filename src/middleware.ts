import { auth } from '@/lib/server-auth';
import { NextRequest, NextResponse } from 'next/server';

const authMiddlewareFn = auth.middleware({ loginUrl: '/auth' });

export default async function middleware(request: NextRequest) {
  // Run auth middleware on every matched route so it can inject session data
  // into forwarded request headers — this is what makes auth.getSession() work
  // in server components and API routes without a raw network call.
  const response = await Promise.resolve(authMiddlewareFn(request));

  // For API routes: never redirect to the login page. API routes guard themselves
  // via auth.getSession() and return 401 JSON. A redirect here would cause the
  // client fetch() to silently follow it, receive the HTML login page as 200 OK,
  // and treat it as a successful response.
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    response.status >= 300 && response.status < 400
  ) {
    return NextResponse.next();
  }

  return response;
}

export const config = {
  // Exclude static assets, the auth pages/routes, and disclaimer.
  // /api/* is intentionally NOT excluded — the middleware must run on API routes
  // to inject session headers, but it will never redirect them (see above).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth|api/auth|disclaimer).*)'],
};
