import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { BatchLinkPlugin, ClientRetryPlugin, DedupeRequestsPlugin } from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { SOVEREIGN_ORPC_URL } from './base';
import { authenticatedSovereignFetch } from './clientRuntime';

export interface ClientContext {
  cache?: RequestCache;
  retry?: number;
  retryDelay?: (options: {
    lastEventRetry?: number;
    attemptIndex: number;
    error: unknown;
  }) => number;
  shouldRetry?: (options: {
    lastEventRetry?: number;
    attemptIndex: number;
    error: unknown;
  }) => boolean;
  onRetry?: (options: {
    lastEventRetry?: number;
    attemptIndex: number;
    error: unknown;
  }) => void | ((isSuccess: boolean) => void);
}

const runtimeDevelopmentFlag = (globalThis as typeof globalThis & {
  readonly __DEV__?: boolean;
}).__DEV__;
const isDevelopmentRuntime = runtimeDevelopmentFlag === true || process.env.NODE_ENV === 'development';

const link = new RPCLink<ClientContext>({
  url: SOVEREIGN_ORPC_URL,
  method: ({ context }) => {
    if (context?.cache) {
      return 'GET';
    }
    return 'POST';
  },
  plugins: [
    new ClientRetryPlugin({
      default: {
        retry: isDevelopmentRuntime ? 0 : 2,
        retryDelay: (options) =>
          options.lastEventRetry ?? Math.min(250 * 2 ** options.attemptIndex, 5000),
        shouldRetry: (options) => {
          if (!options.error) return false;
          const status = (options.error as any)?.status;
          // Do not retry synthetic offline 503s or non-server errors
          if (status === 503) return false;
          return status >= 500 || status === 429 || status === 408;
        },
      },
    }),
    new DedupeRequestsPlugin({
      groups: [
        {
          condition: ({ context }) => context?.cache === 'force-cache',
          context: { cache: 'force-cache' },
        },
        { condition: () => true, context: {} },
      ],
      filter: ({ request }) => request.method === 'GET',
    }),
    new BatchLinkPlugin({
      groups: [
        {
          condition: ({ context }) => context?.cache === 'force-cache',
          context: { cache: 'force-cache' },
        },
        { condition: () => true, context: {} },
      ],
    }),
  ],
  fetch: async (url, init, { context }) => {
    return authenticatedSovereignFetch(url, {
      ...init,
      cache: context?.cache,
    });
  },
});

export const orpcClient = createORPCClient<any>(link);

export const orpc = createTanstackQueryUtils(orpcClient);

export type ORPCClient = typeof orpcClient;
export type ORPCUtils = typeof orpc;
