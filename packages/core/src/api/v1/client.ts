import { createORPCClient, ORPCError } from '@orpc/client';
import { RPCLink, type RPCLinkOptions } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { UnavailableError } from '../../effect/Errors';
import { assertSecureApiUrl } from '../../lib/security/transportSecurity.adapter';
import type { AppContractClient } from './contract';

export const API_V1_PREFIX = '/api/v1';

export type V1ClientOptions = Pick<
  RPCLinkOptions<Record<never, never>>,
  'origin' | 'headers' | 'fetch'
> & {
  /** Abandon a call after this long. The server gives up at 10 s; the default leaves margin. */
  timeoutMs?: number;
};

export const V1_TIMEOUT_MS = 15_000;

/**
 * Runs `send` with a signal that aborts at `timeoutMs` or when the caller's own signal aborts.
 * A timeout becomes an UnavailableError (worth retrying); the caller's own abort stays an
 * AbortError, an interruption that is never retried or shown. Built on AbortController alone,
 * because Hermes may lack AbortSignal.timeout and AbortSignal.any.
 */
async function withTimeout<T>(
  callerSignal: AbortSignal | null | undefined,
  timeoutMs: number,
  send: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forward = () => controller.abort();
  if (callerSignal?.aborted) controller.abort();
  else callerSignal?.addEventListener('abort', forward, { once: true });
  try {
    return await send(controller.signal);
  } catch (error) {
    if (timedOut) throw new UnavailableError({ code: 'CLIENT_TIMEOUT', cause: error });
    throw error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', forward);
  }
}

export function createV1Link({ timeoutMs = V1_TIMEOUT_MS, ...options }: V1ClientOptions = {}) {
  // Injected transports must honor redirect: 'error'; response checks cannot undo a followed redirect.
  const fetch = options.fetch;
  return new RPCLink<Record<never, never>>({
    ...options,
    url: API_V1_PREFIX,
    fetch: async (url, init, context, path) => {
      const destination =
        url.startsWith('/') && !url.startsWith('//')
          ? new URL(url, globalThis.location?.origin).href
          : url;
      assertSecureApiUrl(destination);
      const response = await withTimeout(init.signal, timeoutMs, (signal) => {
        const request = { ...init, signal, redirect: 'error' as const };
        return fetch ? fetch(destination, request, context, path) : globalThis.fetch(destination, request);
      });
      if (
        (response.status >= 300 && response.status < 400) ||
        response.type === 'opaqueredirect' ||
        response.redirected
      )
        throw new TypeError('Unexpected redirect response: redirects are not followed.');
      return response;
    },
  });
}

export function createV1Client(options: V1ClientOptions = {}): AppContractClient {
  return createORPCClient<AppContractClient>(createV1Link(options));
}

export interface AuthenticatedV1ClientOptions extends Omit<V1ClientOptions, 'headers'> {
  /** The active account's access token, read per request; null when signed out. */
  getAccessToken: () => Promise<string | null>;
}

/**
 * The apps' client for /api/v1. Every request carries the active account's current
 * token; with no token it fails locally as UNAUTHORIZED instead of calling the server.
 * The server decides authority from the token and its own bond records.
 */
export function createAuthenticatedV1Client({
  getAccessToken,
  ...options
}: AuthenticatedV1ClientOptions): AppContractClient {
  return createV1Client({
    ...options,
    headers: async () => {
      const token = await getAccessToken();
      if (!token) throw new ORPCError('UNAUTHORIZED', { message: 'Sign in is required.' });
      return { authorization: `Bearer ${token}` };
    },
  });
}

/**
 * Typed TanStack Query options for every v1 procedure, derived from the contract:
 * `v1.identity.session.queryOptions()`, `v1.identity.createInitialBond.mutationOptions()`,
 * `v1.identity.key()` for invalidation. A new procedure in the contract gets them with no code
 * here. Every key starts with `'v1'`, so a whole API version can be invalidated or removed at
 * once, and the QueryClient policy names failures by procedure (`v1.identity.createInitialBond`).
 */
export function createV1QueryUtils(client: AppContractClient) {
  return createTanstackQueryUtils(client, { prefix: 'v1' });
}
