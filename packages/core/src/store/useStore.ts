import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { User } from '../types';
import { SchoolType } from '../constants/SriLankanSchools';
import type { Session } from '@supabase/supabase-js';

// ============================================================================
// DESK ITEM - Minimal offline-first representation for Personal Desk
// ============================================================================

export interface DeskItem {
    id: string;
    title: string;
    type: string;
    url?: string;
    thumbnailUrl?: string;
    addedAt: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto' | 'system';

interface AppState {
    userName: string;
    setUserName: (name: string) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    schoolType: SchoolType | null;
    setSchoolType: (type: SchoolType | null) => void;
    authSession: Session | null;
    authSessionResolved: boolean;
    setAuthSession: (session: Session | null) => void;
    setAuthSessionResolved: (resolved: boolean) => void;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    onboardingCompleted: boolean;
    setOnboardingCompleted: (completed: boolean) => void;
    justFinishedOnboarding: boolean;
    setJustFinishedOnboarding: (justFinished: boolean) => void;
    isDemoMode: boolean;
    setDemoMode: (isDemo: boolean) => void;
    isExplorerMode: boolean;
    setExplorerMode: (isExplorer: boolean) => void;
    dismissedSampleIds: string[];
    dismissSample: (id: string) => void;
    restoreSamples: () => void;
    isBridging: boolean;
    setIsBridging: (isBridging: boolean) => void;
    demoLogs: Array<{ module: string; method: string; payload: any; timestamp: number }>;
    addDemoLog: (log: { module: string; method: string; payload: any }) => void;
    clearDemoLogs: () => void;
    deskItems: DeskItem[];
    addToDeskLocal: (item: DeskItem) => void;
    removeFromDeskLocal: (id: string) => void;
    toast: { message: string; type: 'success' | 'error' | 'info'; visible: boolean };
    isOnline: boolean;
    networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
    setOnline: (isOnline: boolean, quality?: 'excellent' | 'good' | 'fair' | 'poor' | 'offline') => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
    isBreathingOpen: boolean;
    setBreathingOpen: (isOpen: boolean) => void;
    realClassCount: number | null;
    setRealClassCount: (count: number | null) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            userName: 'Gurudevi',
            setUserName: (name) => set({ userName: name }),
            user: null,
            setUser: (user) => set({ user }),
            schoolType: null,
            setSchoolType: (type) => set({ schoolType: type }),
            authSession: null,
            authSessionResolved: false,
            setAuthSession: (authSession) => set({ authSession }),
            setAuthSessionResolved: (authSessionResolved) => set({ authSessionResolved }),
            themeMode: 'light', // Default to light mode (dark mode disabled)
            setThemeMode: (mode) => set({ themeMode: mode }),
            onboardingCompleted: false,
            setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
            justFinishedOnboarding: false,
            setJustFinishedOnboarding: (justFinished) => set({ justFinishedOnboarding: justFinished }),
            isDemoMode: false,
            setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
            isExplorerMode: true,
            setExplorerMode: (isExplorer) => set({ isExplorerMode: isExplorer }),
            dismissedSampleIds: [],
            dismissSample: (id) => set((state) => ({
                dismissedSampleIds: [...state.dismissedSampleIds, id]
            })),
            restoreSamples: () => set({ dismissedSampleIds: [] }),
            isBreathingOpen: false,
            setBreathingOpen: (isOpen) => set({ isBreathingOpen: isOpen }),
            realClassCount: null,
            setRealClassCount: (count) => set({ realClassCount: count }),
            isBridging: false,
            setIsBridging: (isBridging) => set({ isBridging }),
            demoLogs: [],
            addDemoLog: (log) => set((state) => ({
                demoLogs: [...state.demoLogs, { ...log, timestamp: Date.now() }]
            })),
            clearDemoLogs: () => set({ demoLogs: [] }),
            deskItems: [],
            addToDeskLocal: (item) => set((state) => ({
                deskItems: state.deskItems.some((d) => d.id === item.id)
                    ? state.deskItems
                    : [...state.deskItems, item],
            })),
            removeFromDeskLocal: (id) => set((state) => ({
                deskItems: state.deskItems.filter((d) => d.id !== id),
            })),
            toast: { message: '', type: 'info', visible: false },
            isOnline: true,
            networkQuality: 'good',
            setOnline: (isOnline, quality) => set({
                isOnline,
                networkQuality: quality || (isOnline ? 'good' : 'offline')
            }),
            showToast: (message, type = 'info') => set({ toast: { message, type, visible: true } }),
            hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),
        }),
        {
            name: 'gurudevi-storage',
            storage: createJSONStorage(() => SafeZustandStorage),
            partialize: (state) => ({
                userName: state.userName,
                user: state.user,
                schoolType: state.schoolType,
                themeMode: state.themeMode,
                onboardingCompleted: state.onboardingCompleted,
                isExplorerMode: state.isExplorerMode,
                dismissedSampleIds: state.dismissedSampleIds,
                deskItems: state.deskItems,
                realClassCount: state.realClassCount,
                // demoLogs, justFinishedOnboarding, isBridging, and toast are session-only
            }),
        }
    )
);
