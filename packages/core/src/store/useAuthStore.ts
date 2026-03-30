import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { createAuthSlice, type AuthSlice } from './slices/auth.slice';

/**
 * useAuthStore: Sovereign store for authentication and user identity.
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
        }
    )
);
