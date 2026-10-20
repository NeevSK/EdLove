import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import {
  closeWorkbenchTask,
  createDomainWorkbenchState,
  createWorkbenchTask,
  openWorkbenchTask,
  reorderWorkbenchTask,
} from '@repo/core/logic/workbench/activeTasks';
import type {
  DomainWorkbenchState,
  TaskTemporalBinding,
  WorkbenchDomain,
  WorkbenchTaskDescriptor,
  WorkbenchTaskLocalStatePolicy,
  WorkbenchTaskResource,
} from '@repo/core/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Legacy aliases remain readable while navigation migrates Profile out of task strips. */
export type ActiveSubTabDomain = WorkbenchDomain | 'classroom' | 'profile';

export interface ActiveSubTabItem extends WorkbenchTaskDescriptor {
  /** React keys and the historical strip API use `id`; it is the canonical task key. */
  id: string;
  params?: Record<string, string>;
  iconName?: string;
}

export interface ActiveSubTabInput {
  /** A legacy feature identifier. New callers should provide `featureId`. */
  id?: string;
  featureId?: string;
  title: string;
  route: string;
  params?: Record<string, string>;
  iconName?: string;
  domain: ActiveSubTabDomain;
  resource?: WorkbenchTaskResource;
  context?: Readonly<Record<string, string>>;
  temporalBinding?: TaskTemporalBinding;
  localStatePolicy?: WorkbenchTaskLocalStatePolicy;
}

export type ActiveSubTabCloseResult =
  | { kind: 'focused-task'; nextTask: ActiveSubTabItem }
  | { kind: 'overview' }
  | { kind: 'not-found' }
  | { kind: 'unsupported-domain' };

export interface NavigationPreferences {
  headerStyle: 'adaptive' | 'compact_domain' | 'classic_global' | 'minimal_tabs_only';
  catalogDefaultAction: 'open_in_subtab' | 'navigate_direct';
  showActiveSubTabs: boolean;
  autoHideChromeOnScroll: boolean;
  maxTabsPerDomain: number;
}

