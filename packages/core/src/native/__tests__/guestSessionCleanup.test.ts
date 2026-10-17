import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearGuestLeaseData: vi.fn(),
  clearLocalGuestIdentity: vi.fn(),
  clearAllGuestData: vi.fn(),
  removeItem: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@repo/core/api/auth', () => ({ authAPI: { signOut: mocks.signOut } }));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: { removeItem: mocks.removeItem },
}));
vi.mock('@repo/core/native/guestDataManager', () => ({
  GuestDataManager: { clearAllGuestData: mocks.clearAllGuestData },
}));
vi.mock('@repo/core/native/guestIdentity', () => ({
  clearLocalGuestIdentity: mocks.clearLocalGuestIdentity,
}));
vi.mock('@repo/core/native/guestLease', () => ({
  clearGuestLeaseData: mocks.clearGuestLeaseData,
}));

import { discardLocalGuestSession } from '@repo/core/native/guestSessionCleanup';

describe('discardLocalGuestSession', () => {
  beforeEach(() => {
    mocks.clearAllGuestData.mockReset().mockResolvedValue(undefined);
    mocks.clearGuestLeaseData.mockReset().mockResolvedValue(undefined);
    mocks.clearLocalGuestIdentity.mockReset().mockResolvedValue(undefined);
    mocks.removeItem.mockReset().mockResolvedValue(undefined);
    mocks.signOut.mockReset().mockResolvedValue(undefined);
  });

  it('removes all local guest traces before revoking the device session', async () => {
    await discardLocalGuestSession('guest-a');

    expect(mocks.clearAllGuestData).toHaveBeenCalledTimes(1);
    expect(mocks.clearGuestLeaseData).toHaveBeenCalledWith('guest-a');
    expect(mocks.clearLocalGuestIdentity).toHaveBeenCalledWith('guest-a');
    expect(mocks.removeItem).toHaveBeenCalledWith('self:canvas-preferences:guest-a');
    expect(mocks.signOut).toHaveBeenCalledWith();
  });

  it('still revokes the device session when a local cleanup operation fails', async () => {
    mocks.clearAllGuestData.mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(discardLocalGuestSession('guest-a')).rejects.toThrow('storage unavailable');

    expect(mocks.signOut).toHaveBeenCalledWith();
  });
});
