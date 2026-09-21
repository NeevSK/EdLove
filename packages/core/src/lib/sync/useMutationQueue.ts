import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { CURRENT_OUTBOX_SCHEMA_VERSION } from '@repo/core/lib/sync/outboxMigration';
import { assertMutationCommandTransition } from '@repo/core/lib/sync/commandLifecycle';
import {
  MAX_DEAD_LETTER_QUEUE_SIZE,
  MAX_MUTATION_QUEUE_SIZE,
  MutationQueueCapacityError,
  type MutationQueueState,
} from '@repo/core/lib/sync/types';
import { v7 as uuidv7 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useMutationQueue = create<MutationQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      deadLetterQueue: [],
      isSyncing: false,

      addToQueue: async (mutation) => {
        const userId = mutation.userId ?? getActiveAccountId() ?? undefined;
        const idempotencyKey = await generateIdempotencyKey(
          mutation.scope,
          mutation.name,
          mutation.variables,
          userId,
        );
        const legacyIdempotencyKey = userId
          ? await generateIdempotencyKey(mutation.scope, mutation.name, mutation.variables)
          : idempotencyKey;

        // Keep legacy unscoped de-duplication; scoped intents cannot collide across accounts.
        const isDuplicate = get().queue.some((queued) => {
          if (queued.userId !== userId) return false;
          return (
            queued.idempotencyKey === idempotencyKey ||
            queued.idempotencyKey === legacyIdempotencyKey
          );
        });
        if (isDuplicate) {
          if (__DEV__) {
            console.log(`[MutationQueue] Skipping duplicate intent: ${mutation.name}`);
          }
          return;
        }

        let accepted = false;
        set((state) => {
          if (state.queue.length >= MAX_MUTATION_QUEUE_SIZE) return state;
          const highestLogicalClock = state.queue.reduce(
            (max, item) => Math.max(max, item.logicalClock ?? 0),
            0,
          );
          accepted = true;
          return {
            queue: [
              ...state.queue,
              {
                ...mutation,
                userId,
                id: uuidv7(),
                idempotencyKey,
                timestamp: Date.now(),
                retryCount: 0,
                schemaVersion: CURRENT_OUTBOX_SCHEMA_VERSION,
                logicalClock: highestLogicalClock + 1,
                commandState: 'queued',
              },
            ],
          };
        });
        if (!accepted) throw new MutationQueueCapacityError();
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((m) => m.id !== id),
        }));
      },

      moveToDeadLetter: (id, reason) => {
        const item = get().queue.find((m) => m.id === id);
        if (item) {
          set((state) => {
            const nextDlq = [
              ...state.deadLetterQueue,
              {
                ...item,
                commandState: 'rejected' as const,
                lastError: reason,
                failedAt: Date.now(),
              },
            ]
              .sort((a, b) => (b.failedAt ?? b.timestamp) - (a.failedAt ?? a.timestamp))
              .slice(0, MAX_DEAD_LETTER_QUEUE_SIZE);
            return {
              queue: state.queue.filter((m) => m.id !== id),
              deadLetterQueue: nextDlq,
            };
          });
        }
      },

      importDeadLetterMutations: (mutations) => {
        if (mutations.length === 0) return;
        set((state) => {
          const knownIds = new Set(state.deadLetterQueue.map((mutation) => mutation.id));
          const imported = mutations.filter((mutation) => !knownIds.has(mutation.id));
          if (imported.length === 0) return state;
          return {
            deadLetterQueue: [...state.deadLetterQueue, ...imported]
              .map((mutation) => ({ ...mutation, commandState: 'rejected' as const }))
              .sort((a, b) => (b.failedAt ?? b.timestamp) - (a.failedAt ?? a.timestamp))
              .slice(0, MAX_DEAD_LETTER_QUEUE_SIZE),
          };
        });
      },

      restoreDeadLetterMutation: (id) => {
        const item = get().deadLetterQueue.find((mutation) => mutation.id === id);
        if (!item || get().queue.length >= MAX_MUTATION_QUEUE_SIZE) return false;

        set((state) => ({
          deadLetterQueue: state.deadLetterQueue.filter((mutation) => mutation.id !== id),
          queue: [
            ...state.queue,
            {
              ...item,
              commandState: 'queued',
              retryCount: 0,
              backoffUntil: undefined,
              lockLeaseExpiresAt: undefined,
              lastError: undefined,
              lastErrorCode: undefined,
              failedAt: undefined,
            },
          ],
        }));
        return true;
      },

      tryAcquireMutationLease: (id, leaseDurationMs, now = Date.now()) => {
        if (!Number.isFinite(leaseDurationMs) || leaseDurationMs <= 0) return false;

        let acquired = false;
        set((state) => {
          const mutation = state.queue.find((item) => item.id === id);
          if (!mutation || (mutation.lockLeaseExpiresAt && mutation.lockLeaseExpiresAt > now)) {
            return state;
          }

          const commandState = mutation.commandState ?? 'queued';
          if (
            commandState === 'auth_paused' ||
            commandState === 'conflict' ||
            commandState === 'rejected' ||
            commandState === 'reconciled' ||
            commandState === 'discarded'
          ) {
            return state;
          }

          assertMutationCommandTransition(commandState, 'dispatching');
          acquired = true;
          return {
            queue: state.queue.map((item) =>
              item.id === id
                ? {
                    ...item,
                    commandState: 'dispatching' as const,
                    lockLeaseExpiresAt: now + leaseDurationMs,
                  }
                : item,
            ),
          };
        });
        return acquired;
      },

      updateMutation: (id, updates) => {
        set((state) => ({
          queue: state.queue.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      clearDeadLetterQueue: () => {
        set({ deadLetterQueue: [] });
      },

      resumePausedMutationsForUser: (userId) => {
        set((state) => ({
          queue: state.queue.map((mutation) =>
            mutation.userId === userId && mutation.commandState === 'auth_paused'
              ? {
                  ...mutation,
                  commandState: 'queued',
                  backoffUntil: undefined,
                  lockLeaseExpiresAt: undefined,
                }
              : mutation,
          ),
        }));
      },

      setSyncing: (isSyncing) => {
        set({ isSyncing });
      },

      getQueueForUser: (userId?: string) => {
        const currentQueue = get().queue;
        if (!userId) {
          return currentQueue.filter((m) => !m.userId);
        }
        return currentQueue.filter((m) => m.userId === userId);
      },
    }),
    {
      name: 'gurudevi-mutation-queue',
      storage: createJSONStorage(() => SafeZustandStorage),
    },
  ),
);
