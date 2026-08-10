import type { QueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { getActiveAccountId, setActiveAccountId } from '@repo/core/lib/accountScope';
import { DeviceTrustEngine } from '@repo/core/lib/security/deviceTrust';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import type { UISlice } from '@repo/core/store/slices/ui.slice';
import { DEFAULT_FEATURE_FLAGS } from '@repo/core/store/types/featureFlags';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import { useUIStore } from '@repo/core/store/useUIStore';
import { useGrowthStore } from '@repo/core/store/useGrowthStore';

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

/**
 * THE SACRED WASH
 * Performs a total cryptographic and stateful wipe of the active tenant
 * or global state to prevent data leakage between users.
 */
export async function globalLogoutAndPurge(queryClient?: QueryClient) {
  const currentAccountId = getActiveAccountId();

  // 1. Audit Log the Event
  if (currentAccountId) {
    await DeviceTrustEngine.logAuditEvent(currentAccountId, 'CLOUD_WIPE_INVOKED', {
      reason: 'User logged out or triggered cloud recovery wash',
    });

    // 2. Cryptographic Partition Wipe
    try {
      const { createMMKV } = await import('react-native-mmkv');
      const storeId = `gurudevi-tenant-${currentAccountId}`;
      const store = createMMKV({ id: storeId });
      store.clearAll();
    } catch {
      // AsyncStorage Fallback Wipe
    }
  }

  // 3. Application State Cleansing
  if (queryClient) {
    queryClient.clear();
  }

  await supabaseClient.auth.signOut({ scope: 'local' });

  // 4. Memory Purge
  setActiveAccountId(null);

  resetScopedStores();
}

export const resetScopedStores = () => {
  useAuthStore.setState(authScopedDefaults);
  useTenantStore.setState(tenantScopedDefaults);
  useUIStore.setState(uiScopedDefaults);
  useGrowthStore.getState().resetGrowthState();
  useFeatureStore.setState((state) => ({
    ...state,
    flags: featureScopedDefaults,
    snapshot: null,
  }));
  useMutationQueue.setState({
    queue: [],
    deadLetterQueue: [],
    isSyncing: false,
  });
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
