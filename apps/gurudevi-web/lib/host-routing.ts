export const PUBLIC_GURUDEVI_HOST = 'gurudevi.app';
export const SANCTUARY_GURUDEVI_HOST = 'sanctuary.gurudevi.app';
export const EXPLORE_GURUDEVI_HOST = 'explore.gurudevi.app';

export type GurudeviHost = 'public' | 'sanctuary' | 'explore' | 'other';
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
  '/workspace',
] as const;

const exploreDeniedPrefixes = [
  '/api',
  '/auth',
  '/explore-internal',
  '/onboarding',
  '/recovery',
  '/reset-password',
  '/sign-in',
  '/sign-up',
] as const;

const GURUDEVI_LK_HOSTS = new Set(['gurudevi.lk', 'www.gurudevi.lk']);

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

export function classifyGurudeviHost(hostname: string): GurudeviHost {
  const normalizedHostname = normalizeHostname(hostname);
  if (normalizedHostname === PUBLIC_GURUDEVI_HOST) return 'public';
  if (normalizedHostname === SANCTUARY_GURUDEVI_HOST) return 'sanctuary';
  if (normalizedHostname === EXPLORE_GURUDEVI_HOST) return 'explore';
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
    return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname: '/self' };
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
      return { kind: 'rewrite', pathname: '/self' };
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
    return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname: '/self' };
  }

  if (incomingHost === 'sanctuary' && pathname === '/') {
    return { kind: 'redirect', host: SANCTUARY_GURUDEVI_HOST, pathname: '/self' };
  }

  const expectedHost = isSanctuaryPath(pathname) ? 'sanctuary' : 'public';
  if (incomingHost === expectedHost) return { kind: 'allow' };
  if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };

  return {
    kind: 'redirect',
    host: expectedHost === 'sanctuary' ? SANCTUARY_GURUDEVI_HOST : PUBLIC_GURUDEVI_HOST,
  };
}
