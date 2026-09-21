import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import type { UISlice } from '@repo/core/store/slices/ui.slice';
import { DEFAULT_FEATURE_FLAGS } from '@repo/core/store/types/featureFlags';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useGrowthStore } from '@repo/core/store/useGrowthStore';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import { useUIStore } from '@repo/core/store/useUIStore';

const authScopedDefaults = {
  userName: 'Gurudevi',
  user: null,
  authSession: null,
  authSessionResolved: false,
  onboardingCompleted: false,
  justFinishedOnboarding: false,
  experienceMode: 'live' as const,
  isDemoMode: false,
  isSandboxMode: false,
  isExplorerMode: true,
  isBridging: false,
  dismissedSampleIds: [],
  demoLogs: [],
  isOnline: true,
  toast: null,
};

const tenantScopedDefaults = {
  schoolId: null,
  schoolName: null,
  tenantResolved: false,
  schoolType: 'generic',
  realClassCount: 0,
};

const uiScopedDefaults: Partial<UISlice> = {
  isSidebarCollapsed: false,
  theme: 'system' as UISlice['theme'],
  themeMode: 'system' as NonNullable<UISlice['themeMode']>,
  dismissedSampleIds: [],
  deskItems: [],
  isBreathingOpen: false,
};

const featureScopedDefaults = { ...DEFAULT_FEATURE_FLAGS };

export const resetScopedStores = () => {
  useAuthStore.setState(authScopedDefaults);
  useTenantStore.setState(tenantScopedDefaults);
  usePerspectiveStore.getState().resetToPersonalPerspective();
  useUIStore.setState(uiScopedDefaults);
  useGrowthStore.getState().resetGrowthState();
  useFeatureStore.setState((state) => ({
    ...state,
    flags: featureScopedDefaults,
    snapshot: null,
  }));
  // Commands are partitioned by their original principal. Account lifecycle
  // owns an explicit preserve/quarantine/discard transition; a UI-store reset
  // must never silently destroy work that still needs reconciliation.
  useMutationQueue.setState({ isSyncing: false });
};

export const rehydrateScopedStores = async () => {
  await Promise.all([
    useAuthStore.persist?.rehydrate?.(),
    useTenantStore.persist?.rehydrate?.(),
    useUIStore.persist?.rehydrate?.(),
    useGrowthStore.persist?.rehydrate?.(),
    useFeatureStore.persist?.rehydrate?.(),
    useMutationQueue.persist?.rehydrate?.(),
  ]);
};
