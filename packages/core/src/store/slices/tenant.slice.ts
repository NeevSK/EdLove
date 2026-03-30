import { StateCreator } from 'zustand';

export interface TenantSlice {
  schoolId: string | null;
  schoolName: string | null;
  setSchool: (id: string | null, name: string | null) => void;
  tenantResolved: boolean;
  setTenantResolved: (resolved: boolean) => void;
  schoolType?: string | null;
  setSchoolType: (type: string | null) => void;
  realClassCount?: number;
  setRealClassCount: (count: number) => void;
}

export const createTenantSlice: StateCreator<TenantSlice, [], [], TenantSlice> = (set) => ({
  schoolId: null,
  schoolName: null,
  setSchool: (id, name) => set({ schoolId: id, schoolName: name }),
  tenantResolved: false,
  setTenantResolved: (resolved) => set({ tenantResolved: resolved }),
  schoolType: 'generic',
  setSchoolType: (schoolType) => set({ schoolType }),
  realClassCount: 0,
  setRealClassCount: (realClassCount) => set({ realClassCount }),
});
