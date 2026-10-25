/**
 * A route as verger's screen name (R3, R4): the path without query or fragment, with each segment
 * that names a record rather than a screen (digits, a UUID, a long opaque token) folded into `:id`,
 * so `/class/123` and `/class/456` are one screen with one memory. Route groups in parentheses
 * (expo-router) are kept: they never reach the URL anyway.
 */
export function screenNameOf(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] ?? '';
  const segments = path.split('/').filter((segment) => segment.length > 0);
  if (segments.length === 0) return '/';
  const named = segments.map((segment) => (RECORD_SEGMENT.test(segment) ? ':id' : segment));
  return `/${named.join('/')}`;
}

/** Digits, a UUID, or 16+ characters of letters and digits that include a digit. */
const RECORD_SEGMENT =
  /^(\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{16,})$/i;
