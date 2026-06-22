import type { StateCreator } from 'zustand';
import type { ResourceType } from '../../types/Resource';

export interface DeskItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  thumbnailUrl?: string;
  addedAt: string;
}

export interface UISlice {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  themeMode?: 'light' | 'dark' | 'system';
  dismissedSampleIds?: string[];
  deskItems?: DeskItem[];
  isBreathingOpen: boolean;
  setBreathingOpen: (open: boolean) => void;
  addToDesk: (item: DeskItem) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  theme: 'system',
  setTheme: (theme) => set({ theme, themeMode: theme }),
  themeMode: 'system',
  dismissedSampleIds: [],
  deskItems: [],
  isBreathingOpen: false,
  setBreathingOpen: (isBreathingOpen) => set({ isBreathingOpen }),
  addToDesk: (item) => set((state) => ({ deskItems: [...(state.deskItems || []), item] })),
});
