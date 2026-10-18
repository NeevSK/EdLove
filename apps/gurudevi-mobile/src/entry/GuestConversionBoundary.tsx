import { getSessionIdentityMode, useAuth, useStore } from '@repo/core/logic';
import { GuestDataSync } from '@repo/core/native';
import GuestDataSyncModal from '@repo/ui/components/GuestDataSyncModal';
import { useEffect, useState } from 'react';

/**
 * Recovers guest work after an external auth callback, including a cold restart.
 * It deliberately lives beside the session gate: auth routes stay simple and the
 * migration is available after email, password, and OAuth authentication alike.
 */
export function GuestConversionBoundary() {
  const { resolvedAuthSubjectId, session } = useAuth();
  const profile = useStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const isPermanentSession =
    getSessionIdentityMode(session) === 'authenticated' &&
    resolvedAuthSubjectId === session?.user.id &&
    Boolean(profile?.id);

  useEffect(() => {
    if (!isPermanentSession) {
      return;
    }

    let active = true;
    GuestDataSync.restorePendingGuestSession()
      .then(async (guestUserId) => {
        if (!guestUserId) return false;
        return GuestDataSync.hasGuestData(guestUserId);
      })
      .then((hasGuestData) => {
        if (active) setIsOpen(hasGuestData);
        return hasGuestData;
      })
      .catch((error: unknown) => {
        console.warn('[guest-conversion] unable to recover pending guest data:', error);
      });

    return () => {
      active = false;
    };
  }, [isPermanentSession]);

  if (!profile?.id) return null;

  return (
    <GuestDataSyncModal
      isOpen={isPermanentSession && isOpen}
      userId={profile.id}
      onClose={() => setIsOpen(false)}
      onSyncComplete={() => setIsOpen(false)}
      onSkipEmpty={() => GuestDataSync.clearPendingGuestSession()}
      onDiscard={() => GuestDataSync.discardPendingGuestData()}
    />
  );
}
