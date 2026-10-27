import { leaveBreadcrumb } from '@repo/core/monitoring';
import type { User } from '@repo/core/types';
import type { StateCreator } from 'zustand';

export interface AuthSlice {
  user: User | null;
  setUser(user: User | null): void;
  isStoreHydrated: boolean;
  setStoreHydrated(hydrated: boolean): void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  setUser: (user) => {
    leaveBreadcrumb('auth', user ? `User set: ${user.id}` : 'User cleared', 'info');
    set({ user });
  },
  isStoreHydrated: false,
  setStoreHydrated: (isStoreHydrated) => set({ isStoreHydrated }),
});
