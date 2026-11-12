import { persistStorage } from '@repo/core/effect/bindings/state';
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
      // The shape on the device today. Bump it, with a `migrate`, when the persisted shape changes.
      version: 0,
      storage: createJSONStorage(() => persistStorage),
      partialize: (state) => ({
        schoolType: state.schoolType,
        realClassCount: state.realClassCount,
      }),
    },
  ),
);
