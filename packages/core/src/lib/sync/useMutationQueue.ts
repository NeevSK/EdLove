import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { generateIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { CURRENT_OUTBOX_SCHEMA_VERSION } from '@repo/core/lib/sync/outboxMigration';
import type { MutationQueueState, QueuedMutation } from '@repo/core/lib/sync/types';
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

        set((state) => ({
          queue: [...state.queue, newMutation],
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((m) => m.id !== id),
        }));
      },

      moveToDeadLetter: (id, reason) => {
        const item = get().queue.find((m) => m.id === id);
        if (item) {
          set((state) => ({
            queue: state.queue.filter((m) => m.id !== id),
            deadLetterQueue: [...state.deadLetterQueue, { ...item, lastError: reason }],
          }));
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
    }),
    {
      name: 'gurudevi-mutation-queue',
      storage: createJSONStorage(() => SafeZustandStorage),
    },
  ),
);
