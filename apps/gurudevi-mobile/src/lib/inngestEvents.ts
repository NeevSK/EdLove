import {
  injectWorkflowEventBridge,
  type QueuedMutation,
  type QueuedMutationDispatchResult,
  type SchoolClassroomCreatedPayload,
  type SchoolGradePublishedPayload,
  type SyncMutationQueuedPayload,
  sendSchoolClassroomCreated,
  sendSchoolGradePublished,
  sendSyncMutationQueued,
  sendWellbeingMoodLogged,
  type WellbeingMoodLoggedPayload,
} from '@repo/core';
import { inngest } from './inngest';

const REMOTE_SYNC_MUTATIONS = new Set(['saveJournalEntry', 'saveDecision', 'updateAttendance']);

export function emitWellbeingMoodLogged(payload: WellbeingMoodLoggedPayload) {
  return sendWellbeingMoodLogged(inngest, payload);
}

export function emitSyncMutationQueued(payload: SyncMutationQueuedPayload) {
  return sendSyncMutationQueued(inngest, payload);
}

export function emitSchoolGradePublished(payload: SchoolGradePublishedPayload) {
  return sendSchoolGradePublished(inngest, payload);
}

export function emitSchoolClassroomCreated(payload: SchoolClassroomCreatedPayload) {
  return sendSchoolClassroomCreated(inngest, payload);
}

export function installMobileWorkflowEventBridge() {
  injectWorkflowEventBridge({
    sendSchoolClassroomCreated: emitSchoolClassroomCreated,
    sendSchoolGradePublished: emitSchoolGradePublished,
    sendSyncMutationQueued: emitSyncMutationQueued,
    sendWellbeingMoodLogged: emitWellbeingMoodLogged,
  });
}

export async function dispatchQueuedMutationToInngest(
  mutation: QueuedMutation,
): Promise<QueuedMutationDispatchResult> {
  if (!REMOTE_SYNC_MUTATIONS.has(mutation.name)) {
    return false;
  }

  await emitSyncMutationQueued({
    mutationId: mutation.id,
    action: mutation.name,
    scope: mutation.scope,
    idempotencyKey: mutation.idempotencyKey,
    payload: mutation.variables,
    tenantId: undefined,
    eventId: mutation.id,
    correlationId: mutation.id,
    causationId: mutation.id,
  });

  return 'dispatched';
}
