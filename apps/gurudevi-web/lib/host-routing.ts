/**
 * Gurudevi Host Routing Engine
 *
 * Partitions the single Next.js web application into three distinct surfaces:
 * 1. Public / Marketing: gurudevi.app (or localhost:3000 / public.localhost:3000) -> app/(marketing)
 * 2. Sanctuary Web: sanctuary.gurudevi.app (or sanctuary.localhost:3000) -> app/(sanctuary)
 * 3. Explore Web: explore.gurudevi.app (or explore.localhost:3000) -> app/(sanctuary) guest showcase
 *
 * Local development leverages RFC 6761 (*.localhost) to permit zero-OS-hack
 * testing without editing /etc/hosts or dealing with SSL port collisions.
 */

export const PUBLIC_GURUDEVI_HOST = 'gurudevi.app';
export const SANCTUARY_GURUDEVI_HOST = 'sanctuary.gurudevi.app';
export const EXPLORE_GURUDEVI_HOST = 'explore.gurudevi.app';

export type GurudeviHost = 'public' | 'sanctuary' | 'explore' | 'school' | 'other';
export type HostRoutingDecision =
  | { kind: 'allow' }
  | {
      kind: 'redirect';
      host: typeof PUBLIC_GURUDEVI_HOST | typeof SANCTUARY_GURUDEVI_HOST | typeof EXPLORE_GURUDEVI_HOST;
      pathname?: string;
    }
  | { kind: 'rewrite'; pathname: string }
  | { kind: 'not-found' };

/**
 * Complete registry of all private/authenticated routes defined inside app/(sanctuary).
 * Every sanctuary surface, operational desk, lab, and auth route MUST be listed here
 * so host-routing correctly recognizes it as belonging to the Sanctuary partition.
 *
 * Note: /school is public vanity profiles (not private sanctuary), so it is not listed here.
 */
const sanctuaryRoutePrefixes = [
  '/account-recovery',
  '/admin',
  '/agent-lab',
  '/api',
  '/architecture',
  '/architecture-lab',
  '/atlas',
  '/auth',
  '/c',
  '/community',
  '/explore-intro',
  '/icon-lab',
  '/invitation-welcome',
  '/kit',
  '/library',
  '/notifications',
  '/onboarding',
  '/profile',
  '/qr',
  '/recovery',
  '/reset-password',
  '/self',
  '/settings',
  '/sign-in',
  '/sign-up',
  '/verger-lab',
  '/welcome',
  '/workspace',
] as const;

/**
 * R3: Explicit allowlist of paths accessible on production explore.gurudevi.app.
 *
 * Security model: explore is a read-only, localStorage-only guest showcase.
 * It must NOT expose sanctuary-authenticated routes, admin surfaces, or any
 * endpoint that could carry or accept a real user session.
 *
 * ALLOWLIST (not blocklist): routes you add to sanctuary in the future are
 * BLOCKED on explore by default in production. Add here only if the route is safe for an
 * unauthenticated, demo-only guest with no Supabase credentials.
 *
 * Auth flows (/sign-in, /sign-up, /auth/*) are handled separately via redirect
 * to sanctuary — they never render on the explore host itself.
 */
const exploreAllowedPathPrefixes = [
  '/welcome',   // Landing / sign-in prompt (guest mode, no Supabase required)
  '/self',      // Demo self-reflection floor (uses localStorage only)
  '/badge.svg', // School badge (public asset)
] as const;

const GURUDEVI_LK_HOSTS = new Set(['gurudevi.lk', 'www.gurudevi.lk']);

const RESERVED_SUBDOMAINS = new Set([
  // Core platform subdomains
  'sanctuary',
  'explore',
  'public',
  'api',
  'admin',
  'www',
  'platform',
  'status',
  'mail',
  'auth',
  // R5: Anti-squatting additions — these look like system/auth subdomains.
  // Without them, a school named "login" would get login.gurudevi.app routed
  // to /school/login — a convincing phishing surface.
  'login',
  'account',
  'my',
  'app',
  'cdn',
  'static',
  'media',
  'help',
  'docs',
  'support',
  'security',
  'dev',
  'staging',
  'beta',
]);

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

export function isLocalPreviewHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '[::1]' ||
    normalized === '::1' ||
    normalized.endsWith('.localhost')
  );
}

export function extractSchoolSubdomain(hostname: string): string | null {
  const normalized = normalizeHostname(hostname);
  const match = normalized.match(/^([a-z0-9_-]+)\.gurudevi\.app$/);
  if (!match) return null;
  const subdomain = match[1];
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return null;
  return subdomain;
}

