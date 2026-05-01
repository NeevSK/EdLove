import { SyncMutationQueuedPayload, WellbeingMoodLoggedPayload, sendSyncMutationQueued, sendWellbeingMoodLogged } from '@repo/core/logic';
import { inngest } from './inngest';

export function emitWellbeingMoodLogged(payload: WellbeingMoodLoggedPayload) {
  return sendWellbeingMoodLogged(inngest, payload);
}

export function emitSyncMutationQueued(payload: SyncMutationQueuedPayload) {
  return sendSyncMutationQueued(inngest, payload);
}
