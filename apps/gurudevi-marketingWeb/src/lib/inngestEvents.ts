import {
  type SyncMutationQueuedPayload,
  sendSyncMutationQueued,
  sendWellbeingMoodLogged,
  type WellbeingMoodLoggedPayload,
} from '@repo/core';
import { inngest } from './inngest';

export function emitWellbeingMoodLogged(payload: WellbeingMoodLoggedPayload) {
  return sendWellbeingMoodLogged(inngest, payload);
}

export function emitSyncMutationQueued(payload: SyncMutationQueuedPayload) {
  return sendSyncMutationQueued(inngest, payload);
}
