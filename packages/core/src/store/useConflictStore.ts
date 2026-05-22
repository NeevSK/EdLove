import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { sovereignBus } from '../lib/sync/eventBus';

export interface DataConflict {
  id: string; // Mutation ID — links back to QueuedMutation
  scope: string; // e.g. 'classroom', 'community', 'self'
  name: string; // e.g. 'updateAttendance'
  localData: unknown; // What the device wanted to write
  remoteData: unknown; // What the server says already exists (if known)
  timestamp: number;
  resolvedAt?: number; // Epoch ms — set when the user resolves it
  resolution?: 'local_wins' | 'remote_wins' | 'merged'; // For audit trail
}

interface ConflictStore {
  activeConflicts: DataConflict[];
  resolvedConflicts: DataConflict[]; // Ring buffer for audit — last 50
  addConflict: (conflict: DataConflict) => void;
  resolveConflict: (id: string, resolution: DataConflict['resolution']) => void;
  clearConflicts: () => void;
  clearResolved: () => void;
}

const MAX_RESOLVED = 50;

/**
 * useConflictStore
 *
 * Persistent (MMKV-backed) central hub for data forks.
 *
 * Previously in-memory only — a crash during a conflict would silently lose
 * the conflict state, leaving orphaned mutations in the queue forever.
 *
 * Now persisted so the ConflictResolutionSheet can re-surface on next launch.
 */
export const useConflictStore = create<ConflictStore>()(
  persist(
    (set, get) => ({
      activeConflicts: [],
      resolvedConflicts: [],

      addConflict: (conflict) => {
        // Guard: don't add the same conflict twice (SyncManager may retry)
        const alreadyExists = get().activeConflicts.some((c) => c.id === conflict.id);
        if (alreadyExists) return;

        set((state) => ({
          activeConflicts: [...state.activeConflicts, conflict],
        }));

        // Notify the bus so useSyncStatus and any UI subscriber reacts
        sovereignBus.emit('conflict:detected', {
          mutationId: conflict.id,
          scope: conflict.scope,
          name: conflict.name,
        });
      },

      resolveConflict: (id, resolution) => {
        const conflict = get().activeConflicts.find((c) => c.id === id);
        if (!conflict) return;

        const resolved: DataConflict = {
          ...conflict,
          resolvedAt: Date.now(),
          resolution,
        };

        set((state) => ({
          activeConflicts: state.activeConflicts.filter((c) => c.id !== id),
          // Keep only the last MAX_RESOLVED for audit
          resolvedConflicts: [resolved, ...state.resolvedConflicts].slice(0, MAX_RESOLVED),
        }));

        // Notify the bus so useSyncStatus updates the conflictCount
        sovereignBus.emit('conflict:resolved', { mutationId: id });
      },

      clearConflicts: () => {
        set({ activeConflicts: [] });
      },

      clearResolved: () => {
        set({ resolvedConflicts: [] });
      },
    }),
    {
      name: 'gurudevi-conflict-store',
      storage: createJSONStorage(() => SafeZustandStorage),
      // Only persist active conflicts — resolved are nice to have but not critical
      partialize: (state) => ({
        activeConflicts: state.activeConflicts,
        resolvedConflicts: state.resolvedConflicts,
      }),
    },
  ),
);
