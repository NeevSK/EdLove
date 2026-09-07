import { GURUDEVI_PLATFORM_URL } from '@repo/core/config/publicUrls';

const PLATFORM_HOST = new URL(GURUDEVI_PLATFORM_URL).hostname;
const ALLOWED_NATIVE_HOSTS = new Set(['auth', 'qr', 'invite']);
const ALLOWED_WEB_PATH_PREFIXES = ['/auth/callback', '/qr', '/p', '/invite', '/app'];
const ALLOWED_INTERNAL_ROUTE_PREFIXES = [
  '/a-i-assistant',
  '/community',
  '/invitation-welcome',
  '/library',
  '/notifications',
  '/profile',
  '/qr',
  '/self',
  '/settings',
  '/thuthimal-claim',
  '/workspace',
  '/welcome',
];

function startsWithPathPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function normalizeAcceptedDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'gurudevi:') {
      return ALLOWED_NATIVE_HOSTS.has(parsed.hostname) ? url : null;
    }

    if (parsed.protocol === 'https:') {
      return parsed.hostname === PLATFORM_HOST && startsWithPathPrefix(parsed.pathname, ALLOWED_WEB_PATH_PREFIXES)
        ? url
        : null;
    }

    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
      return startsWithPathPrefix(parsed.pathname, ALLOWED_WEB_PATH_PREFIXES) ? url : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function isQRDeepLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === 'gurudevi:' && parsed.hostname === 'qr') ||
      (parsed.protocol === 'https:' &&
        parsed.hostname === PLATFORM_HOST &&
        parsed.pathname === '/qr')
    );
  } catch {
    return false;
  }
}

export function normalizeAcceptedInternalRoute(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//') || /[\r\n]/.test(path)) return null;
  return startsWithPathPrefix(path.split(/[?#]/)[0] ?? '', ALLOWED_INTERNAL_ROUTE_PREFIXES)
    ? path
    : null;
}
