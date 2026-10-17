import { createORPCClient, MalformedResponseError, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import {
  BatchLinkPlugin,
  ClientRetryPlugin,
  type ClientRetryPluginContext,
  DedupeRequestsPlugin,
} from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { SOVEREIGN_ORPC_URL } from './base';
import { authenticatedSovereignFetch } from './clientRuntime';

const CODE_TO_STATUS: Record<string, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  NOT_ACCEPTABLE: 406,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

if (!('status' in ORPCError.prototype)) {
  Object.defineProperty(ORPCError.prototype, 'status', {
    get() {
      return (this.code && CODE_TO_STATUS[this.code]) ?? 500;
    },
    enumerable: true,
    configurable: true,
  });

  const origToJSON = (ORPCError.prototype as any).toJSON;
  (ORPCError.prototype as any).toJSON = function () {
    const json = origToJSON ? origToJSON.call(this) : {};
    return {
      ...json,
      status: (this as any).status,
    };
  };
}

if (!('status' in MalformedResponseError.prototype)) {
  Object.defineProperty(MalformedResponseError.prototype, 'status', {
    get() {
      return (this as any).response?.status;
    },
    enumerable: true,
    configurable: true,
  });
}

export interface ClientContext extends ClientRetryPluginContext {
  expectedAccountId?: string;
  cache?: RequestCache;
}

const runtimeDevelopmentFlag = (
  globalThis as typeof globalThis & {
    readonly __DEV__?: boolean;
  }
).__DEV__;
const isDevelopmentRuntime =
  runtimeDevelopmentFlag === true || process.env.NODE_ENV === 'development';

const sovereignOrigin = SOVEREIGN_ORPC_URL.startsWith('http')
  ? (new URL(SOVEREIGN_ORPC_URL).origin as `http://${string}` | `https://${string}`)
  : undefined;

const link = new RPCLink<ClientContext>({
  url: '/api',
  origin: sovereignOrigin,
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
          options.lastEventRetry ?? Math.min(250 * 2 ** options.attempt, 5000),
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
      filter: ({ context }) => context.expectedAccountId === undefined,
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
    return authenticatedSovereignFetch(
      url,
      {
        ...init,
        cache: context?.cache,
      },
      context?.expectedAccountId,
    );
  },
});

export const orpcClient = createORPCClient<any>(link);

export const orpc = createTanstackQueryUtils(orpcClient);

export type ORPCClient = typeof orpcClient;
export type ORPCUtils = typeof orpc;
