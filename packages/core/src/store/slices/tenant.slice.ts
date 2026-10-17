import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import type { StateCreator } from 'zustand';

export interface TenantSlice {
  // Legacy / Facade compatibility fields
  schoolId: string | null;
  schoolName: string | null;
  setSchool: (id: string | null, name: string | null) => void;
  tenantResolved: boolean;
  setTenantResolved: (resolved: boolean) => void;
  schoolType?: string | null;
  setSchoolType: (type: string | null) => void;
  realClassCount?: number;
  setRealClassCount: (count: number) => void;
  academicCycleId: string | null;
  setAcademicCycleId: (id: string | null) => void;

  // First-class Sanctuary Perspective & Bond State
  activePerspective: SanctuaryPerspective;
  availablePerspectives: SanctuaryPerspective[];
  setAvailablePerspectives: (perspectives: SanctuaryPerspective[]) => void;
  switchPerspective: (perspectiveId: string) => void;
  resetToPersonalPerspective: () => void;
}

const DEFAULT_PERSONAL_PERSPECTIVE: SanctuaryPerspective = {
  id: 'personal',
  kind: 'personal',
  displayName: 'Personal Sanctuary',
};

export const createTenantSlice: StateCreator<TenantSlice, [], [], TenantSlice> = (set) => ({
  schoolId: null,
  schoolName: null,
  setSchool: (id, name) =>
    set((state) => {
      if (!id) {
        return {
          schoolId: null,
          schoolName: null,
          activePerspective: DEFAULT_PERSONAL_PERSPECTIVE,
        };
      }
      const existing = state.availablePerspectives.find(
        (p) => p.kind === 'institutional' && p.schoolId === id,
      );
      if (existing) {
        return {
          schoolId: id,
          schoolName: name,
          activePerspective: existing,
        };
      }
      const newInstPerspective: SanctuaryPerspective = {
        id: `bond:${id}`,
        kind: 'institutional',
        displayName: name ?? 'Institutional Workspace',
        schoolId: id,
        schoolName: name ?? 'Institutional Workspace',
        capacity: 'teacher',
        roles: ['teacher'],
      };
      return {
        schoolId: id,
        schoolName: name,
        activePerspective: newInstPerspective,
        availablePerspectives: state.availablePerspectives.some(
          (p) => p.id === newInstPerspective.id,
        )
          ? state.availablePerspectives
          : [...state.availablePerspectives, newInstPerspective],
      };
    }),
  tenantResolved: false,
  setTenantResolved: (resolved) => set({ tenantResolved: resolved }),
  schoolType: 'generic',
  setSchoolType: (schoolType) => set({ schoolType }),
  realClassCount: 0,
  setRealClassCount: (realClassCount) => set({ realClassCount }),
  academicCycleId: null,
  setAcademicCycleId: (academicCycleId) => set({ academicCycleId }),

  activePerspective: DEFAULT_PERSONAL_PERSPECTIVE,
  availablePerspectives: [DEFAULT_PERSONAL_PERSPECTIVE],
  setAvailablePerspectives: (perspectives) =>
    set((state) => {
      const active =
        perspectives.find((p) => p.id === state.activePerspective.id) ??
        perspectives[0] ??
        DEFAULT_PERSONAL_PERSPECTIVE;
      return {
        availablePerspectives: perspectives,
        activePerspective: active,
        schoolId: active.kind === 'institutional' ? active.schoolId : null,
        schoolName: active.kind === 'institutional' ? active.schoolName : null,
      };
    }),
  switchPerspective: (perspectiveId: string) =>
    set((state) => {
      const target = state.availablePerspectives.find((p) => p.id === perspectiveId);
      if (!target) return state;
      return {
        activePerspective: target,
        schoolId: target.kind === 'institutional' ? target.schoolId : null,
        schoolName: target.kind === 'institutional' ? target.schoolName : null,
        schoolType:
          target.kind === 'institutional'
            ? (target.schoolType ?? state.schoolType)
            : state.schoolType,
      };
    }),
  resetToPersonalPerspective: () =>
    set({
      activePerspective: DEFAULT_PERSONAL_PERSPECTIVE,
      schoolId: null,
      schoolName: null,
    }),
});
