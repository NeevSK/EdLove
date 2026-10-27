import { createMiddleware } from 'hono/factory';

export interface RequestIdEnv {
  Variables: {
    requestId: string;
  };
}

export function requiresHttps(nodeEnv = process.env.NODE_ENV): boolean {
  return nodeEnv !== 'development' && nodeEnv !== 'test';
}

export function resolveTlsTerminationMode(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): 'direct' | 'render' {
  const mode = environment.SANCTUARY_TLS_TERMINATION ?? 'direct';
  if (mode === 'direct') return mode;
  if (mode === 'render' && environment.RENDER === 'true' && environment.RENDER_SERVICE_ID?.trim())
    return mode;
  throw new Error('Invalid Sanctuary TLS termination configuration.');
}

const RESERVED_DISALLOWED_SUBDOMAINS = new Set([
  'explore',
  'api',
  'admin',
  'www',
  'platform',
  'status',
  'mail',
  'auth',
]);

const CANONICAL_ALLOWED_ORIGINS = new Set([
  'https://gurudevi.app',
  'https://sanctuary.gurudevi.app',
]);

export function resolveAllowedCorsOrigin(
  origin: string | undefined,
  nodeEnv = process.env.NODE_ENV,
): string | null {
  if (!origin) return null;
  if (!requiresHttps(nodeEnv)) {
    try {
      const parsedOrigin = new URL(origin);
      if (
        parsedOrigin.origin === origin &&
        (parsedOrigin.protocol === 'http:' || parsedOrigin.protocol === 'https:') &&
        parsedOrigin.hostname === 'localhost'
      ) {
        return origin;
      }
    } catch {
      return null;
    }
  }

  try {
    const parsedOrigin = new URL(origin);
    if (parsedOrigin.origin !== origin) return null;
    if (parsedOrigin.protocol !== 'https:') return null;

    if (CANONICAL_ALLOWED_ORIGINS.has(origin)) return origin;

    const match = parsedOrigin.hostname.match(/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\.gurudevi\.app$/);
    if (match) {
      const subdomain = match[1];
      if (subdomain && !RESERVED_DISALLOWED_SUBDOMAINS.has(subdomain)) {
        return origin;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function requireHttpsMiddleware(
  nodeEnv = process.env.NODE_ENV,
  tlsTermination = resolveTlsTerminationMode(),
) {
  return createMiddleware<RequestIdEnv>(async (c, next) => {
    const requestUrl = new URL(c.req.url);
    const admittedRenderRequest =
      tlsTermination === 'render' &&
      (c.req.header('x-forwarded-proto') === 'https' ||
        (c.req.method === 'GET' && requestUrl.pathname === '/health/live'));
    if (!requiresHttps(nodeEnv) || requestUrl.protocol === 'https:' || admittedRenderRequest) {
      await next();
      return;
    }

    return c.json(
      {
        type: 'about:blank',
        title: 'HTTPS required',
        status: 400,
        code: 'HTTPS_REQUIRED',
        requestId: c.get('requestId'),
      },
      400,
    );
  });
}
