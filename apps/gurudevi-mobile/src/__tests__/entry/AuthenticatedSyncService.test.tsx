import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  dispatchQueuedMutationToSovereignBus: vi.fn(),
  syncManager: vi.fn(() => null),
  useAuth: vi.fn(),
  useStore: vi.fn(),
}));

vi.mock('@repo/core/logic', () => ({
  useAuth: mocks.useAuth,
  useStore: mocks.useStore,
}));

vi.mock('@repo/core', () => ({
  SyncManager: mocks.syncManager,
  useAuth: mocks.useAuth,
  useStore: mocks.useStore,
}));

vi.mock('@/lib/inngestEvents', () => ({
  dispatchQueuedMutationToSovereignBus: mocks.dispatchQueuedMutationToSovereignBus,
}));

import { AuthenticatedSyncService } from '@/entry/AuthenticatedSyncService';

function renderService({
  hasActiveIdentity,
  identityAvailability,
  session,
}: {
  hasActiveIdentity: boolean;
  identityAvailability: 'active' | 'inactive' | 'unknown';
  session: object | null;
}) {
  mocks.useAuth.mockReturnValue({ identityAvailability, session });
  mocks.useStore.mockImplementation((selector: (state: { user: object | null }) => unknown) =>
    selector({ user: hasActiveIdentity ? { id: 'citizen-1' } : null }),
  );

  act(() => {
    create(<AuthenticatedSyncService />);
  });
}

describe('AuthenticatedSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not start queue draining before an active identity is resolved', () => {
    renderService({ hasActiveIdentity: false, identityAvailability: 'unknown', session: null });
    renderService({ hasActiveIdentity: false, identityAvailability: 'inactive', session: {} });

    expect(mocks.syncManager).not.toHaveBeenCalled();
  });

  it('starts the existing queue drain only for an authenticated active identity', () => {
    renderService({ hasActiveIdentity: true, identityAvailability: 'active', session: {} });

    expect(mocks.syncManager).toHaveBeenCalledWith(
      { dispatchQueuedMutation: mocks.dispatchQueuedMutationToSovereignBus },
      undefined,
    );
  });
});
