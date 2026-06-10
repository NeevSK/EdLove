import type { Session } from '@supabase/supabase-js';
import type { StateCreator } from 'zustand';
import type { User } from '../../types';
import type { Bond, Perspective } from '../../types/Identity';

export interface AuthSlice {
  // Sovereign Identity (ReBAC)
  activePerspective: Perspective | null;
  activeBond: Bond | null;
  availableBonds: Bond[];
  setPerspective: (perspective: Perspective | null) => void;
  setAvailableBonds: (bonds: Bond[]) => void;

  // Profile & User
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;

  // Auth Session
  authSession: Session | null;
  authSessionResolved: boolean;
  setAuthSession: (session: Session | null) => void;
  setAuthSessionResolved: (resolved: boolean) => void;

  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  justFinishedOnboarding: boolean;
  setJustFinishedOnboarding: (justFinished: boolean) => void;

  // Modes & Misc
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
  isExplorerMode: boolean;
  setExplorerMode: (isExplorer: boolean) => void;
  isBridging: boolean;
  setBridging: (isBridging: boolean) => void;
  dismissedSampleIds: string[];
  dismissSample: (id: string) => void;
  demoLogs: Array<{
    module: string;
    method: string;
    payload: unknown;
    timestamp: number;
  }>;
  addDemoLog: (log: { module: string; method: string; payload: unknown }) => void;
  clearDemoLogs: () => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  } | null;
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  hideToast: () => void;

  // DEPRECATED fields removed

  // ── Hydration Gate (Fix 6: Race Condition) ───────────────────────────────
  // This flag is set to `true` by Zustand's `onRehydrateStorage` callback
  // in useAuthStore.ts AFTER all persisted state has been restored from MMKV.
  //
  // WHY: There is a window during app bootstrap where Zustand stores are
  // in-flight (reading from MMKV). If components render in this window,
  // `usePermissions` evaluates with empty `bonds: []` — causing
  // "flash of unauthorized" or incorrect redirects to the onboarding flow.
  //
  // The SanctuaryProvider checks this flag in AssetLoaderWatcher and keeps
  // the loading spinner until `isStoreHydrated === true`.
  isStoreHydrated: boolean;
  setStoreHydrated: (hydrated: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  activePerspective: null,
  activeBond: null,
  availableBonds: [],
  setPerspective: (perspective) =>
    set({
      activePerspective: perspective,
      activeBond: perspective?.activeBond || null,
    }),
  setAvailableBonds: (bonds) => set({ availableBonds: bonds }),

  userName: 'Gurudevi',
  setUserName: (name) => set({ userName: name }),
  user: null,
  setUser: (user) => set({ user }),
  authSession: null,
  authSessionResolved: false,
  setAuthSession: (authSession) => set({ authSession }),
  setAuthSessionResolved: (authSessionResolved) => set({ authSessionResolved }),
  onboardingCompleted: false,
  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
  justFinishedOnboarding: false,
  setJustFinishedOnboarding: (justFinished) => set({ justFinishedOnboarding: justFinished }),
  isDemoMode: false,
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  isExplorerMode: true,
  setExplorerMode: (isExplorer) => set({ isExplorerMode: isExplorer }),
  isBridging: false,
  setBridging: (isBridging) => set({ isBridging }),
  dismissedSampleIds: [],
  dismissSample: (id) =>
    set((state) => ({
      dismissedSampleIds: [...state.dismissedSampleIds, id],
    })),
  demoLogs: [],
  addDemoLog: (log) =>
    set((state) => ({
      demoLogs: [...state.demoLogs, { ...log, timestamp: Date.now() }],
    })),
  clearDemoLogs: () => set({ demoLogs: [] }),
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),
  toast: null,
  showToast: (message, type, duration = 3000) => set({ toast: { message, type, duration } }),
  hideToast: () => set({ toast: null }),
  isStoreHydrated: false,
  setStoreHydrated: (hydrated) => set({ isStoreHydrated: hydrated }),
});
