import { eventBus, scopedState } from '@repo/core/effect/bindings/state';
import { useExperienceState } from '@repo/core/lib/experienceState.store';
import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import { migrateLegacyDismissalsForCurrentOwner, useUIStore } from '@repo/core/store/useUIStore';

const authScopedDefaults = {
  user: null,
};

const tenantScopedDefaults = {
  tenantResolved: false,
  schoolType: 'generic',
  realClassCount: 0,
};

const uiScopedDefaults = {
  justFinishedOnboarding: false,
  isSidebarCollapsed: false,
  dismissedSampleIds: [],
  deskItems: [],
  isBreathingOpen: false,
  scaffoldCompletions: {},
};

const activeSubTabsScopedDefaults = {
  tabsByDomain: {},
  activeTabByDomain: {},
  pinnedFeatureIdsByDomain: {
    self: ['daily_rhythm', 'mood_lotus', 'decision_journal'],
    workspace: ['attendance', 'gradebook', 'curriculum'],
  },
  preferences: {
    headerStyle: 'adaptive' as const,
    catalogDefaultAction: 'open_in_subtab' as const,
    showActiveSubTabs: true,
    autoHideChromeOnScroll: true,
    maxTabsPerDomain: 5,
    headerLayout: 'greeting' as const,
    tabBarLayout: 'auto' as const,
    assistantButton: 'tutii' as const,
  },
  isChromeVisible: true,
};

export const resetScopedStores = () => {
  eventBus.emit('feedback:clear', {});
  scopedState.pauseWrites(() => {
    useScopeSessionStore.getState().clear();
    useCedarDecisionStore.getState().clearDecisions();
    useAuthStore.setState(authScopedDefaults);
    useExperienceState.setState({
      isDemoMode: false,
      isExplorerMode: true,
      isBridging: false,
      demoLogs: [],
    });
    useTenantStore.setState(tenantScopedDefaults);
    useUIStore.setState(uiScopedDefaults);
    useActiveSubTabsStore.setState(activeSubTabsScopedDefaults);
    useFeatureStore.getState().clear();
    // Commands are partitioned by their original principal. Account lifecycle
    // owns an explicit preserve/quarantine/discard transition; a UI-store reset
    // must never silently destroy work that still needs reconciliation.
    useMutationQueue.setState({ isSyncing: false });
  });
};

export const rehydrateScopedStores = async () => {
  await Promise.all([
    useAuthStore.persist?.rehydrate?.(),
    useTenantStore.persist?.rehydrate?.(),
    useUIStore.persist?.rehydrate?.(),
    useActiveSubTabsStore.persist?.rehydrate?.(),
    useMutationQueue.persist?.rehydrate?.(),
  ]);
  await migrateLegacyDismissalsForCurrentOwner();
  await useExperienceState.persist.rehydrate();
};
