import { authProfileStorage, restoreIdentityProfile } from '@repo/core/lib/authProfileStorage';
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
      storage: createJSONStorage(() => authProfileStorage),
      partialize: (state) => ({ user: state.user }),
      migrate: (value) => restoreIdentityProfile(value),
      merge: (value, current) => ({ ...current, ...restoreIdentityProfile(value) }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('[AuthStore] Rehydration failed:', error);
        }
        useAuthStore.getState().setStoreHydrated(true);
      },
    },
  ),
);
