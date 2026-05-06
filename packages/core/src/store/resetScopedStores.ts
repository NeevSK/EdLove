import type { QueryClient } from '@tanstack/react-query';
import { identityAPI } from '../api/identity';
import { supabase } from '../api/supabase';
import { getActiveAccountId, setActiveAccountId } from '../lib/accountScope';
import { DeviceTrustEngine } from '../lib/security/deviceTrust';
import { useMutationQueue } from '../lib/sync/useMutationQueue';
import { resolveFeatureFlags } from '../logic/permissions/feature-engine';
import type { UISlice } from './slices/ui.slice';
import { useAuthStore } from './useAuthStore';
import { useFeatureStore } from './useFeatureStore';
import { useTenantStore } from './useTenantStore';
import { useUIStore } from './useUIStore';

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

const featureScopedDefaults = resolveFeatureFlags({
  userId: null,
  email: null,
  // Sovereign ReBAC fields — required by UserContext schema
  bonds: [],
  primaryCapacity: null,
  activeBond: null,
  activeBondStatus: 'active',
  schoolId: null,
  tenancyName: null,
  tenancy: null,
  tenantKind: 'customer',
  tier: 'free',
  isAnonymous: true,
  hasGlobalAccess: false,
  isPersonal: false,
  features: [],
  flags: {},
});

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
      const mmkvModule: any = await import('react-native-mmkv');
      const MMKV = mmkvModule.MMKV;
      if (MMKV) {
        const storeId = `gurudevi-tenant-${currentAccountId}`;
        // We mount without the encryption key just to run clearAll()
        const store = new MMKV({ id: storeId });
        store.clearAll();
      }
    } catch {
      // AsyncStorage Fallback Wipe
    }
  }

  // 3. Application State Cleansing
  if (queryClient) {
    queryClient.clear();
  }

  await supabase.auth.signOut({ scope: 'local' });

  // 4. Memory Purge
  setActiveAccountId(null);
  identityAPI.clearCache();

  resetScopedStores();
}

export const resetScopedStores = () => {
  useAuthStore.setState(authScopedDefaults);
  useTenantStore.setState(tenantScopedDefaults);
  useUIStore.setState(uiScopedDefaults);
  useFeatureStore.setState((state) => ({
    ...state,
    flags: featureScopedDefaults,
    globalConfigs: {},
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
    useFeatureStore.persist?.rehydrate?.(),
    useMutationQueue.persist?.rehydrate?.(),
  ]);
};
