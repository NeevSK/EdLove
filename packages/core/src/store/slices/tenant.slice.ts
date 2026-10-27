import type { StateCreator } from 'zustand';

export interface TenantSlice {
  // Legacy / Facade compatibility fields
  tenantResolved: boolean;
  setTenantResolved: (resolved: boolean) => void;
  schoolType?: string | null;
  setSchoolType: (type: string | null) => void;
  realClassCount?: number;
  setRealClassCount: (count: number) => void;
  academicCycleId: string | null;
  setAcademicCycleId: (id: string | null) => void;

}

export const createTenantSlice: StateCreator<TenantSlice, [], [], TenantSlice> = (set) => ({
  tenantResolved: false,
  setTenantResolved: (resolved) => set({ tenantResolved: resolved }),
  schoolType: 'generic',
  setSchoolType: (schoolType) => set({ schoolType }),
  realClassCount: 0,
  setRealClassCount: (realClassCount) => set({ realClassCount }),
  academicCycleId: null,
  setAcademicCycleId: (academicCycleId) => set({ academicCycleId }),

});
