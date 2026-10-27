import {
  ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
  entitlementQueryKey,
  useEntitlementQuery,
} from '@repo/core/hooks/useEntitlementQuery';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@repo/core/adapters/supabase/supabaseEntitlement.adapter', () => ({
  SupabaseEntitlementAdapter: class {
    async getEntitlements() {
      throw new Error('offline');
    }
  },
}));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: { getItem: async () => null, setItem: async () => undefined },
}));

describe('mounted entitlement expiry', () => {
  afterEach(() => vi.useRealTimers());

  it('withdraws plan, grant and snapshot access at their own deadlines without a network response', async () => {
    vi.useFakeTimers();
    const now = Date.parse('2026-10-26T10:00:00Z');
    vi.setSystemTime(now);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const identity = {
      principalId: 'account-a',
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    };
    client.setQueryData(entitlementQueryKey(identity), {
      identity,
      refreshedAt: new Date(now - ENTITLEMENT_SNAPSHOT_MAX_AGE_MS + 300).toISOString(),
      expirationDate: new Date(now + 100).toISOString(),
      pricingTier: 'PRO',
      activeEntitlements: ['export'],
      readiness: 'cached',
      refreshError: null,
      grants: [
        {
          id: 'bond-grant',
          scope: 'active_bond',
          scopeId: 'bond-a',
          tier: 'PRO',
          modules: ['classroom'],
          status: 'ACTIVE',
          expiresAt: new Date(now + 200).toISOString(),
        },
      ],
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const view = renderHook(() => useEntitlementQuery('account-a', {}, true), { wrapper });
    expect(view.result.current.pricingTier).toBe('PRO');
    expect(view.result.current.grants).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(view.result.current.pricingTier).toBe('FREE');
    expect(view.result.current.activeEntitlements).toEqual([]);
    expect(view.result.current.grants).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(view.result.current.grants).toEqual([]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(view.result.current.manifestLoaded).toBe(false);
    view.unmount();
    client.clear();
  });
});
