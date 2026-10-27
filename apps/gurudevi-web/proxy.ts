import { type NextRequest, NextResponse } from 'next/server';
import {
  classifyGurudeviHost,
  isLocalPreviewHost,
  isSanctuaryPath,
  resolveHostRouting,
} from './lib/host-routing';
import { refreshSupabaseSession } from './lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? request.nextUrl.hostname;
  const hostRouting = resolveHostRouting(hostname, request.nextUrl.pathname, request.method);

  if (hostRouting.kind === 'not-found') return new NextResponse(null, { status: 404 });
  if (hostRouting.kind === 'redirect') {
    if (classifyGurudeviHost(hostname) === 'other' || isLocalPreviewHost(hostname)) {
      if (hostRouting.pathname) {
        const localDest = request.nextUrl.clone();
        localDest.pathname = hostRouting.pathname;
        return NextResponse.redirect(localDest, 307);
      }
      return NextResponse.next();
    }
    const destination = request.nextUrl.clone();
    destination.protocol = 'https:';
    destination.hostname = hostRouting.host;
    destination.port = '';
    if (hostRouting.pathname) {
      destination.pathname = hostRouting.pathname;
    }
    return NextResponse.redirect(destination, 307);
  }
  if (hostRouting.kind === 'rewrite') {
    const destination = request.nextUrl.clone();
    destination.pathname = hostRouting.pathname;
    return NextResponse.rewrite(destination);
  }

  const incomingHost = hostRouting.kind === 'allow' ? classifyGurudeviHost(hostname) : 'other';
  const response =
    incomingHost !== 'explore' && isSanctuaryPath(request.nextUrl.pathname)
      ? await refreshSupabaseSession(request)
      : NextResponse.next({ request });

  return applySecurityHeaders(response);
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

// Host routing must see both route families. Static assets are excluded so their
// origin remains stable while routes move between the two canonical hosts.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|map|png|svg|webp|txt)$).*)',
  ],
};
