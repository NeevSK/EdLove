import { SyncManager, type SyncManagerTraceEvent, useAuth, useStore } from '@repo/core';
import { getSessionIdentityMode } from '@repo/core/logic';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';
import { dispatchQueuedMutationToSovereignBus } from '@/lib/inngestEvents';

function recordOutboxTrace(event: SyncManagerTraceEvent): void {
  recordDevelopmentTrace({ category: 'outbox', ...event });
}

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

  return (
    <SyncManager
      dispatchQueuedMutation={dispatchQueuedMutationToSovereignBus}
      onTrace={__DEV__ ? recordOutboxTrace : undefined}
    />
  );
}
