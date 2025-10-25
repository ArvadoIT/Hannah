/**
 * Next.js Middleware
 * Protects admin routes and handles authentication
 * TEMPORARILY DISABLED FOR DEVELOPMENT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: Re-enable authentication middleware later
export function middleware(_req: NextRequest) {
  // Allow all requests during development
  return NextResponse.next();
}

// Disable matcher for now
export const config = {
  matcher: [],
};

// ORIGINAL CODE (COMMENTED OUT FOR DEVELOPMENT):
/*
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user is accessing admin/dashboard routes
    if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
      // Require authentication
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Check if user has admin or stylist role
      if (token.role !== 'admin' && token.role !== 'stylist') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes don't require authentication
        if (!path.startsWith('/dashboard') && !path.startsWith('/admin')) {
          return true;
        }

        // Protected routes require a valid token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/appointments/:path*',
    '/api/admin/:path*',
  ],
};
*/

