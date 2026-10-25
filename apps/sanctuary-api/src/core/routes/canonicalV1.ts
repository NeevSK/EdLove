import { buildORPCContextFromHono } from '../router';

type RouteRegistrar = {
  all: (path: string, ...handlers: any[]) => unknown;
};

type OpenAPIHandler = {
  handle: (...args: any[]) => Promise<{ matched: boolean; response?: Response }>;
};

/**
 * Mount the literal canonical surface before the legacy native /api/* fallback.
 * This intentionally accepts no wildcard domain registration.
 */
export function registerCanonicalV1Routes(app: RouteRegistrar, handler: OpenAPIHandler) {
  app.all('/api/v1/*', async (c: any) => {
    const context = await buildORPCContextFromHono(c);
    const { matched, response } = await handler.handle(c.req.raw, {
      context,
      prefix: '/api/v1',
    });
    return matched && response ? response : c.text('Not Found', 404);
  });
}
