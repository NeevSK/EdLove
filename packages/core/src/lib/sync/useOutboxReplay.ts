import { ConflictError } from '@repo/core/effect/Errors';
import { eventBus as sovereignBus } from '@repo/core/effect/bindings/state';
import { feedback } from '@repo/core/effect/bindings/feedback';
import { outboxPlatform } from '@repo/core/effect/bindings/outbox';
import { classifyError } from '@repo/core/lib/sync/errorClassifier';
import { decideReplayFailure } from '@repo/core/lib/sync/replayDecision';
import { useMutationAuditLog } from '@repo/core/lib/sync/mutationAuditLog.store';
import { migrateQueuedMutation } from '@repo/core/lib/sync/outboxMigration';
import { MUTATION_REGISTRY } from '@repo/core/lib/sync/registry';
import {
  isReplayAdmissionOpen,
  subscribeReplayAdmission,
  tryBeginReplay,
} from '@repo/core/lib/sync/replayAdmission';
import {
  isMutationReplayDeferred,
  planMutationReplay,
} from '@repo/core/lib/sync/replayPolicy.coordinator';
import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { useVersionGatingStore } from '@repo/core/lib/sync/versionGating.store';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import type { QueuedMutation, QueuedMutationDispatchResult } from '@repo/core/types/mutationQueue';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

const { isReplayPrincipalCurrent, leaveBreadcrumb } = outboxPlatform;

/**
 * useOutboxReplay
 *
 * The outbox drain: replays queued mutations for the signed-in account while it is online and
 * replay is admitted. Mounted by the headless SyncOrchestrator component; the replay rules for
 * each failed item come from replayDecision.ts, shared with the mobile background task.
 * Upgraded with:
 * - Exponential Backoff (Temporal pacing)
 * - Error Classification (Resonant Outcomes)
 * - Dead Letter Queue (Reparative recovery)
 * - Audit Log synchronization
 */
export interface OutboxReplayOptions {
  /**
   * A custom dispatcher is permitted only when it resolves after a durable
   * server receipt. Event-enqueue acknowledgement is not command settlement.
   */
  dispatchQueuedMutation?: (
    mutation: QueuedMutation,
  ) => Promise<QueuedMutationDispatchResult> | QueuedMutationDispatchResult;
  /** Optional observer for fixed-field local diagnostics; never receives IDs or payloads. */
  onTrace?: (event: SyncOrchestratorTraceEvent) => void;
}

export interface SyncOrchestratorTraceEvent {
  event: 'drain' | 'item';
  state: 'started' | 'completed' | 'failed' | 'skipped' | 'deferred';
  reason?: string;
  mutationType?: string;
  queueDepth: number;
  durationMs?: number;
  queueWaitMs?: number;
}

