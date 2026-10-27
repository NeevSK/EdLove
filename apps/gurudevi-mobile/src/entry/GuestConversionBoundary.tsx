import { getSessionIdentityMode, useAuth } from '@repo/core/logic';
import { GuestDataSync } from '@repo/core/native';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import {
  bindGuestConversionTarget,
  clearGuestConversionRecord,
  discardGuestConversion,
  readGuestConversionRecord,
} from '@repo/core/native/guestConversionLedger';
import GuestDataSyncModal from '@repo/ui/components/GuestDataSyncModal';
import { useEffect, useState } from 'react';

/**
 * Recovers guest work after an external auth callback, including a cold restart.
 * It deliberately lives beside the session gate: auth routes stay simple and the
 * migration is available after email, password, and OAuth authentication alike.
 */
export function GuestConversionBoundary() {
  const { resolvedAuthSubjectId, session } = useAuth();
  const profile = useAuthStore((state) => state.user);
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
    readGuestConversionRecord()
      .then(async (record) => {
        if (!record) return false;
        const targetUser = session?.user;
        if (!targetUser || targetUser.is_anonymous === true) return false;
        await bindGuestConversionTarget(record.sourceGuestId, {
          id: targetUser.id,
          is_anonymous: false,
        });
        return GuestDataSync.hasGuestData(record.sourceGuestId);
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
  }, [isPermanentSession, session?.user]);

  if (!profile?.id) return null;

  return (
    <GuestDataSyncModal
      isOpen={isPermanentSession && isOpen}
      userId={profile.id}
      onClose={() => setIsOpen(false)}
      onSyncComplete={() => setIsOpen(false)}
      onSkipEmpty={clearGuestConversionRecord}
      onDiscard={discardGuestConversion}
    />
  );
}
