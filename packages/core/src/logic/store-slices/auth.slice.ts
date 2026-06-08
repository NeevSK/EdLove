import type { Session } from '@supabase/supabase-js';
import type { StateCreator } from 'zustand';
import type { User } from '../../types';
import type { Bond, Perspective } from '../../types/Identity';

export interface AuthSlice {
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;

  // Sovereign Identity (ReBAC)
  activeBond: Bond | null;
  availableBonds: Bond[];
  perspective: Perspective | null;
  setAvailableBonds: (bonds: Bond[]) => void;
  setPerspective: (perspective: Perspective | null) => void;
  authSession: Session | null;
  authSessionResolved: boolean;
  setAuthSession: (session: Session | null) => void;
  setAuthSessionResolved: (resolved: boolean) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  justFinishedOnboarding: boolean;
  setJustFinishedOnboarding: (justFinished: boolean) => void;
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
  setTeacherName: (name: string) => void;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
  } | null;
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  hideToast: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  userName: 'Gurudevi',
  setUserName: (name) => set({ userName: name }),
  user: null,
  setUser: (user) => set({ user }),

  // Sovereign Defaults
  activeBond: null,
  availableBonds: [],
  perspective: null,
  setAvailableBonds: (bonds) =>
    set({
      availableBonds: bonds,
      activeBond: bonds[0] || null,
    }),
  setPerspective: (perspective) =>
    set({ perspective, activeBond: perspective?.activeBond || null }),
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
  setTeacherName: (name) => set({ userName: name }),
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),
  toast: null,
  showToast: (message, type, duration = 3000) => set({ toast: { message, type, duration } }),
  hideToast: () => set({ toast: null }),
});
