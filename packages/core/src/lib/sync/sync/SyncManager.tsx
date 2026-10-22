import { classifyError } from '@repo/core/lib/sync/errorClassifier';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { useMutationAuditLog } from '@repo/core/lib/sync/MutationAuditLog';
import { migrateQueuedMutation } from '@repo/core/lib/sync/outboxMigration';
import { MUTATION_REGISTRY } from '@repo/core/lib/sync/registry';
import type { QueuedMutation, QueuedMutationDispatchResult } from '@repo/core/lib/sync/types';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useVersionGatingStore } from '@repo/core/lib/sync/versionGating';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { useStore } from '@repo/core/store/useStore';
import { useCallback, useEffect } from 'react';

/**
 * SyncManager
 *
 * Headless component that orchestrates the "Outbox" replay.
 * Upgraded with:
 * - Exponential Backoff (Temporal pacing)
 * - Error Classification (Resonant Outcomes)
 * - Dead Letter Queue (Reparative recovery)
 * - Audit Log synchronization
 */
interface SyncManagerProps {
  /**
   * A custom dispatcher is permitted only when it resolves after a durable
   * server receipt. Event-enqueue acknowledgement is not command settlement.
   */
  dispatchQueuedMutation?: (
    mutation: QueuedMutation,
  ) => Promise<QueuedMutationDispatchResult> | QueuedMutationDispatchResult;
  /** Optional observer for fixed-field local diagnostics; never receives IDs or payloads. */
  onTrace?: (event: SyncManagerTraceEvent) => void;
}

export interface SyncManagerTraceEvent {
  event: 'drain' | 'item';
  state: 'started' | 'completed' | 'failed' | 'skipped' | 'deferred';
  reason?: string;
  mutationType?: string;
  queueDepth: number;
  durationMs?: number;
  queueWaitMs?: number;
}

export default function SyncManager({ dispatchQueuedMutation, onTrace }: SyncManagerProps = {}) {
  const isOnline = useStore((state) => state.isOnline);
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
  const { addConflict, activeConflicts } = useConflictStore();
  const showToast = useStore((state) => state.showToast);

  const MAX_RETRIES = 5; // Increased for better robustness

  const processQueue = useCallback(async () => {
    const trace = onTrace
      ? (event: SyncManagerTraceEvent) => {
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
          '[SyncManager] Outbox replay paused: App version is HARD_BLOCKED pending update.',
        );
      }
      return;
    }

    const activeUserId = useStore.getState().user?.id;
    // Fail closed: legacy unbound commands require an explicit migration or
    // discard decision. Never replay them for whichever account is active.
    const eligibleQueue = activeUserId ? queue.filter((item) => item.userId === activeUserId) : [];

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

        // Atomically claim the lease so another foreground/background coordinator
        // cannot replay the same snapshot concurrently.
        if (!tryAcquireMutationLease(item.id, 15000)) {
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
          const mutationFn = MUTATION_REGISTRY[item.name];

          if (!mutationFn) {
            console.warn(`[SyncManager] Unknown mutation: ${item.name}. Moving to DLQ.`);
            moveToDeadLetter(item.id, 'UNKNOWN_MUTATION');
            updateEntry(item.id, 'dead_letter', 'Unknown mutation registry key');
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
          const errorType = classifyError(error);
          trace?.({
            event: 'item',
            state: 'failed',
            reason: errorType,
            mutationType: traceMutationType(item.name),
            queueDepth: itemQueueDepth,
            durationMs: elapsedSince(itemStartedAt),
          });
          const retryCount = (item.retryCount || 0) + 1;

          if (errorType === 'PERMANENT' || retryCount >= MAX_RETRIES) {
            // Terminal State: Permanent Failure or Max Retries
            const exitReason =
              errorType === 'PERMANENT' ? 'PERMANENT_FAILURE' : 'MAX_RETRIES_EXCEEDED';
            if (__DEV__) {
              console.error(`[SyncManager] Terminal: ${item.name}  reason=${exitReason}`, error);
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
            showToast(`Action required: ${item.name} failed permanentely`, 'error');
          } else if (errorType === 'CONFLICT') {
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
            showToast(`Conflict detected in ${item.name}`, 'info');
            updateEntry(item.id, 'terminal_abort', 'Data Conflict Detected');
          } else if (errorType === 'AUTH_EXPIRED') {
            // Auth Token Expired: Do NOT dump to DLQ; trigger refresh and pause outbox replay
            if (__DEV__) {
              console.warn(
                `[SyncManager] Auth session expired while processing ${item.name}. Pausing outbox replay.`,
              );
            }
            leaveBreadcrumb('sync', `Session expired during ${item.name}`, 'warning');
            sovereignBus.emit('sync:auth_required', { mutationId: item.id });
            updateMutation(item.id, {
              retryCount,
              backoffUntil: Date.now() + 5000,
              lastError: 'AUTH_EXPIRED',
              lastErrorCode: 'AUTH_EXPIRED',
              commandState: 'auth_paused',
            });
            updateEntry(item.id, 'retrying', 'Session expired - awaiting token refresh');
            failedCount++;
            break; // Stop iteration until fresh token is resolved
          } else {
            // Transient failure - retry with exponential backoff
            const backoffMs = Math.min(2 ** retryCount * 1000, 30000);
            const backoffUntil = Date.now() + backoffMs;

            if (__DEV__) {
              console.log(`[SyncManager] Backoff: ${item.name} retrying in ${backoffMs}ms`);
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
      showToast(`Synced ${processedCount} pending actions`, 'success');
    }
  }, [
    queue,
    removeFromQueue,
    updateMutation,
    moveToDeadLetter,
    setSyncing,
    tryAcquireMutationLease,
    dispatchQueuedMutation,
    updateEntry,
    showToast, // Resonance Fork: Data Conflict detected
    // Note: addConflict now emits 'conflict:detected' on the SovereignBus internally
    addConflict,
    activeConflicts,
    onTrace,
  ]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      processQueue().catch((e) => {
        console.error('SyncManager: Failed to process sync queue', e);
      });
    }
  }, [isOnline, queue.length, isSyncing, processQueue]);

  return null;
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
