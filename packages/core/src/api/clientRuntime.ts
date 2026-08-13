import { hc } from 'hono/client';

let tokenResolver: (() => Promise<string | null>) | null = null;
let activeBondIdResolver: (() => Promise<string | null>) | null = null;

export function registerTokenResolver(resolver: () => Promise<string | null>) {
  tokenResolver = resolver;
}

export function registerActiveBondIdResolver(resolver: () => Promise<string | null>) {
  activeBondIdResolver = resolver;
}

export function createSovereignClient<T extends import('hono').Hono<any, any, any>>(
  baseUrl: string,
): ReturnType<typeof hc<T>> {
  return hc<T>(baseUrl, {
    fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
      let token: string | null = null;
      if (tokenResolver) {
        try {
          token = await tokenResolver();
        } catch (err) {
          console.warn('[Sovereign Client] Failed to retrieve session token via resolver:', err);
        }
      }

      const headers = new Headers(requestInit?.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);

      if (activeBondIdResolver) {
        try {
          const activeBondId = await activeBondIdResolver();
          if (activeBondId) headers.set('X-Active-Bond-Id', activeBondId);
        } catch (err) {
          console.warn('[Sovereign Client] Failed to retrieve active bond context:', err);
        }
      }

      return fetch(input, { ...requestInit, headers });
    },
  });
}

export type { InferRequestType, InferResponseType } from 'hono/client';
