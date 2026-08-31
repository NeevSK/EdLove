import { hc } from 'hono/client';

let tokenResolver: (() => Promise<string | null>) | null = null;
let activeBondIdResolver: (() => Promise<string | null>) | null = null;

export function registerTokenResolver(resolver: () => Promise<string | null>) {
  tokenResolver = resolver;
}

export function registerActiveBondIdResolver(resolver: () => Promise<string | null>) {
  activeBondIdResolver = resolver;
}

/**
 * Applies session and selected-context headers to every first-party API
 * transport. The server treats context as a hint and resolves authority from
 * its own relationship records.
 */
export async function authenticatedSovereignFetch(
  input: RequestInfo | URL,
  requestInit?: RequestInit,
): Promise<Response> {
  let token: string | null = null;
  if (tokenResolver) {
    try {
      token = await tokenResolver();
    } catch {
      console.warn('[Sovereign Client] Session token retrieval failed.');
    }
  }

  const headers = new Headers(requestInit?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (activeBondIdResolver) {
    try {
      const activeBondId = await activeBondIdResolver();
      if (activeBondId) headers.set('X-Active-Bond-Id', activeBondId);
    } catch {
      console.warn('[Sovereign Client] Active bond context retrieval failed.');
    }
  }

  return fetch(input, { ...requestInit, headers });
}

export function createSovereignClient<T extends import('hono').Hono<any, any, any>>(
  baseUrl: string,
): ReturnType<typeof hc<T>> {
  return hc<T>(baseUrl, {
    fetch: authenticatedSovereignFetch,
  });
}

export type { InferRequestType, InferResponseType } from 'hono/client';
