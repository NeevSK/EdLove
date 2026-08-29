import { buildORPCContextFromHono } from '../router';
import { nativeORPCPaths } from './nativeORPCPaths';

type RouteRegistrar = {
  all: (path: string, handler: (context: any) => Promise<Response>) => unknown;
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
  console.log('[diag-native]', c.req.raw.url, 'matched=', matched, 'status=', response?.status);
  return matched && response ? response : c.text('Not Found', 404);
}

export function registerNativeORPCRoutes(app: RouteRegistrar, rpcHandler: RPCHandler) {
  for (const path of nativeORPCPaths) {
    app.all(path, (context) => handleNativeORPC(context, rpcHandler));
  }
}

export { nativeORPCPaths };
