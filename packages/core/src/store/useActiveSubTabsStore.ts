import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ActiveSubTabItem {
  id: string;
  title: string;
  route: string;
  params?: Record<string, string>;
  iconName?: string;
  domain: 'workspace' | 'self' | 'classroom' | 'library' | 'community' | 'profile';
  openedAt: number;
}

export interface NavigationPreferences {
  headerStyle: 'adaptive' | 'compact_domain' | 'classic_global' | 'minimal_tabs_only';
  catalogDefaultAction: 'open_in_subtab' | 'navigate_direct';
  showActiveSubTabs: boolean;
  autoHideChromeOnScroll: boolean;
  maxTabsPerDomain: number;
}

export interface ActiveSubTabsState {
  tabsByDomain: Record<string, ActiveSubTabItem[]>;
  activeTabByDomain: Record<string, string>; // domain -> activeTabId
  pinnedFeatureIdsByDomain: Record<string, string[]>; // domain -> featureIds
  preferences: NavigationPreferences;
  isChromeVisible: boolean;

  // Tab operations
  openTab: (tab: Omit<ActiveSubTabItem, 'openedAt'>) => void;
  closeTab: (domain: string, tabId: string) => void;
  setActiveTab: (domain: string, tabId: string) => void;
  clearTabs: (domain?: string) => void;

  // Pinned features
  togglePinFeature: (domain: string, featureId: string) => void;
  isFeaturePinned: (domain: string, featureId: string) => boolean;
  reorderPinnedFeatures: (domain: string, featureIds: string[]) => void;

  // Chrome visibility
  setChromeVisible: (visible: boolean) => void;

  // Preferences & customization
  updatePreferences: (updates: Partial<NavigationPreferences>) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: NavigationPreferences = {
  headerStyle: 'adaptive',
  catalogDefaultAction: 'open_in_subtab',
  showActiveSubTabs: true,
  autoHideChromeOnScroll: true,
  maxTabsPerDomain: 5,
};

const DEFAULT_PINNED_FEATURES: Record<string, string[]> = {
  self: ['daily_rhythm', 'mood_lotus', 'decision_journal'],
  workspace: ['attendance', 'gradebook', 'curriculum'],
};

/**
 * useActiveSubTabsStore: Sovereign, MMKV-persisted store for active sub-tabs / active tasks
 * within mobile domains.
 *
 * Enforces an LRU cap per domain (defaults to 5) to respect mobile memory budgets
 * while allowing agile multitasking between activities (e.g. Attendance, Gradebook, Notes).
 */
export const useActiveSubTabsStore = create<ActiveSubTabsState>()(
  persist(
    (set, get) => ({
      tabsByDomain: {},
      activeTabByDomain: {},
      pinnedFeatureIdsByDomain: DEFAULT_PINNED_FEATURES,
      preferences: DEFAULT_PREFERENCES,
      isChromeVisible: true,

      openTab: (newTab) => {
        set((state) => {
          const domain = newTab.domain;
          const currentTabs = state.tabsByDomain[domain] || [];
          const existingIndex = currentTabs.findIndex((t) => t.id === newTab.id);
          const maxTabs = state.preferences.maxTabsPerDomain || 5;

          let updatedTabs: ActiveSubTabItem[];

          if (existingIndex >= 0) {
            const existing = currentTabs[existingIndex]!;
            const rest = currentTabs.filter((_, idx) => idx !== existingIndex);
            updatedTabs = [...rest, { ...existing, ...newTab, openedAt: Date.now() }];
          } else {
            const withNew = [...currentTabs, { ...newTab, openedAt: Date.now() }];
            if (withNew.length > maxTabs) {
              updatedTabs = withNew.slice(withNew.length - maxTabs);
            } else {
              updatedTabs = withNew;
            }
          }

          return {
            tabsByDomain: {
              ...state.tabsByDomain,
              [domain]: updatedTabs,
            },
            activeTabByDomain: {
              ...state.activeTabByDomain,
              [domain]: newTab.id,
            },
          };
        });
      },

      closeTab: (domain, tabId) => {
        set((state) => {
          const currentTabs = state.tabsByDomain[domain] || [];
          const filtered = currentTabs.filter((t) => t.id !== tabId);
          const currentActive = state.activeTabByDomain[domain];

          let nextActive = currentActive;
          if (currentActive === tabId) {
            nextActive = filtered.length > 0 ? filtered[filtered.length - 1]!.id : '';
          }

          return {
            tabsByDomain: {
              ...state.tabsByDomain,
              [domain]: filtered,
            },
            activeTabByDomain: {
              ...state.activeTabByDomain,
              [domain]: nextActive || '',
            },
          };
        });
      },

      setActiveTab: (domain, tabId) => {
        set((state) => ({
          activeTabByDomain: {
            ...state.activeTabByDomain,
            [domain]: tabId,
          },
        }));
      },

      clearTabs: (domain) => {
        set((state) => {
          if (domain) {
            const nextTabs = { ...state.tabsByDomain };
            const nextActive = { ...state.activeTabByDomain };
            delete nextTabs[domain];
            delete nextActive[domain];
            return { tabsByDomain: nextTabs, activeTabByDomain: nextActive };
          }
          return { tabsByDomain: {}, activeTabByDomain: {} };
        });
      },

      togglePinFeature: (domain, featureId) => {
        set((state) => {
          const current = state.pinnedFeatureIdsByDomain[domain] || [];
          const exists = current.includes(featureId);
          const next = exists ? current.filter((id) => id !== featureId) : [...current, featureId];
          return {
            pinnedFeatureIdsByDomain: {
              ...state.pinnedFeatureIdsByDomain,
              [domain]: next,
            },
          };
        });
      },

      isFeaturePinned: (domain, featureId) => {
        const current = get().pinnedFeatureIdsByDomain[domain] || [];
        return current.includes(featureId);
      },

      reorderPinnedFeatures: (domain, featureIds) => {
        set((state) => ({
          pinnedFeatureIdsByDomain: {
            ...state.pinnedFeatureIdsByDomain,
            [domain]: featureIds,
          },
        }));
      },

      setChromeVisible: (visible) => {
        if (get().isChromeVisible !== visible) {
          set({ isChromeVisible: visible });
        }
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        }));
      },

      resetPreferences: () => {
        set({ preferences: DEFAULT_PREFERENCES });
      },
    }),
    {
      name: 'gurudevi-active-subtabs-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        tabsByDomain: state.tabsByDomain,
        activeTabByDomain: state.activeTabByDomain,
        pinnedFeatureIdsByDomain: state.pinnedFeatureIdsByDomain,
        preferences: state.preferences,
      }),
    },
  ),
);