export interface ActiveSubTabsState {
  tabsByDomain: Record<string, ActiveSubTabItem[]>;
  activeTabByDomain: Record<string, string>;
  pinnedFeatureIdsByDomain: Record<string, string[]>;
  preferences: NavigationPreferences;
  isChromeVisible: boolean;
  openTab: (tab: ActiveSubTabInput) => void;
  closeTab: (domain: ActiveSubTabDomain, tabId: string) => ActiveSubTabCloseResult;
  setActiveTab: (domain: ActiveSubTabDomain, tabId: string) => void;
  reorderTab: (domain: ActiveSubTabDomain, tabId: string, destinationIndex: number) => void;
  clearTabs: (domain?: ActiveSubTabDomain) => void;
  togglePinFeature: (domain: string, featureId: string) => void;
  isFeaturePinned: (domain: string, featureId: string) => boolean;
  reorderPinnedFeatures: (domain: string, featureIds: string[]) => void;
  setChromeVisible: (visible: boolean) => void;
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

const isWorkbenchDomain = (domain: ActiveSubTabDomain): domain is WorkbenchDomain =>
  domain === 'self' || domain === 'workspace' || domain === 'community' || domain === 'library';

const now = (): string => new Date().toISOString();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringRecord = (value: unknown): value is Record<string, string> =>
  isRecord(value) && Object.values(value).every((item) => typeof item === 'string');

function migratedPreferences(value: unknown): NavigationPreferences {
  if (!isRecord(value)) return DEFAULT_PREFERENCES;
  const maxTabsPerDomain = value.maxTabsPerDomain;
  return {
    headerStyle:
      value.headerStyle === 'adaptive' ||
      value.headerStyle === 'compact_domain' ||
      value.headerStyle === 'classic_global' ||
      value.headerStyle === 'minimal_tabs_only'
        ? value.headerStyle
        : DEFAULT_PREFERENCES.headerStyle,
    catalogDefaultAction:
      value.catalogDefaultAction === 'open_in_subtab' ||
      value.catalogDefaultAction === 'navigate_direct'
        ? value.catalogDefaultAction
        : DEFAULT_PREFERENCES.catalogDefaultAction,
    showActiveSubTabs:
      typeof value.showActiveSubTabs === 'boolean'
        ? value.showActiveSubTabs
        : DEFAULT_PREFERENCES.showActiveSubTabs,
    autoHideChromeOnScroll:
      typeof value.autoHideChromeOnScroll === 'boolean'
        ? value.autoHideChromeOnScroll
        : DEFAULT_PREFERENCES.autoHideChromeOnScroll,
    maxTabsPerDomain:
      typeof maxTabsPerDomain === 'number' &&
      Number.isInteger(maxTabsPerDomain) &&
      maxTabsPerDomain > 0
        ? maxTabsPerDomain
        : DEFAULT_PREFERENCES.maxTabsPerDomain,
  };
}

export function migrateActiveSubTabsStateForV2(persisted: unknown) {
  if (!isRecord(persisted)) {
    return {
      tabsByDomain: {},
      activeTabByDomain: {},
      pinnedFeatureIdsByDomain: DEFAULT_PINNED_FEATURES,
      preferences: DEFAULT_PREFERENCES,
    };
  }

  const preferences = migratedPreferences(persisted.preferences);
  const pinnedFeatureIdsByDomain = isRecord(persisted.pinnedFeatureIdsByDomain)
    ? Object.fromEntries(
        Object.entries(persisted.pinnedFeatureIdsByDomain).filter(
          ([, ids]) => Array.isArray(ids) && ids.every((id) => typeof id === 'string'),
        ),
      )
    : DEFAULT_PINNED_FEATURES;
  const legacyTabsByDomain = isRecord(persisted.tabsByDomain) ? persisted.tabsByDomain : {};
  const legacyActiveTabByDomain = isStringRecord(persisted.activeTabByDomain)
    ? persisted.activeTabByDomain
    : {};
  const tabsByDomain: Record<string, ActiveSubTabItem[]> = {};
  const activeTabByDomain: Record<string, string> = {};

  for (const domain of ['self', 'workspace', 'community', 'library'] as const) {
    const legacyTabs = legacyTabsByDomain[domain];
    if (!Array.isArray(legacyTabs)) continue;
    const descriptors = legacyTabs.flatMap((legacyTab) => {
      if (!isRecord(legacyTab) || typeof legacyTab.id !== 'string') return [];
      if (typeof legacyTab.title !== 'string' || typeof legacyTab.route !== 'string') return [];
      const creation = createWorkbenchTask(
        {
          domain,
          featureId: typeof legacyTab.featureId === 'string' ? legacyTab.featureId : legacyTab.id,
          title: legacyTab.title,
          route: legacyTab.route,
          temporalBinding: { kind: 'follow-domain' },
          localStatePolicy: 'restore-permitted',
          ...(typeof legacyTab.iconName === 'string' ? { icon: legacyTab.iconName } : {}),
          ...(isStringRecord(legacyTab.params) ? { context: legacyTab.params } : {}),
        },
        typeof legacyTab.openedAt === 'number' && Number.isFinite(legacyTab.openedAt)
          ? new Date(legacyTab.openedAt).toISOString()
          : now(),
      );
      return creation.ok
        ? [
            {
              legacyId: legacyTab.id,
              item: toItem(
                creation.descriptor,
                isStringRecord(legacyTab.params) ? legacyTab.params : undefined,
              ),
            },
          ]
        : [];
    });
    const uniqueDescriptors = descriptors.filter(
      ({ item }, index) =>
        descriptors.findIndex((candidate) => candidate.item.taskKey === item.taskKey) === index,
    );
    if (uniqueDescriptors.length === 0) continue;
    tabsByDomain[domain] = uniqueDescriptors.map(({ item }) => item);
    const activeLegacyId = legacyActiveTabByDomain[domain];
    activeTabByDomain[domain] =
      uniqueDescriptors.find(({ legacyId }) => legacyId === activeLegacyId)?.item.taskKey ??
      uniqueDescriptors[uniqueDescriptors.length - 1]?.item.taskKey ??
      '';
  }

  return { tabsByDomain, activeTabByDomain, pinnedFeatureIdsByDomain, preferences };
}

function toDescriptor(tab: ActiveSubTabItem): WorkbenchTaskDescriptor {
  const { id: _id, params: _params, iconName, ...descriptor } = tab;
  return { ...descriptor, icon: descriptor.icon ?? iconName };
}

function toItem(
  descriptor: WorkbenchTaskDescriptor,
  params?: Record<string, string>,
): ActiveSubTabItem {
  return {
    ...descriptor,
    id: descriptor.taskKey,
    ...(params ? { params } : {}),
    ...(descriptor.icon ? { iconName: descriptor.icon } : {}),
  };
}

function toWorkbenchState(
  domain: WorkbenchDomain,
  tabs: readonly ActiveSubTabItem[],
  activeId: string,
): DomainWorkbenchState {
  return {
    ...createDomainWorkbenchState(domain),
    tasks: tabs.map(toDescriptor),
    focusedTaskKey: tabs.some((tab) => tab.id === activeId) ? activeId : null,
  };
}

function paramsForTask(task: WorkbenchTaskDescriptor, tabs: readonly ActiveSubTabItem[]) {
  return tabs.find((tab) => tab.taskKey === task.taskKey)?.params;
}

/**
 * MMKV-backed mobile adapter for the shared workbench policy. The overview is
 * deliberately absent: an empty task list means the caller should show its floor.
 */
export const useActiveSubTabsStore = create<ActiveSubTabsState>()(
  persist(
    (set, get) => ({
      tabsByDomain: {},
      activeTabByDomain: {},
      pinnedFeatureIdsByDomain: DEFAULT_PINNED_FEATURES,
      preferences: DEFAULT_PREFERENCES,
      isChromeVisible: true,

      openTab: (input) => {
        if (!isWorkbenchDomain(input.domain)) return;
        const domain = input.domain;
        const featureId = input.featureId ?? input.id;
        if (!featureId) throw new Error('Active workbench tasks require a featureId.');

        set((state) => {
          const currentTabs = state.tabsByDomain[domain] ?? [];
          const creation = createWorkbenchTask(
            {
              domain,
              featureId,
              route: input.route,
              title: input.title,
              temporalBinding: input.temporalBinding ?? { kind: 'follow-domain' },
              localStatePolicy: input.localStatePolicy ?? 'restore-permitted',
              ...(input.resource ? { resource: input.resource } : {}),
              ...((input.context ?? input.params)
                ? { context: input.context ?? input.params }
                : {}),
              ...(input.iconName ? { icon: input.iconName } : {}),
            },
            now(),
          );
          if (!creation.ok)
            throw new Error(creation.issues.map((issue) => issue.message).join('; '));

          const result = openWorkbenchTask(
            toWorkbenchState(domain, currentTabs, state.activeTabByDomain[domain] ?? ''),
            creation.descriptor,
            now(),
            {
              maximumTasks: state.preferences.maxTabsPerDomain,
              // The adapter cannot inspect unsaved domain state, so it never evicts silently.
              canEvict: () => false,
            },
          );
          if (result.kind === 'at-capacity') return state;

          const paramsByTaskKey = new Map(
            currentTabs.map((tab) => [tab.taskKey, tab.params] as const),
          );
          paramsByTaskKey.set(creation.descriptor.taskKey, input.params);
          return {
            tabsByDomain: {
              ...state.tabsByDomain,
              [domain]: result.state.tasks.map((task) =>
                toItem(task, paramsByTaskKey.get(task.taskKey)),
              ),
            },
            activeTabByDomain: {
              ...state.activeTabByDomain,
              [domain]: result.state.focusedTaskKey ?? '',
            },
          };
        });
      },

      closeTab: (domain, tabId) => {
        if (!isWorkbenchDomain(domain)) return { kind: 'unsupported-domain' };
        const state = get();
        const currentTabs = state.tabsByDomain[domain] ?? [];
        const result = closeWorkbenchTask(
          toWorkbenchState(domain, currentTabs, state.activeTabByDomain[domain] ?? ''),
          tabId,
        );
        if (result.kind === 'not-found') return { kind: 'not-found' };

        const tabs = result.state.tasks.map((task) =>
          toItem(task, paramsForTask(task, currentTabs)),
        );
        set({
          tabsByDomain: { ...state.tabsByDomain, [domain]: tabs },
          activeTabByDomain: {
            ...state.activeTabByDomain,
            [domain]: result.state.focusedTaskKey ?? '',
          },
        });
        if (result.kind === 'overview') return { kind: 'overview' };
        const nextTask = tabs.find((tab) => tab.id === result.taskKey);
        if (!nextTask) throw new Error('Focused workbench task must exist after close.');
        return { kind: 'focused-task', nextTask };
      },

      setActiveTab: (domain, tabId) => {
        if (!isWorkbenchDomain(domain)) return;
        set((state) => {
          const currentTabs = state.tabsByDomain[domain] ?? [];
          const selected = currentTabs.find((tab) => tab.id === tabId);
          if (!selected) return state;
          const result = openWorkbenchTask(
            toWorkbenchState(domain, currentTabs, state.activeTabByDomain[domain] ?? ''),
            toDescriptor(selected),
            now(),
            { maximumTasks: state.preferences.maxTabsPerDomain, canEvict: () => false },
          );
          if (result.kind !== 'focused-existing') return state;
          return {
            tabsByDomain: {
              ...state.tabsByDomain,
              [domain]: result.state.tasks.map((task) =>
                toItem(task, paramsForTask(task, currentTabs)),
              ),
            },
            activeTabByDomain: {
              ...state.activeTabByDomain,
              [domain]: result.state.focusedTaskKey ?? '',
            },
          };
        });
      },

      reorderTab: (domain, tabId, destinationIndex) => {
        if (!isWorkbenchDomain(domain)) return;
        set((state) => {
          const currentTabs = state.tabsByDomain[domain] ?? [];
          const currentWorkbench = toWorkbenchState(
            domain,
            currentTabs,
            state.activeTabByDomain[domain] ?? '',
          );
          const reordered = reorderWorkbenchTask(currentWorkbench, tabId, destinationIndex);
          if (reordered === currentWorkbench) return state;
          return {
            tabsByDomain: {
              ...state.tabsByDomain,
              [domain]: reordered.tasks.map((task) =>
                toItem(task, paramsForTask(task, currentTabs)),
              ),
            },
          };
        });
      },

      clearTabs: (domain) => {
        set((state) => {
          if (domain) {
            const tabsByDomain = { ...state.tabsByDomain };
            const activeTabByDomain = { ...state.activeTabByDomain };
            delete tabsByDomain[domain];
            delete activeTabByDomain[domain];
            return { tabsByDomain, activeTabByDomain };
          }
          return { tabsByDomain: {}, activeTabByDomain: {} };
        });
      },
      togglePinFeature: (domain, featureId) => {
        set((state) => {
          const current = state.pinnedFeatureIdsByDomain[domain] ?? [];
          return {
            pinnedFeatureIdsByDomain: {
              ...state.pinnedFeatureIdsByDomain,
              [domain]: current.includes(featureId)
                ? current.filter((id) => id !== featureId)
                : [...current, featureId],
            },
          };
        });
      },
      isFeaturePinned: (domain, featureId) =>
        (get().pinnedFeatureIdsByDomain[domain] ?? []).includes(featureId),
      reorderPinnedFeatures: (domain, featureIds) =>
        set((state) => ({
          pinnedFeatureIdsByDomain: { ...state.pinnedFeatureIdsByDomain, [domain]: featureIds },
        })),
      setChromeVisible: (visible) => {
        if (get().isChromeVisible !== visible) set({ isChromeVisible: visible });
      },
      updatePreferences: (updates) =>
        set((state) => ({ preferences: { ...state.preferences, ...updates } })),
      resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),
    }),
    {
      name: 'gurudevi-active-subtabs-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      version: 2,
      migrate: migrateActiveSubTabsStateForV2,
      partialize: (state) => ({
        tabsByDomain: state.tabsByDomain,
        activeTabByDomain: state.activeTabByDomain,
        pinnedFeatureIdsByDomain: state.pinnedFeatureIdsByDomain,
        preferences: state.preferences,
      }),
    },
  ),
);
