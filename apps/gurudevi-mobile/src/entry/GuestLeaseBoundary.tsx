import { isLocalOnlyIdentity } from '@repo/core/logic';
import {
  authAPI,
  clearGuestLeaseData,
  clearLocalGuestIdentity,
  getOrCreateGuestLease,
  GuestDataManager,
} from '@repo/core/native';
import { getLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { type PropsWithChildren, useEffect } from 'react';

/** Enforces guest retention without changing which local features a guest may use. */
export function GuestLeaseBoundary({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user || !isLocalOnlyIdentity(user)) return;
    const guestUserId = user.id;
    let active = true;
    void getLocalGuestIdentity(guestUserId)
      .then(async (identity) => {
        if (!identity.onboarding_completed || !identity.activeBond?.capacity) return null;
        return getOrCreateGuestLease(guestUserId);
      })
      .then(async (status) => {
        if (!active || !status || !status.isExpired) return;
        await Promise.all([
          GuestDataManager.clearAllGuestData(),
          clearGuestLeaseData(guestUserId),
          clearLocalGuestIdentity(guestUserId),
          SafeZustandStorage.removeItem(`self:canvas-preferences:${guestUserId}`),
        ]);
        if (!active) return;
        await authAPI.signOut();
      })
      .catch((error: unknown) => {
        console.error('[guest lease] expiry cleanup failed:', error);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return children;
}
