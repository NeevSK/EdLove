import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  discardGuestSession: vi.fn(),
  getLease: vi.fn(),
  getLocalIdentity: vi.fn(),
  user: { id: 'guest-a', is_anonymous: true } as { id: string; is_anonymous: boolean } | null,
}));

vi.mock('@repo/core/logic', () => ({
  isLocalOnlyIdentity: (user: { is_anonymous?: boolean }) => user.is_anonymous === true,
}));
vi.mock('@repo/core/native', () => ({
  discardLocalGuestSession: mocks.discardGuestSession,
  getOrCreateGuestLease: mocks.getLease,
}));
vi.mock('@repo/core/native/guestIdentity', () => ({
  getLocalGuestIdentity: mocks.getLocalIdentity,
}));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { user: typeof mocks.user }) => unknown) =>
    selector({ user: mocks.user }),
}));

import { GuestLeaseBoundary } from '@/entry/GuestLeaseBoundary';

async function mountBoundary() {
  await act(async () => {
    create(
      <GuestLeaseBoundary>
        <>{'guest-content'}</>
      </GuestLeaseBoundary>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('GuestLeaseBoundary', () => {
  beforeEach(() => {
    mocks.user = { id: 'guest-a', is_anonymous: true };
    mocks.discardGuestSession.mockReset().mockResolvedValue(undefined);
    mocks.getLease.mockReset().mockResolvedValue({ isExpired: true });
    mocks.getLocalIdentity.mockReset().mockResolvedValue({
      onboarding_completed: true,
      activeBond: { capacity: 'student' },
    });
  });

  it('delegates expired guest cleanup and session revocation to the shared operation', async () => {
    await mountBoundary();

    expect(mocks.discardGuestSession).toHaveBeenCalledWith('guest-a');
  });

  it('contains a shared cleanup failure at the lease boundary', async () => {
    mocks.discardGuestSession.mockRejectedValueOnce(new Error('storage unavailable'));

    await mountBoundary();

    expect(mocks.discardGuestSession).toHaveBeenCalledWith('guest-a');
  });

  it('retains a guest whose lease is still active', async () => {
    mocks.getLease.mockResolvedValueOnce({ isExpired: false });

    await mountBoundary();

    expect(mocks.discardGuestSession).not.toHaveBeenCalled();
  });
});
