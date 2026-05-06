import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { type AuthSlice, createAuthSlice } from './slices/auth.slice';

/**
 * useAuthStore: Sovereign store for authentication and user identity.
 *
 * onRehydrateStorage: Called by Zustand immediately after persisted state
 * has been restored from MMKV (or AsyncStorage fallback). Setting
 * `isStoreHydrated = true` at this point eliminates the race condition where
 * `usePermissions` evaluates with an empty bonds array during app bootstrap.
 */
export const useAuthStore = create<AuthSlice>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
    }),
    {
      name: 'gurudevi-auth-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        userName: state.userName,
        user: state.user,
        onboardingCompleted: state.onboardingCompleted,
        isExplorerMode: state.isExplorerMode,
        dismissedSampleIds: state.dismissedSampleIds,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('[AuthStore] Rehydration failed:', error);
        }
        // Mark the store as fully hydrated — SanctuaryProvider unblocks here.
        useAuthStore.getState().setStoreHydrated(true);
      },
    },
  ),
);

