/**
 * The security headers every Gurudevi web response carries, as pure data: each site's build
 * writes them for its host (`_headers`), so gurudevi.app, sanctuary and Explore share one
 * definition.
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
  /** Development servers need `eval` and their HMR sockets. */
  readonly development: boolean;
}

/** Headers that are the same on every host: framing, sniffing, transport and capabilities. */
export const BASE_HEADERS: Readonly<Record<string, string>> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/**
 * The policy beyond scripts and styles, for a page that sets those itself (the public site's
 * build hashes each page's inline scripts and styles into its own policy).
 */
export const CONTENT_DIRECTIVES = [
  "default-src 'self'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
] as const;

export function securityHeaders({
  connect,
  development,
}: HeaderOptions): Readonly<Record<string, string>> {
  const scriptSrc = [
    "'self'",
    // The built app has no inline script; only a development server injects one.
    ...(development ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
  ];
  const connectSrc = ["'self'", ...connect, ...(development ? ['ws:', 'http:'] : [])];
  const csp = [
    ...CONTENT_DIRECTIVES,
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `connect-src ${connectSrc.join(' ')}`,
    "frame-ancestors 'none'",
  ].join('; ');
  return { 'Content-Security-Policy': csp, ...BASE_HEADERS };
}

/** A Cloudflare Pages `_headers` block for every path. */
export function headersBlock(headers: Readonly<Record<string, string>>): string {
  return `/*\n${Object.entries(headers)
    .map(([name, value]) => `  ${name}: ${value}`)
    .join('\n')}`;
}
