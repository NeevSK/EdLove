import type { ResourceType } from '@repo/core/types/Resource';
import type { StateCreator } from 'zustand';

export interface DeskItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  thumbnailUrl?: string;
  addedAt: string;
}

export interface UISlice {
  justFinishedOnboarding: boolean;
  setJustFinishedOnboarding(value: boolean): void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  dismissedSampleIds: string[];
  dismissSample: (id: string) => void;
  deskItems?: DeskItem[];
  scaffoldCompletions?: Record<string, number>;
  incrementScaffoldCompletion?: (key: string) => void;
  resetScaffoldCompletions?: () => void;
  isBreathingOpen: boolean;
  setBreathingOpen: (open: boolean) => void;
  addToDesk: (item: DeskItem) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  justFinishedOnboarding: false,
  setJustFinishedOnboarding: (justFinishedOnboarding) => set({ justFinishedOnboarding }),
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  dismissedSampleIds: [],
  dismissSample: (id) =>
    set((state) => ({
      dismissedSampleIds: state.dismissedSampleIds.includes(id)
        ? state.dismissedSampleIds
        : [...state.dismissedSampleIds, id],
    })),
  deskItems: [],
  scaffoldCompletions: {},
  incrementScaffoldCompletion: (key: string) =>
    set((state) => ({
      scaffoldCompletions: {
        ...(state.scaffoldCompletions || {}),
        [key]: ((state.scaffoldCompletions || {})[key] || 0) + 1,
      },
    })),
  resetScaffoldCompletions: () => set({ scaffoldCompletions: {} }),
  isBreathingOpen: false,
  setBreathingOpen: (isBreathingOpen) => set({ isBreathingOpen }),
  addToDesk: (item) => set((state) => ({ deskItems: [...(state.deskItems || []), item] })),
});
