import { v7 as uuidv7 } from 'uuid';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { hc } from 'hono/client';
import { assertSecureApiUrl, secureApiFetch } from './transportSecurity';

let tokenResolver: (() => Promise<string | null>) | null = null;
let activeBondIdResolver: (() => Promise<string | null>) | null = null;
let pqcWireEnabled = true;
let poaSigner: ((payload: string) => Promise<string | null>) | null = null;

export function registerTokenResolver(resolver: () => Promise<string | null>) {
  tokenResolver = resolver;
}

export function registerActiveBondIdResolver(resolver: () => Promise<string | null>) {
  activeBondIdResolver = resolver;
}

export function setPqcWireEnabled(enabled: boolean) {
  pqcWireEnabled = enabled;
}

export function registerPoaSigner(signer: (payload: string) => Promise<string | null>) {
  poaSigner = signer;
}

export function assertActiveRequestAccount(expectedAccountId?: string) {
  if (expectedAccountId && getActiveAccountId() !== expectedAccountId) {
    throw Object.assign(new Error('The owning account must remain active for this request.'), {
      status: 401,
    });
  }
}

/**
 * Applies session and selected-context headers to every first-party API
 * transport. The server treats context as a hint and resolves authority from
 * its own relationship records.
 */
export async function authenticatedSovereignFetch(
  input: RequestInfo | URL,
  requestInit?: RequestInit,
  expectedAccountId?: string,
): Promise<Response> {
  const requestUrl =
    typeof input === 'string' || input instanceof URL
      ? input
      : typeof Request !== 'undefined' && input instanceof Request
        ? input.url
        : String(input);
  assertSecureApiUrl(requestUrl);

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

  // Leaning towards Post-Quantum Cryptography (PQC) & Zero-Trust Wire
  if (pqcWireEnabled) {
    headers.set('x-pqc-kem', 'ML-KEM-768+X25519');
    headers.set('x-sovereign-epoch', String(Date.now()));
  }

  if (activeBondIdResolver) {
    try {
      const activeBondId = await activeBondIdResolver();
      if (activeBondId) headers.set('X-Active-Bond-Id', activeBondId);
    } catch {
      console.warn('[Sovereign Client] Active bond context retrieval failed.');
    }
  }

  assertActiveRequestAccount(expectedAccountId);

  if (poaSigner && requestInit?.body && typeof requestInit.body === 'string') {
    try {
      const poaSignature = await poaSigner(requestInit.body);
      if (poaSignature) headers.set('x-poa-sig', poaSignature);
    } catch {
      console.warn('[Sovereign Client] Proof-of-Authority signing failed.');
    }
  }

  const method = (
    requestInit?.method ?? (input instanceof Request ? input.method : 'GET')
  ).toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!headers.has('Idempotency-Key') && !headers.has('X-Idempotency-Key')) {
      const idempotencyKey = uuidv7();
      headers.set('Idempotency-Key', idempotencyKey);
      headers.set('X-Idempotency-Key', idempotencyKey);
    }
  }

  try {
    return await secureApiFetch(input, { ...requestInit, headers });
  } catch (error) {
    const isNetworkFailure =
      error instanceof TypeError ||
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error &&
        (error.name === 'AbortError' ||
          error.message.includes('abort') ||
          error.message.includes('fetch') ||
          error.message.includes('Network request failed') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Failed to fetch')));

    if (isNetworkFailure) {
      console.warn('[Sovereign Client] Network offline or endpoint unreachable.');
      return new Response(JSON.stringify({ error: 'Network unavailable', offline: true }), {
        status: 503,
        statusText: 'Service Unavailable (Offline)',
        headers: {
          'Content-Type': 'application/json',
          'X-Sovereign-Offline': 'true',
        },
      });
    }

    throw error;
  }
}

export function createSovereignClient<T extends import('hono').Hono<any, any, any>>(
  baseUrl: string,
): ReturnType<typeof hc<T>> {
  return hc<T>(baseUrl, {
    fetch: (input: RequestInfo | URL, requestInit?: RequestInit) => {
      assertSecureApiUrl(baseUrl);
      return authenticatedSovereignFetch(input, requestInit);
    },
  });
}

export type { InferRequestType, InferResponseType } from 'hono/client';
