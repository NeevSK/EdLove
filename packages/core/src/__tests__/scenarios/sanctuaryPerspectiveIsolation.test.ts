import { createPerspectiveStorageScope } from '@repo/core/lib/tenantStorage';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Sanctuary Perspectives & Partitioned Storage Engine', () => {
  beforeEach(() => {
    useTenantStore.getState().resetToPersonalPerspective();
  });

  it('initializes in Personal Sanctuary perspective by default', () => {
    const state = useTenantStore.getState();
    expect(state.activePerspective.kind).toBe('personal');
    expect(state.activePerspective.id).toBe('personal');
    expect(state.schoolId).toBeNull();
  });

  it('switches between Personal Sanctuary and Institutional School Bonds cleanly', () => {
    const schoolBond: SanctuaryPerspective = {
      id: 'bond:royal_college:teacher',
      kind: 'institutional',
      displayName: 'Royal College - Teacher',
      schoolId: 'school-royal-123',
      schoolName: 'Royal College',
      capacity: 'teacher',
      roles: ['teacher'],
    };

    useTenantStore
      .getState()
      .setAvailablePerspectives([
        { id: 'personal', kind: 'personal', displayName: 'Personal Sanctuary' },
        schoolBond,
      ]);

    // Switch to Royal College
    useTenantStore.getState().switchPerspective('bond:royal_college:teacher');
    let state = useTenantStore.getState();
    expect(state.activePerspective.kind).toBe('institutional');
    expect(state.activePerspective.id).toBe('bond:royal_college:teacher');
    expect(state.schoolId).toBe('school-royal-123');
    expect(state.schoolName).toBe('Royal College');

    // Switch back to Personal Sanctuary
    useTenantStore.getState().resetToPersonalPerspective();
    state = useTenantStore.getState();
    expect(state.activePerspective.kind).toBe('personal');
    expect(state.schoolId).toBeNull();
  });

  it('partitions local storage keys strictly across perspectives and users', () => {
    const mockStorageMap = new Map<string, string>();
    const mockBaseStorage = {
      set: (k: string, v: any) => mockStorageMap.set(k, String(v)),
      getString: (k: string) => mockStorageMap.get(k),
      getStringAsync: async (k: string) => mockStorageMap.get(k),
      getBoolean: (k: string) => mockStorageMap.get(k) === 'true',
      getNumber: (k: string) => Number(mockStorageMap.get(k)),
      delete: (k: string) => {
        mockStorageMap.delete(k);
      },
      clearAll: () => mockStorageMap.clear(),
      contains: (k: string) => mockStorageMap.has(k),
    };

    const personalScope = createPerspectiveStorageScope('user-99', 'personal', mockBaseStorage);
    const royalScope = createPerspectiveStorageScope(
      'user-99',
      'bond:royal_college:teacher',
      mockBaseStorage,
    );

    // Write same key into personal vs school perspective
    personalScope.set('lesson_draft', 'My Personal Note');
    royalScope.set('lesson_draft', 'Royal College Curriculum Week 1');

    expect(personalScope.getString('lesson_draft')).toBe('My Personal Note');
    expect(royalScope.getString('lesson_draft')).toBe('Royal College Curriculum Week 1');
  });
});
