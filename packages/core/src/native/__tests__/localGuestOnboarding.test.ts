import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearAllGuestData: vi.fn(),
  clearGuestLeaseData: vi.fn(),
  clearLocalGuestIdentity: vi.fn(),
  clearLocalGuestSession: vi.fn(),
  getLocalGuestIdentity: vi.fn(),
  setGuestScope: vi.fn(),
  updateLocalGuestIdentity: vi.fn(),
}));

vi.mock('@repo/core/native/guestDataManager', () => ({
  GuestDataManager: { clearAllGuestData: mocks.clearAllGuestData },
}));
vi.mock('@repo/core/native/guestIdentity', () => ({
  clearLocalGuestIdentity: mocks.clearLocalGuestIdentity,
  getLocalGuestIdentity: mocks.getLocalGuestIdentity,
  updateLocalGuestIdentity: mocks.updateLocalGuestIdentity,
}));
vi.mock('@repo/core/native/guestLease', () => ({
  clearGuestLeaseData: mocks.clearGuestLeaseData,
}));
vi.mock('@repo/core/native/guestScope', () => ({ setGuestScope: mocks.setGuestScope }));
vi.mock('@repo/core/native/localGuestSession', () => ({
  clearLocalGuestSession: mocks.clearLocalGuestSession,
  isLocalGuestSessionId: (value: unknown) => value === 'local-9ac0f584-4299-4b23-ae2c-5846be605c26',
}));

import {
  completeLocalGuestOnboarding,
  createLocalGuestInitialBond,
  discardLocalGuestOnboarding,
} from '../localGuestOnboarding';

const LOCAL_GUEST_ID = 'local-9ac0f584-4299-4b23-ae2c-5846be605c26';

describe('device-local guest onboarding', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'bond-uuid') });
    mocks.clearAllGuestData.mockReset().mockResolvedValue(undefined);
    mocks.clearGuestLeaseData.mockReset().mockResolvedValue(undefined);
    mocks.clearLocalGuestIdentity.mockReset().mockResolvedValue(undefined);
    mocks.clearLocalGuestSession.mockReset().mockResolvedValue(undefined);
    mocks.getLocalGuestIdentity.mockReset().mockResolvedValue({
      activeBond: { capacity: 'student' },
    });
    mocks.setGuestScope.mockReset();
    mocks.updateLocalGuestIdentity.mockReset().mockResolvedValue(undefined);
  });

  it('creates its initial bond locally without an auth session or remote API', async () => {
    await createLocalGuestInitialBond(LOCAL_GUEST_ID, 'student', { displayName: 'Asha' });

    expect(mocks.setGuestScope).toHaveBeenCalledWith(LOCAL_GUEST_ID);
    expect(mocks.updateLocalGuestIdentity).toHaveBeenCalledWith(
      LOCAL_GUEST_ID,
      expect.objectContaining({
        display_name: 'Asha',
        activeBond: expect.objectContaining({
          id: 'local-bond-bond-uuid',
          user_id: LOCAL_GUEST_ID,
          capacity: 'student',
        }),
      }),
    );
  });

  it('requires the local bond before admitting the guest', async () => {
    mocks.getLocalGuestIdentity.mockResolvedValueOnce({ activeBond: null });

    await expect(completeLocalGuestOnboarding(LOCAL_GUEST_ID)).rejects.toThrow(/primary capacity/);
    expect(mocks.updateLocalGuestIdentity).not.toHaveBeenCalled();
  });

  it('discard wipes the local payload before removing the local principal', async () => {
    await discardLocalGuestOnboarding(LOCAL_GUEST_ID);

    expect(mocks.clearAllGuestData).toHaveBeenCalledBefore(mocks.clearLocalGuestSession);
    expect(mocks.clearGuestLeaseData).toHaveBeenCalledWith(LOCAL_GUEST_ID);
    expect(mocks.clearLocalGuestIdentity).toHaveBeenCalledWith(LOCAL_GUEST_ID);
  });
});
