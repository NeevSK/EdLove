import { createMiddleware } from 'hono/factory';

export interface RequestIdEnv {
  Variables: {
    requestId: string;
  };
}

export function requiresHttps(nodeEnv = process.env.NODE_ENV): boolean {
  return nodeEnv !== 'development' && nodeEnv !== 'test';
}

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
  const allowedOrigins = ['https://gurudevi.app', 'https://sanctuary.gurudevi.app'];
  return allowedOrigins.includes(origin) ? origin : null;
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
