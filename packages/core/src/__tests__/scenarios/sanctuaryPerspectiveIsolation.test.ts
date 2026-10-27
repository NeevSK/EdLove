import { createPerspectiveStorageScope } from '@repo/core/lib/tenantStorage';
import { resetScopedStores } from '@repo/core/store/resetScopedStores';
import { PERSONAL_SCOPE_PERSPECTIVE, useScopeSessionStore } from '@repo/core/store/scopeSession';
import { transitionScopeSession } from '@repo/core/store/scopeSessionCoordinator';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Sanctuary Perspectives & Partitioned Storage Engine', () => {
  beforeEach(() => {
    resetScopedStores();
  });

  it('commits Personal Sanctuary as the canonical initial scope', async () => {
    await transitionScopeSession({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
      availableBonds: [],
    });

    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
    expect(useScopeSessionStore.getState().snapshot?.activeBond).toBeNull();
  });

  it('switches between personal scope and an account-owned school bond', async () => {
    const schoolBond = {
      id: 'bond:royal_college:teacher',
      user_id: 'user-99',
      entity_type: 'SCHOOL' as const,
      schoolId: 'school-royal-123',
      entity_id: 'school-royal-123',
      capacity: 'teacher',
      status: 'active' as const,
    };
    const schoolPerspective = {
      id: schoolBond.id,
      kind: 'institutional' as const,
      displayName: 'Royal College - Teacher',
      schoolId: schoolBond.entity_id,
      schoolName: 'Royal College',
      capacity: schoolBond.capacity,
      roles: [schoolBond.capacity],
    };
    const availablePerspectives = [PERSONAL_SCOPE_PERSPECTIVE, schoolPerspective];

    await transitionScopeSession({
      principalId: 'user-99',
      activePerspective: schoolPerspective,
      availablePerspectives,
      availableBonds: [schoolBond],
      selectedBond: schoolBond,
    });
    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      activePerspective: schoolPerspective,
      activeBond: schoolBond,
    });
    expect(useScopeSessionStore.getState().snapshot?.tenantId).toBe('school-royal-123');

    await transitionScopeSession({
      principalId: 'user-99',
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives,
      availableBonds: [schoolBond],
    });
    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
    expect(useScopeSessionStore.getState().snapshot?.activeBond).toBeNull();
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
