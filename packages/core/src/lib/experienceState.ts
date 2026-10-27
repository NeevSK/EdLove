import { createScopedStateStorage } from '@repo/core/lib/scopedStateStorage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface DemoIntent {
  module: string;
  method: string;
  payload: unknown;
  timestamp: number;
}
interface ExperienceState {
  isDemoMode: boolean;
  isExplorerMode: boolean;
  isBridging: boolean;
  demoLogs: DemoIntent[];
  setDemoMode(value: boolean): void;
  setExplorerMode(value: boolean): void;
  setBridging(value: boolean): void;
  addDemoLog(intent: Omit<DemoIntent, 'timestamp'>): void;
  clearDemoLogs(): void;
}

let isExperienceStateHydrated = false;

export const useExperienceState = create<ExperienceState>()(
  persist(
    (set) => ({
      isDemoMode: false,
      isExplorerMode: true,
      isBridging: false,
      demoLogs: [],
      setDemoMode: (isDemoMode) => set({ isDemoMode }),
      setExplorerMode: (isExplorerMode) => set({ isExplorerMode }),
      setBridging: (isBridging) => set({ isBridging }),
      addDemoLog: (intent) =>
        set((state) => ({ demoLogs: [...state.demoLogs, { ...intent, timestamp: Date.now() }] })),
      clearDemoLogs: () => set({ demoLogs: [] }),
    }),
    {
      name: 'gurudevi-experience-state',
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => {
        const scoped = createScopedStateStorage();
        return {
          getItem: (name: string) => scoped.getItem(name),
          removeItem: (name: string) => scoped.removeItem(name),
          setItem: (name: string, value: string): unknown =>
            isExperienceStateHydrated ? scoped.setItem(name, value) : Promise.resolve(),
        };
      }),
      onRehydrateStorage: () => {
        isExperienceStateHydrated = false;
        return (_state, error) => {
          isExperienceStateHydrated = !error;
        };
      },
      partialize: (state) => ({ isExplorerMode: state.isExplorerMode }),
      migrate: (value, version) => {
        if (version > 1) throw new Error('Experience preferences require a newer reader.');
        return {
          isExplorerMode: !(
            typeof value === 'object' &&
            value !== null &&
            'isExplorerMode' in value &&
            value.isExplorerMode === false
          ),
        };
      },
      merge: (value, current) => ({
        ...current,
        isExplorerMode:
          typeof value === 'object' &&
          value !== null &&
          'isExplorerMode' in value &&
          typeof value.isExplorerMode === 'boolean'
            ? value.isExplorerMode
            : current.isExplorerMode,
      }),
    },
  ),
);
