import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '../../lib/storageWrapper';
import { generateIdempotencyKey } from './idempotency';
import type { MutationQueueState, QueuedMutation } from './types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * useMutationQueue
 *
 * The Persistent "Outbox".
 * Stores actions that happened while offline so they can be replayed later.
 * Upgraded with Idempotency Dedup and Dead Letter Queue.
 */
export const useMutationQueue = create<MutationQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      deadLetterQueue: [],
      isSyncing: false,

      addToQueue: (mutation) => {
        const idempotencyKey = generateIdempotencyKey(
          mutation.scope,
          mutation.name,
          mutation.variables,
        );

        // Dedup: If mutation with same idempotency key is already in queue, skip
        const isDuplicate = get().queue.some((m) => m.idempotencyKey === idempotencyKey);
        if (isDuplicate) {
          if (__DEV__) {
            console.log(`[MutationQueue] Skipping duplicate intent: ${mutation.name}`);
          }
          return;
        }

        const newMutation: QueuedMutation = {
          ...mutation,
          id: uuidv4(),
          idempotencyKey,
          timestamp: Date.now(),
          retryCount: 0,
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
