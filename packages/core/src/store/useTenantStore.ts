import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { createTenantSlice, type TenantSlice } from '@repo/core/store/slices/tenant.slice';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * useTenantStore: Sovereign store for multi-tenant context and school configuration.
 */
export const useTenantStore = create<TenantSlice>()(
  persist(
    (...a) => ({
      ...createTenantSlice(...a),
    }),
    {
      name: 'gurudevi-tenant-storage',
      storage: createJSONStorage(() => SafeZustandStorage),
      partialize: (state) => ({
        schoolId: state.schoolId,
        schoolName: state.schoolName,
        schoolType: state.schoolType,
        realClassCount: state.realClassCount,
      }),
    },
  ),
);
