import { auth } from '@/lib/server-auth';

export default auth.middleware({ loginUrl: '/auth' });

export const config = {
  // Exclude static assets, the auth pages/API, disclaimer, AND all /api/* routes.
  // API routes must never be redirect-gated — they handle auth themselves and
  // return 401 JSON. If the middleware redirected them, the client fetch would
  // silently follow the redirect, get the HTML login page, and treat it as a
  // successful 200 response.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth|api|disclaimer).*)'],
};
