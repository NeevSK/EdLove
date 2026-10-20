import { createMiddleware } from 'hono/factory';

export interface RequestIdEnv {
  Variables: {
    requestId: string;
  };
}

export function requiresHttps(nodeEnv = process.env.NODE_ENV): boolean {
  return nodeEnv !== 'development' && nodeEnv !== 'test';
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

export function requireHttpsMiddleware(nodeEnv = process.env.NODE_ENV) {
  return createMiddleware<RequestIdEnv>(async (c, next) => {
    if (!requiresHttps(nodeEnv) || new URL(c.req.url).protocol === 'https:') {
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
