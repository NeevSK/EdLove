import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  getEntitlements: vi.fn(),
  persisted: new Map<string, string>(),
}));

vi.mock('@repo/core/adapters/supabase/supabaseEntitlement.adapter', () => ({
  SupabaseEntitlementAdapter: class {
    getEntitlements(...args: unknown[]) {
      return fixture.getEntitlements(...args);
    }
  },
}));

vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: (key: string) => fixture.persisted.get(key) ?? null,
    setItem: async (key: string, value: string) => void fixture.persisted.set(key, value),
    removeItem: async (key: string) => void fixture.persisted.delete(key),
  },
}));

import {
  createEntitlementQueryOptions,
  ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
  type EntitlementIdentity,
} from './useEntitlementQuery';

const entitlement = (refreshedAt = new Date().toISOString()) => ({
  pricingTier: 'PRO' as const,
  activeEntitlements: ['journal.export'],
  expirationDate: null,
  grants: [],
  refreshedAt,
});

const identity: EntitlementIdentity = {
  principalId: 'account-a',
  activeBondId: 'bond-a',
  activeEntityId: 'school-a',
  activeEntityType: 'SCHOOL',
};

function storageKey(scope: EntitlementIdentity) {
  return `gurudevi-entitlement-query:${encodeURIComponent(JSON.stringify(scope))}`;
}

function cache(scope: EntitlementIdentity, snapshot = entitlement()) {
  fixture.persisted.set(storageKey(scope), JSON.stringify({ identity: scope, snapshot }));
}

describe('qualified entitlement query', () => {
  let client: QueryClient;

  beforeEach(() => {
    fixture.persisted.clear();
    fixture.getEntitlements.mockReset();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });
  afterEach(() => client.clear());

  it('keeps a fresh persisted snapshot available when the matching scope is offline', async () => {
    cache(identity);
    fixture.getEntitlements.mockRejectedValue(new Error('offline'));

    const result = await client.fetchQuery(createEntitlementQueryOptions(identity));

    expect(result.readiness).toBe('cached');
    expect(result.refreshError).toBe('offline');
    expect(result.identity).toEqual(identity);
  });

  it.each([
    ['different bond', { ...identity, activeBondId: 'bond-b' }],
    ['different entity', { ...identity, activeEntityId: 'school-b' }],
    ['different entity type', { ...identity, activeEntityType: 'CLASSROOM' }],
  ])('does not admit cached data for a %s', async (_label, wrongIdentity) => {
    cache(identity);
    fixture.getEntitlements.mockRejectedValue(new Error('offline'));

    await expect(client.fetchQuery(createEntitlementQueryOptions(wrongIdentity))).rejects.toThrow('offline');
    expect(client.getQueryData(createEntitlementQueryOptions(wrongIdentity).queryKey)).toBeUndefined();
  });

  it.each([
    ['expired', new Date(Date.now() - ENTITLEMENT_SNAPSHOT_MAX_AGE_MS - 1).toISOString()],
    ['future dated', new Date(Date.now() + 1_000).toISOString()],
  ])('rejects a %s persisted timestamp', async (_label, timestamp) => {
    cache(identity, entitlement(timestamp));
    fixture.getEntitlements.mockRejectedValue(new Error('offline'));

    await expect(client.fetchQuery(createEntitlementQueryOptions(identity))).rejects.toThrow('offline');
    expect(client.getQueryData(createEntitlementQueryOptions(identity).queryKey)).toBeUndefined();
  });

  it('does not publish a cancelled old-scope response after a scope transition', async () => {
    let resolveRequest: ((snapshot: ReturnType<typeof entitlement>) => void) | undefined;
    fixture.getEntitlements.mockImplementation(
      () => new Promise((resolve) => (resolveRequest = resolve)),
    );
    const options = createEntitlementQueryOptions(identity);
    const pending = client.fetchQuery(options).catch(() => undefined);

    await client.cancelQueries({ queryKey: options.queryKey });
    resolveRequest?.(entitlement());
    await pending;

    expect(client.getQueryData(options.queryKey)).toBeUndefined();
    expect(fixture.persisted.has(storageKey(identity))).toBe(false);
  });
});
