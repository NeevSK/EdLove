import { StateCreator } from 'zustand';

export interface UISlice {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  themeMode?: 'light' | 'dark' | 'system';
  dismissedSampleIds?: string[];
  deskItems?: unknown[];
  isBreathingOpen: boolean;
  setBreathingOpen: (open: boolean) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  themeMode: 'system',
  dismissedSampleIds: [],
  deskItems: [],
  isBreathingOpen: false,
  setBreathingOpen: (isBreathingOpen) => set({ isBreathingOpen }),
});
