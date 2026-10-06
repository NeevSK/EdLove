import { type NextRequest, NextResponse } from 'next/server';
import { isSanctuaryPath, resolveHostRouting } from './lib/host-routing';
import { refreshSupabaseSession } from './lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  const hostRouting = resolveHostRouting(
    request.nextUrl.hostname,
    request.nextUrl.pathname,
    request.method,
  );

  if (hostRouting.kind === 'not-found') return new NextResponse(null, { status: 404 });
  if (hostRouting.kind === 'redirect') {
    const destination = request.nextUrl.clone();
    destination.protocol = 'https:';
    destination.hostname = hostRouting.host;
    destination.port = '';
    return NextResponse.redirect(destination, 307);
  }

  return isSanctuaryPath(request.nextUrl.pathname)
    ? refreshSupabaseSession(request)
    : NextResponse.next({ request });
}

// Host routing must see both route families. Static assets are excluded so their
// origin remains stable while routes move between the two canonical hosts.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|map|png|svg|webp)$).*)',
  ],
};
