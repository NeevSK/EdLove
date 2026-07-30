import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { createFeatureSlice, type FeatureSlice } from '@repo/core/store/slices/feature.slice';

/**
 * useFeatureStore - Sovereign domain store for Feature Flags.
 *
 * Persists the resolved rollout view to MMKV (Native) or LocalStorage (Web) to avoid UI flicker on launch.
 */
export const useFeatureStore = create<FeatureSlice>()(
  persist(
    (...args) => ({
      ...createFeatureSlice(...args),
    }),
    {
      name: 'gurudevi-feature-storage',
      storage: createJSONStorage(() => SafeZustandStorage),

      // Re-apply the persisted snapshot through the lifecycle freshness policy
      // before it can influence a screen after a long offline period.
      onRehydrateStorage: () => (state) => {
        if (state?.snapshot) state.applySnapshot(state.snapshot);
      },

      // Persist the last resolved rollout snapshot for instant, offline startup.
      partialize: (state) => ({ flags: state.flags, snapshot: state.snapshot }),
    },
  ),
);
