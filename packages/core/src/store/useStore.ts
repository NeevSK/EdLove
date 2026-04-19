import { useAuthStore } from './useAuthStore';
import { useTenantStore } from './useTenantStore';
import { useUIStore } from './useUIStore';
import type { AuthSlice } from './slices/auth.slice';
import type { TenantSlice } from './slices/tenant.slice';
import type { UISlice } from './slices/ui.slice';
import { useFeatureStore } from './useFeatureStore';
import type { FeatureSlice } from './slices/feature.slice';

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
    
    const combinedState: TotalState = {
        ...authState,
        ...tenantState,
        ...uiState,
        ...featureState,
    };

    if (!selector) return combinedState;
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
    getState
}) as unknown as useStoreInterface & TotalState;
