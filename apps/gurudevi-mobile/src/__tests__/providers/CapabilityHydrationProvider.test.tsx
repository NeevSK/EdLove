import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: {
    identityAvailability: 'active',
    loading: false,
    session: null as { user: { id: string } } | null,
  },
  user: { id: 'user-1' },
  perspective: { kind: 'personal' as const },
  loadEntitlements: vi.fn(async () => undefined),
  clearEntitlements: vi.fn(),
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

vi.mock('@repo/core/store/usePerspectiveStore', () => ({
  usePerspectiveStore: (
    selector: (state: { activePerspective: typeof mocks.perspective }) => unknown,
  ) => selector({ activePerspective: mocks.perspective }),
}));

vi.mock('@repo/core/store/useEntitlementStore', () => ({
  useEntitlementStore: (
    selector: (state: {
      loadEntitlements: typeof mocks.loadEntitlements;
      clearEntitlements: typeof mocks.clearEntitlements;
      error: string | null;
      isLoading: boolean;
    }) => unknown,
  ) =>
    selector({
      loadEntitlements: mocks.loadEntitlements,
      clearEntitlements: mocks.clearEntitlements,
      error: mocks.error,
      isLoading: mocks.isLoading,
    }),
}));

import { CapabilityHydrationProvider } from '@repo/core/providers/CapabilityHydrationProvider';

describe('CapabilityHydrationProvider (component-real scenarios)', () => {
  beforeEach(() => {
    mocks.auth.identityAvailability = 'active';
    mocks.auth.loading = false;
    mocks.auth.session = { user: { id: 'user-1' } };
    mocks.user = { id: 'user-1' };
    mocks.perspective = { kind: 'personal' };
    mocks.loadEntitlements.mockClear();
    mocks.clearEntitlements.mockClear();
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

    expect(mocks.loadEntitlements).toHaveBeenCalledWith('user-1', {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    });
    expect(mocks.clearEntitlements).not.toHaveBeenCalled();
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

    expect(mocks.loadEntitlements).not.toHaveBeenCalled();
    expect(mocks.clearEntitlements).not.toHaveBeenCalled();
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

    expect(mocks.clearEntitlements).toHaveBeenCalledTimes(1);
    expect(mocks.loadEntitlements).not.toHaveBeenCalled();
  });
});
