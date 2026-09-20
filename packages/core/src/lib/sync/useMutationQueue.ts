import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { CURRENT_OUTBOX_SCHEMA_VERSION } from '@repo/core/lib/sync/outboxMigration';
import {
  MAX_DEAD_LETTER_QUEUE_SIZE,
  MAX_MUTATION_QUEUE_SIZE,
  type MutationQueueState,
  type QueuedMutation,
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
        const idempotencyKey = await generateIdempotencyKey(
          mutation.scope,
          mutation.name,
          mutation.variables,
          mutation.userId,
        );
        const legacyIdempotencyKey = mutation.userId
          ? await generateIdempotencyKey(mutation.scope, mutation.name, mutation.variables)
          : idempotencyKey;

        // Keep legacy unscoped de-duplication; scoped intents cannot collide across accounts.
        const isDuplicate = get().queue.some((queued) => {
          if (queued.userId !== mutation.userId) return false;
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

        const queue = get().queue;
        const highestLogicalClock = queue.reduce(
          (max, item) => Math.max(max, item.logicalClock ?? 0),
          0,
        );

        const newMutation: QueuedMutation = {
          ...mutation,
          id: uuidv7(),
          idempotencyKey,
          timestamp: Date.now(),
          retryCount: 0,
          schemaVersion: CURRENT_OUTBOX_SCHEMA_VERSION,
          logicalClock: highestLogicalClock + 1,
        };

        set((state) => {
          // Bounded capacity: maintain at most MAX_MUTATION_QUEUE_SIZE items, evicting oldest
          const nextQueue = [...state.queue, newMutation];
          if (nextQueue.length > MAX_MUTATION_QUEUE_SIZE) {
            nextQueue.splice(0, nextQueue.length - MAX_MUTATION_QUEUE_SIZE);
          }
          return { queue: nextQueue };
        });
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
            const nextDlq = [...state.deadLetterQueue, { ...item, lastError: reason }];
            if (nextDlq.length > MAX_DEAD_LETTER_QUEUE_SIZE) {
              nextDlq.splice(0, nextDlq.length - MAX_DEAD_LETTER_QUEUE_SIZE);
            }
            return {
              queue: state.queue.filter((m) => m.id !== id),
              deadLetterQueue: nextDlq,
            };
          });
        }
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

