import { SyncManager, useAuth, useStore } from '@repo/core';
import { getSessionIdentityMode } from '@repo/core/logic';

import { dispatchQueuedMutationToSovereignBus } from '@/lib/inngestEvents';

/** Starts foreground queue draining only after an active identity is available. */
export function AuthenticatedSyncService() {
  const { identityAvailability, session } = useAuth();
  const hasActiveIdentity = useStore((state) => state.user !== null);

  if (
    !session ||
    getSessionIdentityMode(session) !== 'authenticated' ||
    identityAvailability !== 'active' ||
    !hasActiveIdentity
  ) {
    return null;
  }

  return <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />;
}
