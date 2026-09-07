import { SyncManager, useAuth, useStore } from '@repo/core';

import { dispatchQueuedMutationToSovereignBus } from '@/lib/inngestEvents';

/** Starts foreground queue draining only after an active identity is available. */
export function AuthenticatedSyncService() {
  const { identityAvailability, session } = useAuth();
  const hasActiveIdentity = useStore((state) => state.user !== null);

  if (!session || identityAvailability !== 'active' || !hasActiveIdentity) {
    return null;
  }

  return <SyncManager dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus} />;
}
