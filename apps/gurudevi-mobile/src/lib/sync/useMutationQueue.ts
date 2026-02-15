
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '../storageWrapper';
import { MutationQueueState, QueuedMutation } from './types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * useMutationQueue
 * 
 * The Persistent "Outbox".
 * Stores actions that happened while offline so they can be replayed later.
 */
export const useMutationQueue = create<MutationQueueState>()(
    persist(
        (set, get) => ({
            queue: [],
            isSyncing: false,

            addToQueue: (mutation) => {
                const newMutation: QueuedMutation = {
                    ...mutation,
                    id: uuidv4(),
                    timestamp: Date.now(),
                    retryCount: 0,
                };

                set((state) => ({
                    queue: [...state.queue, newMutation]
                }));
            },

            removeFromQueue: (id) => {
                set((state) => ({
                    queue: state.queue.filter(m => m.id !== id)
                }));
            },

            updateMutation: (id, updates) => {
                set((state) => ({
                    queue: state.queue.map(m => m.id === id ? { ...m, ...updates } : m)
                }));
            },

            clearQueue: () => {
                set({ queue: [] });
            },

            setSyncing: (isSyncing) => {
                set({ isSyncing });
            }
        }),
        {
            name: 'gurudevi-mutation-queue',
            storage: createJSONStorage(() => SafeZustandStorage),
        }
    )
);