export function useOutboxReplay({
  dispatchQueuedMutation,
  onTrace,
}: OutboxReplayOptions = {}): void {
  const { isOnline } = useOfflineStatus();
  const readPolicy = useTemporalStore((state) => state.readPolicy);
  const activeAccountId = useAuthStore((state) => state.user?.id);
  const replayOpen = useSyncExternalStore(
    subscribeReplayAdmission,
    () => Boolean(activeAccountId && isReplayAdmissionOpen(activeAccountId)),
    () => false,
  );
  const {
    queue,
    removeFromQueue,
    updateMutation,
    moveToDeadLetter,
    setSyncing,
    isSyncing,
    tryAcquireMutationLease,
  } = useMutationQueue();
  const { updateEntry } = useMutationAuditLog();
  const addConflict = useConflictStore((s) => s.addConflict);
  const activeConflicts = useConflictStore((s) => s.activeConflicts);


  const processQueue = useCallback(async () => {
    const trace = onTrace
      ? (event: SyncOrchestratorTraceEvent) => {
          try {
            onTrace(event);
          } catch {
            // Diagnostic callbacks must never change durable queue behavior.
          }
        }
      : undefined;
    const drainStartedAt = onTrace ? performance.now() : null;
    // Version Gating Guard: HARD_BLOCK freezes the outbox immediately to prevent corrupting backend schema/APIs
    if (useVersionGatingStore.getState().isBlocked) {
      trace?.({
        event: 'drain',
        state: 'skipped',
        reason: 'version-gated',
        queueDepth: queue.length,
      });
      if (__DEV__) {
        console.warn(
          '[SyncOrchestrator] Outbox replay paused: App version is HARD_BLOCKED pending update.',
        );
      }
      return;
    }

    if (!replayOpen) return;
    const activeUserId = useAuthStore.getState().user?.id;
    // Fail closed: legacy unbound commands require an explicit migration or
    // discard decision. Never replay them for whichever account is active.
    const eligibleQueue = planMutationReplay(queue, activeUserId, readPolicy).ready;

    if (eligibleQueue.length === 0) {
      trace?.({ event: 'drain', state: 'skipped', reason: 'no-eligible-items', queueDepth: 0 });
      return;
    }

    setSyncing(true);
    let processedCount = 0;
    let failedCount = 0;

    try {
      trace?.({ event: 'drain', state: 'started', queueDepth: eligibleQueue.length });
      sovereignBus.emit('sync:started', { queueLength: eligibleQueue.length });
      leaveBreadcrumb('sync', `Sync started: ${eligibleQueue.length} items`, 'info');
      if (__DEV__) {
        console.log(
          `[ResonantSync] Analyzing outbox: ${eligibleQueue.length} items pending for session.`,
        );
      }

      // Monotonic Ordering: Sort by logicalClock (or timestamp fallback) to guarantee FIFO order immune to local clock skew
      const currentQueue = [...eligibleQueue].sort((a, b) => {
        if (a.logicalClock !== undefined && b.logicalClock !== undefined) {
          return a.logicalClock - b.logicalClock;
        }
        return a.timestamp - b.timestamp;
      });
      let remainingDepth = currentQueue.length;
      for (let item of currentQueue) {
        const itemQueueDepth = remainingDepth;
        remainingDepth -= 1;
        // A paused auth session and a user-owned conflict need explicit recovery.
        // They must not silently resume just because React rendered again.
        if (item.commandState === 'auth_paused' || item.commandState === 'conflict') {
          trace?.({
            event: 'item',
            state: 'skipped',
            reason: item.commandState,
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
          });
          continue;
        }

        // Self-heal crashed in-flight locks if lease expired
        if (item.lockLeaseExpiresAt && Date.now() < item.lockLeaseExpiresAt) {
          // Active in-flight lock held by another process/worker
          trace?.({
            event: 'item',
            state: 'skipped',
            reason: 'active-lease',
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
          });
          continue;
        }

        // Respect Conflict Locking: Don't retry if a conflict is already active for this mutation
        if (activeConflicts.some((c) => c.id === item.id)) {
          trace?.({
            event: 'item',
            state: 'skipped',
            reason: 'active-conflict',
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
          });
          continue;
        }

        // Respect Temporal Pacing (Backoff)
        if (item.backoffUntil && Date.now() < item.backoffUntil) {
          trace?.({
            event: 'item',
            state: 'skipped',
            reason: 'backoff',
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
          });
          continue;
        }

        // Schema Evolution / Migration: ensure payload is migrated to current version
        item = migrateQueuedMutation(item);

        const principalId = item.userId;
        const admission = principalId ? tryBeginReplay(principalId) : null;
        if (!principalId || !admission) {
          trace?.({
            event: 'item',
            state: 'skipped',
            reason: 'replay-admission-closed',
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
          });
          continue;
        }

        // Atomically claim the lease so another foreground/background coordinator
        // cannot replay the same snapshot concurrently.
        if (!tryAcquireMutationLease(item.id, 15000)) {
          admission.release();
          trace?.({
            event: 'item',
            state: 'skipped',
            reason: 'lease-not-acquired',
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
          });
          continue;
        }

        const itemStartedAt = onTrace ? performance.now() : null;
        trace?.({
          event: 'item',
          state: 'started',
          mutationType: traceMutationType(item.name),
          queueDepth: itemQueueDepth,
          queueWaitMs: elapsedBetween(drainStartedAt, itemStartedAt),
        });
        try {
          if (!(await isReplayPrincipalCurrent(principalId))) {
            updateMutation(item.id, {
              commandState: 'auth_paused',
              lockLeaseExpiresAt: undefined,
            });
            trace?.({
              event: 'item',
              state: 'skipped',
              reason: 'credential-owner-mismatch',
              mutationType: traceMutationType(item.name),
              queueDepth: itemQueueDepth,
            });
            continue;
          }

          const mutationFn = MUTATION_REGISTRY[item.name];

          if (!mutationFn) {
            // No v1 command handler is registered for it yet (registry.ts): keep the work
            // queued, as the background drain does, instead of dead-lettering it.
            updateMutation(item.id, {
              commandState: 'queued',
              lastError: 'No domain command is admitted for this queued operation.',
              lastErrorCode: 'API_CAPABILITY_NOT_ADMITTED',
              lockLeaseExpiresAt: undefined,
            });
            trace?.({
              event: 'item',
              state: 'failed',
              reason: 'unknown-mutation',
              mutationType: 'unknown',
              queueDepth: itemQueueDepth,
              durationMs: elapsedSince(itemStartedAt),
            });
            continue;
          }

          if (dispatchQueuedMutation) {
            const dispatchResult = await dispatchQueuedMutation(item);
            if (dispatchResult === 'dispatched') {
              // The dispatcher contract guarantees a durable receipt. Do not use
              // this result for fire-and-forget workflow/event acknowledgement.
              removeFromQueue(item.id);
              updateEntry(item.id, 'dispatched');
              processedCount++;
              trace?.({
                event: 'item',
                state: 'completed',
                reason: 'durable-dispatch-receipt',
                mutationType: traceMutationType(item.name),
                queueDepth: itemQueueDepth,
                durationMs: elapsedSince(itemStartedAt),
              });
              continue;
            }
            if (dispatchResult === 'pending') {
              updateMutation(item.id, {
                commandState: 'retry_scheduled',
                backoffUntil: Date.now() + 5000,
                lastError: 'Workflow receipt pending',
                lastErrorCode: 'WORKFLOW_RECEIPT_PENDING',
                lockLeaseExpiresAt: undefined,
              });
              updateEntry(item.id, 'retrying', 'Workflow receipt pending');
              trace?.({
                event: 'item',
                state: 'deferred',
                reason: 'receipt-pending',
                mutationType: traceMutationType(item.name),
                queueDepth: itemQueueDepth,
                durationMs: elapsedSince(itemStartedAt),
              });
              continue;
            }
          }

          updateEntry(item.id, 'syncing');
          if (isMutationReplayDeferred(item)) {
            updateMutation(item.id, { commandState: 'queued', lockLeaseExpiresAt: undefined });
            continue;
          }
          await mutationFn(item.variables, {
            idempotencyKey: item.idempotencyKey,
            commandId: item.id,
            userId: item.userId,
          });

          // Success! (Resonance achieved)
          removeFromQueue(item.id);
          updateEntry(item.id, 'success');
          leaveBreadcrumb('sync', `Mutation succeeded: ${item.name}`, 'info', {
            mutationId: item.id,
          });
          sovereignBus.emit('sync:item_succeeded', {
            mutationId: item.id,
            name: item.name,
            scope: item.scope,
          });
          processedCount++;
          trace?.({
            event: 'item',
            state: 'completed',
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
            durationMs: elapsedSince(itemStartedAt),
          });
        } catch (error: any) {
          const decision = decideReplayFailure(error, item.retryCount);
          const errorType = classifyError(error);
          trace?.({
            event: 'item',
            state: 'failed',
            reason: errorType,
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
            durationMs: elapsedSince(itemStartedAt),
          });
          const { retryCount } = decision;

          if (decision._tag === 'Failed') {
            // Terminal State: Permanent Failure or Max Retries
            const exitReason = decision.reason;
            if (__DEV__) {
              console.error(
                `[SyncOrchestrator] Terminal: ${item.name}  reason=${exitReason}`,
                error,
              );
            }
            leaveBreadcrumb('sync', `Mutation terminal: ${item.name} (${exitReason})`, 'error', {
              mutationId: item.id,
              error: error.message,
            });

            moveToDeadLetter(item.id, error.message);
            updateEntry(item.id, 'dead_letter', error.message);
            sovereignBus.emit('sync:item_moved_to_dlq', {
              mutationId: item.id,
              name: item.name,
              reason: exitReason,
            });
            failedCount++;
            // The person gets a localised message; developers get the diagnosis (never the
            // internal mutation name in the message).
            feedback.presentFailure(error, `outbox.${item.name}`);
          } else if (decision._tag === 'Conflict') {
            // Resonance Fork: Data Conflict detected
            // Note: addConflict now emits 'conflict:detected' on the SovereignBus internally
            addConflict({
              id: item.id,
              scope: item.scope,
              name: item.name,
              localData: item.variables,
              remoteData: error.remoteState || null,
              timestamp: Date.now(),
            });
            updateMutation(item.id, {
              commandState: 'conflict',
              lastError: error instanceof Error ? error.message : 'CONFLICT',
              lastErrorCode: 'CONFLICT',
            });
            leaveBreadcrumb('sync', `Conflict detected: ${item.name}`, 'warning', {
              mutationId: item.id,
            });
            failedCount++;
            feedback.presentFailure(new ConflictError({ cause: error }), `outbox.${item.name}`);
            updateEntry(item.id, 'terminal_abort', 'Data Conflict Detected');
          } else if (decision._tag === 'AuthPaused') {
            // Auth Token Expired: Do NOT dump to DLQ; trigger refresh and pause outbox replay
            if (__DEV__) {
              console.warn(
                `[SyncOrchestrator] Auth session expired while processing ${item.name}. Pausing outbox replay.`,
              );
            }
            leaveBreadcrumb('sync', `Session expired during ${item.name}`, 'warning');
            sovereignBus.emit('sync:auth_required', { mutationId: item.id });
            updateMutation(item.id, {
              retryCount,
              backoffUntil: decision.backoffUntil,
              lastError: 'AUTH_EXPIRED',
              lastErrorCode: 'AUTH_EXPIRED',
              commandState: 'auth_paused',
            });
            updateEntry(item.id, 'retrying', 'Session expired - awaiting token refresh');
            failedCount++;
            break; // Stop iteration until fresh token is resolved
          } else {
            // Transient failure - retry with jittered exponential backoff (replayDecision)
            const { backoffUntil } = decision;
            const backoffMs = backoffUntil - Date.now();

            if (__DEV__) {
              console.log(`[SyncOrchestrator] Backoff: ${item.name} retrying in ${backoffMs}ms`);
            }
            leaveBreadcrumb(
              'sync',
              `Mutation retry: ${item.name} (attempt ${retryCount})`,
              'info',
              {
                mutationId: item.id,
              },
            );
            updateMutation(item.id, {
              retryCount,
              backoffUntil,
              lastError: error.message,
              commandState: 'retry_scheduled',
            });
            updateEntry(item.id, 'retrying', error.message);
            failedCount++;
          }
        } finally {
          admission.release();
        }
      }
    } catch (error) {
      trace?.({
        event: 'drain',
        state: 'failed',
        reason: 'unexpected-error',
        queueDepth: queue.length,
        durationMs: elapsedSince(drainStartedAt),
      });
      throw error;
    } finally {
      setSyncing(false);
    }
    trace?.({
      event: 'drain',
      state: 'completed',
      queueDepth: useMutationQueue.getState().queue.length,
      durationMs: elapsedSince(drainStartedAt),
    });
    leaveBreadcrumb(
      'sync',
      `Sync completed: ${processedCount} processed, ${failedCount} failed`,
      'info',
    );
    sovereignBus.emit('sync:completed', { processedCount, failedCount });

    if (processedCount > 0) {
      feedback.toast(`Synced ${processedCount} pending actions`, 'success');
    }
  }, [
    replayOpen,
    readPolicy,
    queue,
    removeFromQueue,
    updateMutation,
    moveToDeadLetter,
    setSyncing,
    tryAcquireMutationLease,
    dispatchQueuedMutation,
    updateEntry,
    addConflict,
    activeConflicts,
    onTrace,
  ]);

  useEffect(() => {
    if (!isOnline || isSyncing || !replayOpen) return;
    const plan = planMutationReplay(queue, activeAccountId, readPolicy);
    const drain = () => {
      void processQueue().catch((e) => {
        console.error('SyncOrchestrator: Failed to process sync queue', e);
      });
    };
    if (plan.ready.length > 0) {
      drain();
      return;
    }
    if (plan.nextWakeAt === null) return;
    const timer = setTimeout(drain, Math.max(0, plan.nextWakeAt - Date.now()));
    return () => clearTimeout(timer);
  }, [isOnline, queue, isSyncing, processQueue, replayOpen, activeAccountId, readPolicy]);
}

function traceMutationType(name: string): string {
  return MUTATION_REGISTRY[name] ? name : 'unknown';
}

function elapsedSince(startedAt: number | null): number {
  return startedAt === null ? 0 : Math.max(0, performance.now() - startedAt);
}

function elapsedBetween(startedAt: number | null, finishedAt: number | null): number {
  return startedAt === null || finishedAt === null ? 0 : Math.max(0, finishedAt - startedAt);
}