export function classifyGurudeviHost(hostname: string): GurudeviHost {
  const normalizedHostname = normalizeHostname(hostname);
  if (
    normalizedHostname === PUBLIC_GURUDEVI_HOST ||
    normalizedHostname === 'public.localhost' ||
    normalizedHostname === 'localhost' ||
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === '[::1]' ||
    normalizedHostname === '::1'
  )
    return 'public';
  if (
    normalizedHostname === SANCTUARY_GURUDEVI_HOST ||
    normalizedHostname === 'sanctuary.localhost'
  )
    return 'sanctuary';
  if (normalizedHostname === EXPLORE_GURUDEVI_HOST || normalizedHostname === 'explore.localhost')
    return 'explore';
  if (extractSchoolSubdomain(normalizedHostname) !== null) return 'school';
  return 'other';
}

export function isSanctuaryPath(pathname: string): boolean {
  return sanctuaryRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function hasRoutePrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function resolveHostRouting(
  hostname: string,
  pathname: string,
  method: string,
): HostRoutingDecision {
  if (pathname.startsWith('/.well-known/')) {
    return { kind: 'allow' };
  }

  const normalized = normalizeHostname(hostname);

  if (GURUDEVI_LK_HOSTS.has(normalized)) {
    return { kind: 'redirect', host: PUBLIC_GURUDEVI_HOST };
  }

  if (normalized === 'platform.gurudevi.app') {
    return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname: '/welcome' };
  }

  const incomingHost = classifyGurudeviHost(hostname);
  if (incomingHost === 'other') return { kind: 'allow' };

  if (incomingHost === 'explore') {
    if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };

    // Auth flows redirect to the real sanctuary host — explore itself has no auth.
    if (pathname === '/sign-in' || pathname === '/sign-up' || pathname.startsWith('/auth')) {
      return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname };
    }

    // R3: Root rewrite handled before allowlist check.
    if (pathname === '/') {
      return { kind: 'rewrite', pathname: '/welcome' };
    }

    // In local development / preview (*.localhost), permit any route through
    // so engineers can freely spin up prototypes, test labs, and new floors
    // without host-routing blocking them.
    if (isLocalPreviewHost(hostname)) {
      return { kind: 'allow' };
    }

    // R3: Production allowlist gate (explore.gurudevi.app) — only explicitly approved paths are served.
    // Everything else returns 404 to prevent session-carrying sanctuary routes from
    // being accessible on the demo surface in production.
    const isAllowed = hasRoutePrefix(pathname, exploreAllowedPathPrefixes);
    if (!isAllowed) return { kind: 'not-found' };

    return { kind: 'allow' };
  }

  if (incomingHost === 'school') {
    if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };
    const schoolHandle = extractSchoolSubdomain(hostname);
    if (pathname === '/badge.svg') {
      return { kind: 'rewrite', pathname: `/badge.svg?school=${schoolHandle}` };
    }

    if (pathname.startsWith('/api/og')) {
      return { kind: 'allow' };
    }

    if (pathname === '/support' || pathname.startsWith('/support/')) {
      return { kind: 'allow' };
    }

    if (isSanctuaryPath(pathname)) {
      return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname };
    }

    if (pathname === '/') {
      return { kind: 'rewrite', pathname: `/school/${schoolHandle}` };
    }

    if (!pathname.startsWith('/school/')) {
      return { kind: 'rewrite', pathname: `/school/${schoolHandle}${pathname}` };
    }

    return { kind: 'allow' };
  }

  if (pathname === '/explore' || pathname.startsWith('/explore/')) {
    return { kind: 'not-found' };
  }

  if (pathname === '/explore-internal' || pathname.startsWith('/explore-internal/')) {
    return { kind: 'not-found' };
  }

  if (pathname === '/sanctuary' || pathname.startsWith('/sanctuary/')) {
    return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname: '/welcome' };
  }

  if (incomingHost === 'sanctuary' && pathname === '/') {
    return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname: '/welcome' };
  }

  if (pathname === '/support' || pathname.startsWith('/support/')) {
    if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };
    return { kind: 'allow' };
  }

  const expectedHost = isSanctuaryPath(pathname) ? 'sanctuary' : 'public';
  if (incomingHost === expectedHost) return { kind: 'allow' };
  if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };

  // In local preview (*.localhost), if a developer navigates to an unlisted or experimental route
  // on sanctuary.localhost, permit it directly rather than redirecting to public.
  if (isLocalPreviewHost(hostname) && incomingHost === 'sanctuary') {
    return { kind: 'allow' };
  }

  return {
    kind: 'redirect',
    host: expectedHost === 'sanctuary' ? SANCTUARY_GURUDEVI_HOST : PUBLIC_GURUDEVI_HOST,
  };
}
