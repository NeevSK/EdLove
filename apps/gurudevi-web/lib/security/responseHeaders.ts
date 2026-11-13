/**
 * The security headers every Gurudevi web response carries, as pure data: Next's proxy sets them
 * per request, and each Vite build writes them for its host (`_headers`). One definition, so the
 * two cannot drift while both serve.
 */

/** Where the browser may connect besides its own origin: the auth provider and the API. */
export function connectOrigins(
  config: Readonly<{ authUrl?: string | null; apiUrl?: string | null }>,
): readonly string[] {
  const origins = new Set<string>();
  const auth = parse(config.authUrl);
  if (auth) {
    origins.add(auth.origin);
    // Realtime channels use the matching WebSocket origin.
    origins.add(`${auth.protocol === 'https:' ? 'wss' : 'ws'}://${auth.host}`);
  }
  const api = parse(config.apiUrl);
  if (api) origins.add(api.origin);
  return [...origins];
}

function parse(value: string | null | undefined): URL | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

export interface HeaderOptions {
  /** Origins the page may connect to besides itself. Explore passes none: it never leaves the browser. */
  readonly connect: readonly string[];
  /** Next needs inline scripts for its runtime; the Vite builds have none. */
  readonly inlineScripts: boolean;
  /** Development servers need `eval` and their HMR sockets. */
  readonly development: boolean;
}

export function securityHeaders({
  connect,
  inlineScripts,
  development,
}: HeaderOptions): Readonly<Record<string, string>> {
  const scriptSrc = [
    "'self'",
    ...(inlineScripts || development ? ["'unsafe-inline'"] : []),
    ...(development ? ["'unsafe-eval'"] : []),
  ];
  const connectSrc = ["'self'", ...connect, ...(development ? ['ws:', 'http:'] : [])];
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src ${connectSrc.join(' ')}`,
    "img-src 'self' data: https:",
    "worker-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    'Content-Security-Policy': csp,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
}
