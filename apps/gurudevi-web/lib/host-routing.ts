export const PUBLIC_GURUDEVI_HOST = 'gurudevi.app';
export const SANCTUARY_GURUDEVI_HOST = 'sanctuary.gurudevi.app';
export const EXPLORE_GURUDEVI_HOST = 'explore.gurudevi.app';

export type GurudeviHost = 'public' | 'sanctuary' | 'explore' | 'other';
export type HostRoutingDecision =
  | { kind: 'allow' }
  | {
      kind: 'redirect';
      host: typeof PUBLIC_GURUDEVI_HOST | typeof SANCTUARY_GURUDEVI_HOST;
    }
  | { kind: 'rewrite'; pathname: string }
  | { kind: 'not-found' };

const sanctuaryRoutePrefixes = [
  '/api',
  '/auth',
  '/community',
  '/explore',
  '/library',
  '/notifications',
  '/onboarding',
  '/profile',
  '/qr',
  '/recovery',
  '/reset-password',
  '/sanctuary',
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
  const incomingHost = classifyGurudeviHost(hostname);
  if (incomingHost === 'other') return { kind: 'allow' };

  if (incomingHost === 'explore') {
    if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };
    if (hasRoutePrefix(pathname, exploreDeniedPrefixes)) return { kind: 'not-found' };
    return { kind: 'rewrite', pathname: `/explore-internal${pathname === '/' ? '' : pathname}` };
  }

  if (pathname === '/explore' || pathname.startsWith('/explore/')) {
    return { kind: 'not-found' };
  }

  if (pathname === '/explore-internal' || pathname.startsWith('/explore-internal/')) {
    return { kind: 'not-found' };
  }

  const expectedHost = isSanctuaryPath(pathname) ? 'sanctuary' : 'public';
  if (incomingHost === expectedHost) return { kind: 'allow' };
  if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };

  return {
    kind: 'redirect',
    host: expectedHost === 'sanctuary' ? SANCTUARY_GURUDEVI_HOST : PUBLIC_GURUDEVI_HOST,
  };
}
