import { create } from 'zustand';

export interface DataConflict {
  id: string; // Mutation ID
  scope: string;
  name: string;
  localData: any;
  remoteData: any;
  timestamp: number;
}

interface ConflictStore {
  activeConflicts: DataConflict[];
  addConflict: (conflict: DataConflict) => void;
  resolveConflict: (id: string) => void;
  clearConflicts: () => void;
}

/**
 * useConflictStore
 * 
 * Central hub for managing data forks and synchronization conflicts.
 * Part of the Phase 5 "Dynamic Sovereignty" architecture.
 */
export const useConflictStore = create<ConflictStore>((set) => ({
  activeConflicts: [],
  addConflict: (conflict) => {
    set((state) => ({
      activeConflicts: [...state.activeConflicts, conflict],
    }));
  },
  resolveConflict: (id) => {
    set((state) => ({
      activeConflicts: state.activeConflicts.filter((c) => c.id !== id),
    }));
  },
  clearConflicts: () => {
    set({ activeConflicts: [] });
  },
}));
