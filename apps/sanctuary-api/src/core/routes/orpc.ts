import { buildORPCContextFromHono } from '../router';
import { nativeORPCPaths } from './nativeORPCPaths';

type RouteRegistrar = {
  all: (path: string, ...handlers: any[]) => unknown;
};

type RPCHandler = {
  handle: (...args: any[]) => Promise<{ matched: boolean; response?: Response }>;
};

async function handleNativeORPC(c: any, rpcHandler: RPCHandler) {
  const context = await buildORPCContextFromHono(c);
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    context,
    prefix: '/api',
  });
  console.log(
    '[diag-native]',
    c.req.method,
    c.req.path,
    'matched=',
    matched,
    'status=',
    response?.status,
  );
  return matched && response ? response : c.text('Not Found', 404);
}

export function registerNativeORPCRoutes(app: RouteRegistrar, rpcHandler: RPCHandler) {
  for (const path of nativeORPCPaths) {
    app.all(path, (context) => handleNativeORPC(context, rpcHandler));
  }
  // Modern oRPC v2 catch-all for dynamically routed domain procedures
  app.all('/api/*', async (c: any, next: any) => {
    if (
      c.req.path.startsWith('/api/auth') ||
      c.req.path.startsWith('/api/ai') ||
      c.req.path.startsWith('/api/openapi') ||
      c.req.path.startsWith('/api/durable-agents') ||
      c.req.path.startsWith('/api/rewards') ||
      c.req.path.startsWith('/api/events') ||
      c.req.path.startsWith('/api/mcp') ||
      c.req.path.startsWith('/api/ws')
    ) {
      return await next();
    }
    return handleNativeORPC(c, rpcHandler);
  });
}

export { nativeORPCPaths };
