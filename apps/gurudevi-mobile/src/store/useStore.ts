import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SafeZustandStorage } from '../lib/storageWrapper';
import { UserRole } from '../types/User';
import { SchoolType } from '../constants/SriLankanSchools';

export type ThemeMode = 'light' | 'dark' | 'auto' | 'system';

interface AppState {
    teacherName: string;
    setTeacherName: (name: string) => void;
    userRole: UserRole | null;
    setUserRole: (role: UserRole | null) => void;
    schoolType: SchoolType | null;
    setSchoolType: (type: SchoolType | null) => void;
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
    toast: { message: string; type: 'success' | 'error' | 'info'; visible: boolean };
    isOnline: boolean;
    networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
    setOnline: (isOnline: boolean, quality?: 'excellent' | 'good' | 'fair' | 'poor' | 'offline') => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            teacherName: 'Gurudevi',
            setTeacherName: (name) => set({ teacherName: name }),
            userRole: null,
            setUserRole: (role) => set({ userRole: role }),
            schoolType: null,
            setSchoolType: (type) => set({ schoolType: type }),
            themeMode: 'system', // Default to system theme preference
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
            isBridging: false,
            setIsBridging: (isBridging) => set({ isBridging }),
            demoLogs: [],
            addDemoLog: (log) => set((state) => ({
                demoLogs: [...state.demoLogs, { ...log, timestamp: Date.now() }]
            })),
            clearDemoLogs: () => set({ demoLogs: [] }),
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
                teacherName: state.teacherName,
                userRole: state.userRole,
                schoolType: state.schoolType,
                themeMode: state.themeMode,
                onboardingCompleted: state.onboardingCompleted,
                isExplorerMode: state.isExplorerMode,
                dismissedSampleIds: state.dismissedSampleIds,
                // demoLogs, justFinishedOnboarding, isBridging, and toast are session-only
            }),
        }
    )
);
