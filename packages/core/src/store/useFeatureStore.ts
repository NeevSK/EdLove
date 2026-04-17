import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FeatureSlice, createFeatureSlice } from './slices/feature.slice';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { storage } from '../lib/storage';

/**
 * useFeatureStore - Sovereign domain store for Feature Flags.
 * 
 * Persists to MMKV (Native) or LocalStorage (Web) to avoid UI flicker on launch.
 */
export const useFeatureStore = create<FeatureSlice>()(
  persist(
    (...args) => ({
      ...createFeatureSlice(...args)}),
    {
      name: 'gurudevi-feature-storage',
      storage: createJSONStorage(() => SafeZustandStorage),

      // Only persist the resolved flags for instant launch, not the globalConfigs
      partialize: (state) => ({ flags: state.flags })}
  )
);
