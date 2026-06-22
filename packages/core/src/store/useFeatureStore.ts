import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { createFeatureSlice, type FeatureSlice } from './slices/feature.slice';

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

      // Only persist the resolved flags for instant launch, not the globalConfigs
      partialize: (state) => ({ flags: state.flags }),
    },
  ),
);
