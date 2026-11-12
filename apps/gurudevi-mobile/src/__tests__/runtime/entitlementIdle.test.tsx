import { QueryClient, QueryClientProvider, skipToken } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ getEntitlements: vi.fn() }));
vi.mock('@repo/core/adapters/supabase/supabaseEntitlement.adapter', () => ({
  SupabaseEntitlementAdapter: class {
    getEntitlements(...args: unknown[]) {
      return fixture.getEntitlements(...args);
    }
  },
}));
vi.mock('@repo/core/lib/storageWrapper.adapter', () => ({
  SafeZustandStorage: { getItem: async () => null, setItem: async () => undefined },
}));

import { useEntitlementQuery } from '@repo/core/hooks/useEntitlementQuery';

describe('entitlement prerequisites', () => {
  afterEach(() => {
    cleanup();
    fixture.getEntitlements.mockReset();
  });

  it.each([
    [null, true],
    ['local-guest', false],
  ] as const)('keeps %s idle when enabled is %s', (principal, enabled) => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(() => useEntitlementQuery(principal, {}, enabled), { wrapper });

    expect(fixture.getEntitlements).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.manifestLoaded).toBe(false);
    expect(client.getQueryCache().getAll()).toHaveLength(1);
    expect(client.getQueryCache().getAll()[0]?.options.queryFn).toBe(skipToken);
    client.clear();
  });

  it('loads the real account after the prerequisite becomes ready', async () => {
    fixture.getEntitlements.mockResolvedValue({
      pricingTier: 'FREE',
      activeEntitlements: [],
      grants: [],
      expirationDate: null,
      refreshedAt: new Date().toISOString(),
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result, rerender } = renderHook(
      ({ ready }) => useEntitlementQuery('account-a', {}, ready),
      { wrapper, initialProps: { ready: false } },
    );
    expect(fixture.getEntitlements).not.toHaveBeenCalled();
    rerender({ ready: true });
    await waitFor(() => expect(result.current.manifestLoaded).toBe(true));
    expect(fixture.getEntitlements).toHaveBeenCalledTimes(1);
    expect(result.current.snapshotUserId).toBe('account-a');
    client.clear();
  });
});
