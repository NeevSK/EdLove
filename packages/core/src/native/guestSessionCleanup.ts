import { authAPI } from '@repo/core/auth';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper.adapter';
import { GuestStorage } from '@repo/core/native/guestStorage';
import { GuestDataSync } from '@repo/core/native/guestDataSync';
import { clearLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { clearGuestLeaseData } from '@repo/core/native/guestLease';

/**
 * Removes the local trace of an anonymous session before revoking its device session.
 *
 * Session revocation deliberately runs after every cleanup attempt, so an incomplete
 * local cleanup can never leave the guest admitted to the application.
 */
export async function discardLocalGuestSession(userId: string): Promise<void> {
  const cleanup = await Promise.allSettled([
    GuestStorage.clearAllGuestData(),
    GuestDataSync.clearPendingGuestSession(),
    clearGuestLeaseData(userId),
    clearLocalGuestIdentity(userId),
    SafeZustandStorage.removeItem(`self:canvas-preferences:${userId}`),
  ]);

  await authAPI.signOut();

  const failedCleanup = cleanup.find((result) => result.status === 'rejected');
  if (failedCleanup?.status === 'rejected') {
    throw failedCleanup.reason;
  }
}
