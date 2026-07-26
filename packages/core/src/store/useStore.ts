import { useMemo } from 'react';
import type { AuthSlice } from '@/store/slices/auth.slice';
import type { FeatureSlice } from '@/store/slices/feature.slice';
import type { TenantSlice } from '@/store/slices/tenant.slice';
import type { UISlice } from '@/store/slices/ui.slice';
import { useAuthStore } from '@/store/useAuthStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useTenantStore } from '@/store/useTenantStore';
import { useUIStore } from '@/store/useUIStore';

/**
 * TotalState - The union of all domain stores.
 */
export type TotalState = AuthSlice & TenantSlice & UISlice & FeatureSlice;

/**
 * useStore - A backward-compatible facade for the sovereign domain stores.
 *
 * ⚠️ 2026 WARNING: This is a "Facade Trap". Subscribing via useStore() without
 * a selector will cause re-renders on EVERY change to ANY store.
 *
 * PREFERRED: Use domain-specific stores (e.g., useAuthStore) with atomic selectors.
 */
interface useStoreInterface {
  (): TotalState;
  <T>(selector: (state: TotalState) => T): T;
  getState(): TotalState;
}

const useStoreFacade = <T>(selector?: (state: TotalState) => T): T | TotalState => {
  // We subscribe to all stores to maintain the "Mega Store" illusion.
  // In a pure 2026 architecture, this facade would be deleted in favor of atomic hooks.
  const authState = useAuthStore();
  const tenantState = useTenantStore();
  const uiState = useUIStore();
  const featureState = useFeatureStore();

  const combinedState: TotalState = useMemo(
    () => ({
      ...authState,
      ...tenantState,
      ...uiState,
      ...featureState,
    }),
    [authState, tenantState, uiState, featureState],
  );

  // If no selector, return the whole thing (Subscribes to EVERYTHING)
  if (!selector) return combinedState;

  // Execute selector.
  // Note: If the selector is an anonymous function, this will re-run every render,
  // but it will only trigger a downstream re-render if the returned value (primitive) changes.
  return selector(combinedState);
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
