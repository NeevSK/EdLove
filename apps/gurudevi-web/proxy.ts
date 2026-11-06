import { type NextRequest, NextResponse } from 'next/server';
import {
  classifyGurudeviHost,
  EXPLORE_GURUDEVI_HOST,
  isLocalPreviewHost,
  isSanctuaryPath,
  PUBLIC_GURUDEVI_HOST,
  resolveHostRouting,
  SANCTUARY_GURUDEVI_HOST,
} from './lib/host-routing';
import {
  isPlatformSessionCookie,
  refreshSanctuarySession,
  resolveSanctuaryConnectOrigins,
} from './lib/sanctuary/sessionSecurity.adapter';

/**
 * Amputates all authenticated platform session cookies from a response destined
 * for the Explore host. Explore is a local-storage-only showcase with no account
 * credentials; a real session cookie present on explore.gurudevi.app creates
 * a hidden channel from the demo surface into the real sanctuary account.
 *
 * Hexagonal architecture: uses `isPlatformSessionCookie` from the session security
 * adapter rather than hardcoding vendor-specific cookie prefixes. If the underlying
 * auth provider changes (e.g. from Supabase to custom JWT, oRPC, or Auth0), the
 * amputation logic remains completely decoupled and functional.
 */
function clearSanctuarySessionCookies(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const cookieNames = request.cookies
    .getAll()
    .map((c) => c.name)
    .filter((name) => isPlatformSessionCookie(name));

  for (const name of cookieNames) {
    // Expire the cookie immediately across all subdomains.
    response.cookies.set(name, '', {
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
    });
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? request.nextUrl.hostname;
  const hostRouting = resolveHostRouting(hostname, request.nextUrl.pathname, request.method);

  if (hostRouting.kind === 'not-found') return new NextResponse(null, { status: 404 });
  if (hostRouting.kind === 'redirect') {
    const isLocal = isLocalPreviewHost(hostname);
    if (isLocal) {
      const destination = request.nextUrl.clone();
      if (hostRouting.host === SANCTUARY_GURUDEVI_HOST) {
        destination.hostname = 'sanctuary.localhost';
      } else if (hostRouting.host === EXPLORE_GURUDEVI_HOST) {
        destination.hostname = 'explore.localhost';
      } else if (hostRouting.host === PUBLIC_GURUDEVI_HOST) {
        destination.hostname = 'localhost';
      }
      if (hostRouting.pathname) {
        destination.pathname = hostRouting.pathname;
      }
      return NextResponse.redirect(destination, 307);
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
      ? await refreshSanctuarySession(request)
      : NextResponse.next({ request });

  // R1: Cookie amputation — explore host must never carry a real sanctuary session.
  // This is the primary defence against session harvesting from the demo surface.
  if (incomingHost === 'explore') {
    clearSanctuarySessionCookies(request, response);
  }

  const isLocal = isLocalPreviewHost(hostname);
  return applySecurityHeaders(response, incomingHost === 'explore', isLocal);
}

/**
 * Applies hardened security response headers.
 *
 * @param isExploreSurface - When true, enforces an explore-specific CSP that
 *   strictly allows connect-src 'self' (blocking all external auth and API endpoints).
 *   On Sanctuary/public, connect-src is dynamically resolved from the active
 *   session adapter rather than hardcoding third-party vendor hostnames.
 * @param isLocal - In local development / preview hosts, permits ws: and 'unsafe-eval'
 *   required by Next.js Fast Refresh, React DevTools, and HMR.
 */
function applySecurityHeaders(
  response: NextResponse,
  isExploreSurface = false,
  isLocal = false,
): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Hexagonal CSP: dynamically resolved from registered adapters
  const dynamicOrigins = isExploreSurface
    ? []
    : resolveSanctuaryConnectOrigins();

  // In local preview/development, permit ws: for Next.js Fast Refresh and HMR websockets
  const devConnect = isLocal ? ['ws:', 'http:'] : [];
  const connectSrc = ["'self'", ...dynamicOrigins, ...devConnect].join(' ');

  // Next.js development requires 'unsafe-eval' for source maps, Fast Refresh & React DevTools.
  // In production builds, 'unsafe-eval' is omitted.
  const scriptSrc = isLocal || process.env.NODE_ENV === 'development'
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src ${connectSrc}`,
    "img-src 'self' data: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

// Host routing must see both route families. Static assets are excluded so their
// origin remains stable while routes move between the two canonical hosts.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:avif|css|gif|ico|jpeg|jpg|js|map|png|svg|webp|txt)$).*)',
  ],
};
