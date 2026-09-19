import type { NextRequest } from 'next/server';
import { refreshSupabaseSession } from './lib/supabase/proxy';

export function proxy(request: NextRequest) {
  return refreshSupabaseSession(request);
}

// These are the real account routes. Explore remains deliberately local and
// does not need a Supabase refresh boundary.
export const config = {
  matcher: [
    '/self/:path*',
    '/workspace/:path*',
    '/community/:path*',
    '/library/:path*',
    '/profile/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/sanctuary/:path*',
  ],
};
