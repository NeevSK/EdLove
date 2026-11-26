import { authProfile } from '@repo/core/effect/bindings';
import { type AuthSlice, createAuthSlice } from '@repo/core/store/slices/auth.slice';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Canonical profile observable. Credentials belong to AuthProvider; scope to scopeSession. */
export const useAuthStore = create<AuthSlice>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
    }),
    {
      name: 'gurudevi-auth-storage',
      version: 2,
      storage: createJSONStorage(() => authProfile.storage),
      partialize: (state) => ({ user: state.user }),
      migrate: (value) => authProfile.restore(value),
      merge: (value, current) => ({ ...current, ...authProfile.restore(value) }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('[AuthStore] Rehydration failed:', error);
        }
        useAuthStore.getState().setStoreHydrated(true);
      },
    },
  ),
);
