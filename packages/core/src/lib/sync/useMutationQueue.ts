import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { assertMutationCommandTransition } from '@repo/core/lib/sync/commandLifecycle';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { CURRENT_OUTBOX_SCHEMA_VERSION } from '@repo/core/lib/sync/outboxMigration';
import {
  MAX_DEAD_LETTER_QUEUE_SIZE,
  MAX_MUTATION_QUEUE_SIZE,
  MutationQueueCapacityError,
  type MutationQueueState,
} from '@repo/core/lib/sync/types';
import { v7 as uuidv7 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const unacknowledgedCommandIds = new Set<string>();
let publishAcknowledgement: () => void;
let hydration: Promise<void> | null = null;

async function ensureOutboxHydrated(): Promise<void> {
  if (useMutationQueue.persist.hasHydrated()) return;
  if (!hydration)
    hydration = Promise.resolve(useMutationQueue.persist.rehydrate())
      .then(() => {
        if (!useMutationQueue.persist.hasHydrated())
          throw new Error('Saved outbox could not be read. Original work was retained.');
      })
      .finally(() => {
        hydration = null;
      });
  await hydration;
}

export function isQueuedMutationAcknowledged(id: string): boolean {
  return !unacknowledgedCommandIds.has(id);
}

const persistedQueueInitializer = persist<MutationQueueState>(
  (set, get) => ({
    queue: [],
    deadLetterQueue: [],
    isSyncing: false,

    addToQueue: async (mutation) => {
      const userId = mutation.userId ?? getActiveAccountId() ?? undefined;
      await ensureOutboxHydrated();
      const acknowledgePendingSnapshot = async (acknowledgement: unknown): Promise<void> => {
        const snapshotIds = new Set(
          get()
            .queue.filter((queued) => unacknowledgedCommandIds.has(queued.id))
            .map((queued) => queued.id),
        );
        await acknowledgement;
        snapshotIds.forEach((id) => unacknowledgedCommandIds.delete(id));
        if (snapshotIds.size > 0) publishAcknowledgement();
      };

      const idempotencyKey = await generateIdempotencyKey(
        mutation.scope,
        mutation.name,
        mutation.variables,
        userId,
      );
      const legacyIdempotencyKey = userId
        ? await generateIdempotencyKey(mutation.scope, mutation.name, mutation.variables)
        : idempotencyKey;

      const duplicate = get().queue.find(
        (queued) =>
          queued.userId === userId &&
          (queued.idempotencyKey === idempotencyKey ||
            queued.idempotencyKey === legacyIdempotencyKey),
      );
      if (duplicate) {
        if (__DEV__) {
          console.log(`[MutationQueue] Skipping duplicate intent: ${mutation.name}`);
        }
        if (unacknowledgedCommandIds.has(duplicate.id)) {
          await acknowledgePendingSnapshot(set((state) => state));
        }
        return;
      }

      const commandId = uuidv7();
      const highestLogicalClock = get().queue.reduce(
        (max, item) => Math.max(max, item.logicalClock ?? 0),
        0,
      );
      let accepted = false;
      unacknowledgedCommandIds.add(commandId);
      const acknowledgement = set((state) => {
        if (state.queue.length >= MAX_MUTATION_QUEUE_SIZE) return state;
        accepted = true;
        return {
          queue: [
            ...state.queue,
            {
              ...mutation,
              userId,
              id: commandId,
              operationId: mutation.operationId ?? commandId,
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
      if (!accepted) {
        unacknowledgedCommandIds.delete(commandId);
        throw new MutationQueueCapacityError();
      }

      await acknowledgePendingSnapshot(acknowledgement);
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
      if (!isQueuedMutationAcknowledged(id)) return false;

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
      unacknowledgedCommandIds.clear();
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
    partialize: (state) => ({ ...state, isSyncing: false }),
    merge: (persisted, current) => ({
      ...current,
      ...(persisted && typeof persisted === 'object' ? persisted : {}),
      isSyncing: false,
    }),
  },
);

const queueInitializer: typeof persistedQueueInitializer = (set, get, api) => {
  // Raw publication wakes replay after the acknowledged write without persisting it again.
  publishAcknowledgement = () => set((state) => ({ queue: [...state.queue] }));
  return persistedQueueInitializer(set, get, api);
};

export const useMutationQueue = create<MutationQueueState>()(queueInitializer);
