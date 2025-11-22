// middleware.ts  ← put this file in the ROOT of your project
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Do nothing – let all routes (including /api) pass through untouched
  return NextResponse.next();
}

// THIS LINE IS CRITICAL – it stops middleware from running on API routes
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
