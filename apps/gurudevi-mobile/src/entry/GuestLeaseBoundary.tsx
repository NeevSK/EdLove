import { isLocalOnlyIdentity } from '@repo/core/logic';
import {
  authAPI,
  clearGuestLeaseData,
  clearLocalGuestIdentity,
  getOrCreateGuestLease,
  GuestDataManager,
} from '@repo/core/native';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useRouter } from 'expo-router';
import { type PropsWithChildren, useEffect } from 'react';

/** Enforces guest retention without changing which local features a guest may use. */
export function GuestLeaseBoundary({ children }: PropsWithChildren) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user || !isLocalOnlyIdentity(user)) return;
    const guestUserId = user.id;
    let active = true;
    void getOrCreateGuestLease(guestUserId).then(async (status) => {
      if (!active || !status.isExpired) return;
      await Promise.all([
        GuestDataManager.clearAllGuestData(),
        clearGuestLeaseData(guestUserId),
        clearLocalGuestIdentity(guestUserId),
        SafeZustandStorage.removeItem(`self:canvas-preferences:${guestUserId}`),
      ]);
      if (!active) return;
      await authAPI.signOut();
      if (active) router.replace('/welcome');
    });
    return () => {
      active = false;
    };
  }, [router, user]);

  return children;
}
