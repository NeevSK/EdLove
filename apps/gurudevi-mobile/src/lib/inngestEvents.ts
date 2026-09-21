import {
  injectWorkflowEventBridge,
  type SchoolClassroomCreatedPayload,
  type SchoolGradePublishedPayload,
  type SyncMutationQueuedPayload,
  sendSchoolClassroomCreated,
  sendSchoolGradePublished,
  sendSyncMutationQueued,
  sendWellbeingMoodLogged,
  type WellbeingMoodLoggedPayload,
} from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import type { QueuedMutation, QueuedMutationDispatchResult } from '@repo/core/sync';
import { orpcClient } from '@repo/core/api/orpcClient';
import { getInngest } from '@/lib/inngest';

const REMOTE_SYNC_MUTATIONS = new Set(['saveJournalEntry', 'saveDecision', 'updateAttendance']);

export function emitWellbeingMoodLogged(payload: WellbeingMoodLoggedPayload) {
  return getInngest().then((inngest) => sendWellbeingMoodLogged(inngest, payload));
}

export function emitSyncMutationQueued(payload: SyncMutationQueuedPayload) {
  return getInngest().then((inngest) => sendSyncMutationQueued(inngest, payload));
}

export function emitSchoolGradePublished(payload: SchoolGradePublishedPayload) {
  return getInngest().then((inngest) => sendSchoolGradePublished(inngest, payload));
}

export function emitSchoolClassroomCreated(payload: SchoolClassroomCreatedPayload) {
  return getInngest().then((inngest) => sendSchoolClassroomCreated(inngest, payload));
}

export function installMobileWorkflowEventBridge() {
  injectWorkflowEventBridge({
    sendSchoolClassroomCreated: emitSchoolClassroomCreated,
    sendSchoolGradePublished: emitSchoolGradePublished,
    sendSyncMutationQueued: emitSyncMutationQueued,
    sendWellbeingMoodLogged: emitWellbeingMoodLogged,
  });
}

export async function dispatchQueuedMutationToSovereignBus(
  mutation: QueuedMutation,
): Promise<QueuedMutationDispatchResult> {
  if (!REMOTE_SYNC_MUTATIONS.has(mutation.name)) {
    return false;
  }

  const actorId = useAuthStore.getState().user?.id;
  if (!actorId) {
    throw new Error('Cannot dispatch a queued mutation without an authenticated actor.');
  }

  await emitSyncMutationQueued({
    mutationId: mutation.id,
    action: mutation.name,
    actorId,
    scope: mutation.scope,
    idempotencyKey: mutation.idempotencyKey,
    payload: mutation.variables,
    tenantId: undefined,
    eventId: mutation.id,
    correlationId: mutation.id,
    causationId: mutation.id,
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const receipt = await orpcClient.sync.getMutationReceipt({
      params: { mutationId: mutation.id },
    });
    if (receipt.status === 'completed') return 'dispatched';
    if (receipt.status === 'failed') {
      throw new Error(receipt.error || 'Queued mutation workflow failed.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return 'pending';
}
