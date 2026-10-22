import {
  COMMON_ERROR_STATUS_MAP,
  createORPCClient,
  createSafeClient,
  ORPCError,
  safe,
} from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import {
  BatchLinkPlugin,
  ClientRetryPlugin,
  type ClientRetryPluginContext,
  DedupeRequestsPlugin,
} from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { AppContractClient } from './appContract';
import { SOVEREIGN_ORPC_URL } from './base';
import { authenticatedSovereignFetch } from './clientRuntime';

// Bridge ORPCError.prototype.status to COMMON_ERROR_STATUS_MAP for full backwards compatibility
if (!Object.getOwnPropertyDescriptor(ORPCError.prototype, 'status')) {
  Object.defineProperty(ORPCError.prototype, 'status', {
    get(this: any) {
      return this._status ?? (COMMON_ERROR_STATUS_MAP as Record<string, number>)[this.code] ?? 500;
    },
    set(this: any, val: number) {
      this._status = val;
      Object.defineProperty(this, 'status', {
        value: val,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    },
    configurable: true,
    enumerable: true,
  });

  const originalToJSON = ORPCError.prototype.toJSON;
  ORPCError.prototype.toJSON = function (this: any) {
    const json = originalToJSON.call(this);
    return {
      ...json,
      status: this.status,
    };
  };
}

// Resilient decode for RPCLinkCodec when backend/mocks include status in error json payload
const sampleLink = new RPCLink({ url: '/api' });
const codecProto = (sampleLink as any).codec?.constructor?.prototype;
if (codecProto && !codecProto._resilientDecodePatched) {
  const originalDecodeResponse = codecProto.decodeResponse;
  codecProto.decodeResponse = async function (response: any, ...args: any[]) {
    try {
      return await originalDecodeResponse.call(this, response, ...args);
    } catch (err: any) {
      if (err?.name === 'MalformedResponseError') {
        const body = err.response?.body;
        const json = body?.json ?? body;
        if (json && typeof json.code === 'string') {
          const error = new ORPCError(json.code, {
            message: json.message,
            data: json.data,
          });
          (error as any).defined = Boolean(json.defined);
          if (typeof json.status === 'number') {
            (error as any).status = json.status;
          } else if (typeof err.response?.status === 'number') {
            (error as any).status = err.response.status;
          }
          return { kind: 'error', error };
        }
      }
      throw err;
    }
  };
  codecProto._resilientDecodePatched = true;
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
  origin: sovereignOrigin,
  url: '/api',
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
      filter: ({ context }) =>
        context?.expectedAccountId === undefined,
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
export type AppContractClient = Record<string, any>;

export const orpcClient: any = createORPCClient(link);

export const orpc: any = createTanstackQueryUtils(orpcClient);

export type ORPCClient = typeof orpcClient;
export type ORPCUtils = typeof orpc;
