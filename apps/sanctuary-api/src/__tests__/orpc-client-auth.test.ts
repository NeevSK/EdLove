import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  registerActiveBondIdResolver,
  registerTokenResolver,
} from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';

describe('shared oRPC client authentication', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    registerTokenResolver(async () => null);
    registerActiveBondIdResolver(async () => null);
  });

  it('forwards registered session and active-context headers through the RPC transport', async () => {
    registerTokenResolver(async () => 'signed-test-token');
    registerActiveBondIdResolver(async () => 'bond-123');

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      return new Response(JSON.stringify({ json: null }), {
        headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(orpcClient.rewards.getRewards({})).resolves.toBeNull();

    const requestInit = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(requestInit?.headers);
    expect(headers.get('authorization')).toBe('Bearer signed-test-token');
    expect(headers.get('x-active-bond-id')).toBe('bond-123');
  });
});
