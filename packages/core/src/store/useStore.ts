import type { AuthSlice } from './slices/auth.slice';
import type { FeatureSlice } from './slices/feature.slice';
import type { TenantSlice } from './slices/tenant.slice';
import type { UISlice } from './slices/ui.slice';
import { useAuthStore } from './useAuthStore';
import { useFeatureStore } from './useFeatureStore';
import { useTenantStore } from './useTenantStore';
import { useUIStore } from './useUIStore';
import { useMemo } from 'react';

/**
 * TotalState - The union of all domain stores.
 */
export type TotalState = AuthSlice & TenantSlice & UISlice & FeatureSlice;

/**
 * useStore - A backward-compatible facade for the sovereign domain stores.
 *
 * Phase 7: Partitioning the "Mega Store" into Auth, Tenant, and UI slices.
 */
interface useStoreInterface {
  (): TotalState;
  <T>(selector: (state: TotalState) => T): T;
  getState(): TotalState;
}

const useStoreFacade = <T>(selector?: (state: TotalState) => T): T | TotalState => {
  const authState = useAuthStore();
  const tenantState = useTenantStore();
  const uiState = useUIStore();
  const featureState = useFeatureStore();

  const combinedState: TotalState = useMemo(() => ({
    ...authState,
    ...tenantState,
    ...uiState,
    ...featureState,
  }), [authState, tenantState, uiState, featureState]);

  return useMemo(() => {
    if (!selector) return combinedState;
    return selector(combinedState);
  }, [combinedState, selector]);
};

const getState = (): TotalState => {
  return {
    ...useAuthStore.getState(),
    ...useTenantStore.getState(),
    ...useUIStore.getState(),
    ...useFeatureStore.getState(),
  };
};

export const useStore = Object.assign(useStoreFacade, {
  getState,
}) as unknown as useStoreInterface & TotalState;
