import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: {
    identityAvailability: 'active',
    loading: false,
    resolvedAuthSubjectId: 'user-1',
    session: null as { user: { id: string; is_anonymous?: boolean } } | null,
  },
  user: { id: 'user-1' },
  scope: {
    snapshot: { principalId: 'user-1', activeBond: null } as
      | { principalId: string; activeBond: unknown }
      | null,
    isTransitioning: false,
  },
  entitlementQuery: vi.fn(() => ({ error: null, isLoading: false, refetch: vi.fn() })),
  error: null as string | null,
  isLoading: false,
}));

vi.mock('@repo/core/providers/AuthProvider', () => ({
  useAuth: () => mocks.auth,
}));

vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: typeof mocks.user }) => unknown) =>
    selector({ user: mocks.user }),
}));

vi.mock('@repo/core/store/scopeSession', () => ({
  PERSONAL_SCOPE_PERSPECTIVE: { id: 'personal', kind: 'personal', displayName: 'Personal Sanctuary' },
  useScopeSessionStore: (selector: (state: typeof mocks.scope) => unknown) =>
    selector(mocks.scope),
}));

vi.mock('@repo/core/hooks/useEntitlementQuery', () => ({
  useEntitlementQuery: mocks.entitlementQuery,
}));

import { CapabilityHydrationProvider } from '@repo/core/providers/CapabilityHydrationProvider';

describe('CapabilityHydrationProvider (component-real scenarios)', () => {
  beforeEach(() => {
    mocks.auth.identityAvailability = 'active';
    mocks.auth.loading = false;
    mocks.auth.resolvedAuthSubjectId = 'user-1';
    mocks.auth.session = { user: { id: 'user-1' } };
    mocks.user = { id: 'user-1' };
    mocks.scope.snapshot = { principalId: 'user-1', activeBond: null };
    mocks.entitlementQuery.mockClear();
  });

  it('hydrates free capability state for the active personal account', async () => {
    await act(async () => {
      create(
        <CapabilityHydrationProvider>
          <>{'baseline shell'}</>
        </CapabilityHydrationProvider>,
      );
      await Promise.resolve();
    });

    expect(mocks.entitlementQuery).toHaveBeenCalledWith('user-1', {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    }, true);
  });

  it('keeps cached capability state while auth is still booting', async () => {
    mocks.auth.loading = true;

    await act(async () => {
      create(
        <CapabilityHydrationProvider>
          <>{'baseline shell'}</>
        </CapabilityHydrationProvider>,
      );
      await Promise.resolve();
    });

    expect(mocks.entitlementQuery).toHaveBeenCalledWith('user-1', {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    }, false);
  });

  it('clears capability state after the account signs out', async () => {
    mocks.auth.session = null;
    mocks.user = { id: '' };

    await act(async () => {
      create(
        <CapabilityHydrationProvider>
          <>{'baseline shell'}</>
        </CapabilityHydrationProvider>,
      );
      await Promise.resolve();
    });

    expect(mocks.entitlementQuery).toHaveBeenCalledWith('', {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    }, false);
  });

  it('does not hydrate cloud capabilities for an admitted anonymous guest', async () => {
    mocks.auth.session = { user: { id: 'guest-1', is_anonymous: true } };
    mocks.user = { id: 'guest-1' };

    await act(async () => {
      create(
        <CapabilityHydrationProvider>
          <>{'guest shell'}</>
        </CapabilityHydrationProvider>,
      );
      await Promise.resolve();
    });

    expect(mocks.entitlementQuery).toHaveBeenCalledWith('guest-1', {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    }, false);
  });
});
