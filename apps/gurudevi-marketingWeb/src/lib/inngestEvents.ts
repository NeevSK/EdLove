import {
  type SyncMutationQueuedPayload,
  sendSyncMutationQueued,
  sendWellbeingMoodLogged,
  type WellbeingMoodLoggedPayload,
} from '@repo/core/logic';
import { eventBus } from './inngest';

export function emitWellbeingMoodLogged(payload: WellbeingMoodLoggedPayload) {
  return sendWellbeingMoodLogged(eventBus, payload);
}

export function emitSyncMutationQueued(payload: SyncMutationQueuedPayload) {
  return sendSyncMutationQueued(eventBus, payload);
}
