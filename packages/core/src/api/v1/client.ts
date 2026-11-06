import { createORPCClient, ORPCError } from '@orpc/client';
import { RPCLink, type RPCLinkOptions } from '@orpc/client/fetch';
import { assertSecureApiUrl } from '../../lib/security/transportSecurity';
import type { AppContractClient } from './contract';

export const API_V1_PREFIX = '/api/v1';

export type V1ClientOptions = Pick<
  RPCLinkOptions<Record<never, never>>,
  'origin' | 'headers' | 'fetch'
>;

export function createV1Link(options: V1ClientOptions = {}) {
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
      const request = { ...init, redirect: 'error' as const };
      const response = fetch
        ? await fetch(destination, request, context, path)
        : await globalThis.fetch(destination, request);
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
