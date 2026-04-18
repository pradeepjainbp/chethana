import { auth } from '@/lib/server-auth';

export default auth.middleware({ loginUrl: '/auth' });

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth|api/auth|disclaimer).*)'],
};
