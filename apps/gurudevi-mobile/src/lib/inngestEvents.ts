/**
 * Gurudevi Mobile Sovereign Event Bridge
 *
 * Emits and drains offline queue mutations through the sovereign oRPC client
 * without direct dependency on third-party event queues or public event keys.
 */
import {
  injectWorkflowEventBridge,
  type SchoolClassroomCreatedPayload,
  type SchoolGradePublishedPayload,
  type SyncMutationQueuedPayload,
  type WellbeingMoodLoggedPayload,
} from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import type { QueuedMutation, QueuedMutationDispatchResult } from '@repo/core/sync';
import { orpcClient } from '@repo/core/api/orpcClient';

const REMOTE_SYNC_MUTATIONS = new Set(['saveJournalEntry', 'saveDecision', 'updateAttendance']);

export async function emitWellbeingMoodLogged(payload: WellbeingMoodLoggedPayload): Promise<void> {
  try {
    await orpcClient.events.dispatch({
      body: {
        name: 'wellbeing/mood.logged',
        data: payload as unknown as Record<string, unknown>,
      },
    });
  } catch (error) {
    console.warn('[EventBridge] Failed to dispatch wellbeing/mood.logged:', error);
  }
}

export async function emitSyncMutationQueued(payload: SyncMutationQueuedPayload): Promise<void> {
  try {
    await orpcClient.events.dispatch({
      body: {
        name: 'sync/mutation.queued',
        data: payload as unknown as Record<string, unknown>,
      },
    });
  } catch (error) {
    console.warn('[EventBridge] Failed to dispatch sync/mutation.queued:', error);
  }
}

export async function emitSchoolGradePublished(payload: SchoolGradePublishedPayload): Promise<void> {
  try {
    await orpcClient.events.dispatch({
      body: {
        name: 'school/grade.published',
        data: payload as unknown as Record<string, unknown>,
      },
    });
  } catch (error) {
    console.warn('[EventBridge] Failed to dispatch school/grade.published:', error);
  }
}

export async function emitSchoolClassroomCreated(payload: SchoolClassroomCreatedPayload): Promise<void> {
  try {
    await orpcClient.events.dispatch({
      body: {
        name: 'school/classroom.created',
        data: payload as unknown as Record<string, unknown>,
      },
    });
  } catch (error) {
    console.warn('[EventBridge] Failed to dispatch school/classroom.created:', error);
  }
}

export function installMobileWorkflowEventBridge(): void {
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

  try {
    const response = await orpcClient.sync.uploadBatch({
      body: {
        idempotencyKey: mutation.idempotencyKey || mutation.id,
        crud: [
          {
            id: mutation.id,
            op: 'PUT',
            table: mutation.scope || 'generic_mutations',
            opData: (mutation.variables as Record<string, unknown>) || {},
          },
        ],
      },
    });

    if (response.success) {
      return 'dispatched';
    }
  } catch (error) {
    console.warn('[Sync] Sovereign batch upload deferred to retry:', error);
    return 'pending';
  }

  return 'pending';
}
