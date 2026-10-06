export const PUBLIC_GURUDEVI_HOST = 'gurudevi.app';
export const SANCTUARY_GURUDEVI_HOST = 'sanctuary.gurudevi.app';

export type GurudeviHost = 'public' | 'sanctuary' | 'other';
export type HostRoutingDecision =
  | { kind: 'allow' }
  | { kind: 'redirect'; host: typeof PUBLIC_GURUDEVI_HOST | typeof SANCTUARY_GURUDEVI_HOST }
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

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, '');
}

export function classifyGurudeviHost(hostname: string): GurudeviHost {
  const normalizedHostname = normalizeHostname(hostname);
  if (normalizedHostname === PUBLIC_GURUDEVI_HOST) return 'public';
  if (normalizedHostname === SANCTUARY_GURUDEVI_HOST) return 'sanctuary';
  return 'other';
}

export function isSanctuaryPath(pathname: string): boolean {
  return sanctuaryRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function resolveHostRouting(
  hostname: string,
  pathname: string,
  method: string,
): HostRoutingDecision {
  const incomingHost = classifyGurudeviHost(hostname);
  if (incomingHost === 'other') return { kind: 'allow' };

  const expectedHost = isSanctuaryPath(pathname) ? 'sanctuary' : 'public';
  if (incomingHost === expectedHost) return { kind: 'allow' };
  if (method !== 'GET' && method !== 'HEAD') return { kind: 'not-found' };

  return {
    kind: 'redirect',
    host: expectedHost === 'sanctuary' ? SANCTUARY_GURUDEVI_HOST : PUBLIC_GURUDEVI_HOST,
  };
}
