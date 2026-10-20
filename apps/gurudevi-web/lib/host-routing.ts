export const PUBLIC_GURUDEVI_HOST = 'gurudevi.app';
export const SANCTUARY_GURUDEVI_HOST = 'sanctuary.gurudevi.app';
export const EXPLORE_GURUDEVI_HOST = 'explore.gurudevi.app';

export type GurudeviHost = 'public' | 'sanctuary' | 'explore' | 'school' | 'other';
export type HostRoutingDecision =
  | { kind: 'allow' }
  | {
      kind: 'redirect';
      host: typeof PUBLIC_GURUDEVI_HOST | typeof SANCTUARY_GURUDEVI_HOST;
      pathname?: string;
    }
  | { kind: 'rewrite'; pathname: string }
  | { kind: 'not-found' };

const sanctuaryRoutePrefixes = [
  '/api',
  '/auth',
  '/community',
  '/explore-intro',
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
  '/welcome',
  '/workspace',
] as const;

const exploreDeniedPrefixes = [
  '/api',
  '/auth',
  '/explore-internal',
  '/explore-intro',
  '/onboarding',
  '/recovery',
  '/reset-password',
  '/sign-in',
  '/sign-up',
] as const;

const GURUDEVI_LK_HOSTS = new Set(['gurudevi.lk', 'www.gurudevi.lk']);

const RESERVED_SUBDOMAINS = new Set([
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
]);

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

export function isLocalPreviewHost(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '[::1]' || normalized === '::1';
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
  if (normalizedHostname === PUBLIC_GURUDEVI_HOST) return 'public';
  if (normalizedHostname === SANCTUARY_GURUDEVI_HOST) return 'sanctuary';
  if (normalizedHostname === EXPLORE_GURUDEVI_HOST) return 'explore';
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
    if (pathname === '/sign-in' || pathname === '/sign-up' || pathname.startsWith('/auth')) {
      return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname };
    }
    if (hasRoutePrefix(pathname, exploreDeniedPrefixes)) return { kind: 'not-found' };
    if (pathname === '/') {
      return { kind: 'rewrite', pathname: '/welcome' };
    }
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

  const expectedHost = isSanctuaryPath(pathname) ? 'sanctuary' : 'public';
  if (incomingHost === expectedHost) return { kind: 'allow' };
  if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };

  return {
    kind: 'redirect',
    host: expectedHost === 'sanctuary' ? SANCTUARY_GURUDEVI_HOST : PUBLIC_GURUDEVI_HOST,
  };
}
