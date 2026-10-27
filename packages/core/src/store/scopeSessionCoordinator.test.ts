import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetScopedStores } from './resetScopedStores';
import { PERSONAL_SCOPE_PERSPECTIVE, useScopeSessionStore } from './scopeSession';
import {
  clearScopeSessionCompatibility,
  commitIdentityScopeSession,
  transitionScopeSession,
} from './scopeSessionCoordinator';
import { useAuthStore } from './useAuthStore';
import { useCedarDecisionStore } from './useCedarDecisionStore';
import { useTenantStore } from './useTenantStore';

const institutionalPerspective = {
  id: 'bond:school-a:teacher',
  kind: 'institutional' as const,
  displayName: 'School A',
  schoolId: 'school-a',
  schoolName: 'School A',
  capacity: 'teacher' as const,
  roles: ['teacher' as const],
};

const institutionalBond = {
  id: 'bond:school-a:teacher',
  user_id: 'principal-a',
  entity_id: 'school-a',
  entity_type: 'SCHOOL' as const,
  capacity: 'teacher' as const,
  status: 'active' as const,
};

const nextInstitutionalPerspective = {
  id: 'bond:school-b:admin',
  kind: 'institutional' as const,
  displayName: 'School B',
  schoolId: 'school-b',
  schoolName: 'School B',
  capacity: 'admin' as const,
  roles: ['admin' as const],
};

const nextInstitutionalBond = {
  id: nextInstitutionalPerspective.id,
  user_id: 'principal-b',
  entity_id: 'school-b',
  entity_type: 'SCHOOL' as const,
  capacity: 'admin' as const,
  status: 'active' as const,
};

describe('scope session coordinator', () => {
  beforeEach(() => {
    resetScopedStores();
  });

  it.each(['resolve', 'reject'] as const)(
    'does not let old capability %s undo a newer account',
    async (outcome) => {
      const previousLoader = useCedarDecisionStore.getState().loadDecisions;
      const pending = Promise.withResolvers<void>();
      useCedarDecisionStore.setState({
        loadDecisions: vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue(undefined),
      });
      try {
        const older = transitionScopeSession({
          principalId: 'principal-a',
          activePerspective: institutionalPerspective,
          availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
          availableBonds: [institutionalBond],
          selectedBond: institutionalBond,
        });
        const rejection = expect(older).rejects.toThrow(
          outcome === 'reject' ? 'old load failed' : 'superseded',
        );
        await transitionScopeSession({
          principalId: 'principal-b',
          activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
          availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
          availableBonds: [],
        });
        if (outcome === 'reject') pending.reject(new Error('old load failed'));
        else pending.resolve();
        await rejection;
        expect(useScopeSessionStore.getState().snapshot?.principalId).toBe('principal-b');
      } finally {
        useCedarDecisionStore.setState({ loadDecisions: previousLoader });
      }
    },
  );

  it('does not revive a pending transition when a newer failure restores its snapshot', async () => {
    const previousLoader = useCedarDecisionStore.getState().loadDecisions;
    const pending = Promise.withResolvers<void>();
    useCedarDecisionStore.setState({
      loadDecisions: vi
        .fn()
        .mockReturnValueOnce(pending.promise)
        .mockRejectedValueOnce(new Error('newer load failed')),
    });
    try {
      const older = transitionScopeSession({
        principalId: 'principal-a',
        activePerspective: institutionalPerspective,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [institutionalBond],
        selectedBond: institutionalBond,
      });
      const rejection = expect(older).rejects.toThrow('superseded');
      await expect(
        transitionScopeSession({
          principalId: 'principal-b',
          activePerspective: nextInstitutionalPerspective,
          availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, nextInstitutionalPerspective],
          availableBonds: [nextInstitutionalBond],
          selectedBond: nextInstitutionalBond,
        }),
      ).rejects.toThrow('newer load failed');
      pending.resolve();
      await rejection;
      expect(useScopeSessionStore.getState().snapshot?.principalId).toBe('principal-a');
      expect(useScopeSessionStore.getState().snapshot?.activeBond).toEqual(institutionalBond);
      expect(useCedarDecisionStore.getState().decisions).toBeNull();
    } finally {
      useCedarDecisionStore.setState({ loadDecisions: previousLoader });
    }
  });

  it.each(['resolve', 'reject'] as const)(
    'keeps cleared scope empty after old capability %s',
    async (outcome) => {
      const previousLoader = useCedarDecisionStore.getState().loadDecisions;
      const pending = Promise.withResolvers<void>();
      useCedarDecisionStore.setState({ loadDecisions: () => pending.promise });
      try {
        const older = transitionScopeSession({
          principalId: 'principal-a',
          activePerspective: institutionalPerspective,
          availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
          availableBonds: [institutionalBond],
          selectedBond: institutionalBond,
        });
        const rejection = expect(older).rejects.toThrow(
          outcome === 'reject' ? 'old load failed' : 'superseded',
        );
        clearScopeSessionCompatibility();
        if (outcome === 'reject') pending.reject(new Error('old load failed'));
        else pending.resolve();
        await rejection;
        expect(useScopeSessionStore.getState().snapshot).toBeNull();
      } finally {
        useCedarDecisionStore.setState({ loadDecisions: previousLoader });
      }
    },
  );

  it('commits the canonical personal scope and required identity projections', async () => {
    await transitionScopeSession({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
      availableBonds: [],
    });

    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      activeBond: null,
      tenantId: null,
    });
    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
    expect(useScopeSessionStore.getState().snapshot?.activeBond).toBeNull();
  });

  it('keeps active scope out of auth and tenant compatibility stores', async () => {
    await transitionScopeSession({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
      availableBonds: [],
    });

    expect('activePerspective' in useAuthStore.getState()).toBe(false);
    expect('activeBond' in useAuthStore.getState()).toBe(false);
    expect('activePerspective' in useTenantStore.getState()).toBe(false);
    expect('schoolId' in useTenantStore.getState()).toBe(false);
    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
  });

  it('restores only account-owned workspace metadata as a non-authority hint', async () => {
    const workspacePerspective = {
      id: 'batch-one',
      kind: 'commercial' as const,
      displayName: 'Physics batch',
      instituteId: 'institute-one',
      instituteName: 'Institute One',
      subjectId: 'physics',
      subjectName: 'Physics',
      grade: 'Grade 11',
      medium: 'english' as const,
      batchId: 'batch-one',
      batchName: 'Physics batch',
      role: 'lead_tutor' as const,
      displayTitle: 'Physics batch',
    };
    await transitionScopeSession({
      principalId: 'metadata-principal',
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, workspacePerspective],
      availableBonds: [],
    });

    resetScopedStores();

    expect(useScopeSessionStore.getState().snapshot).toBeNull();
    await commitIdentityScopeSession({
      principalId: 'metadata-principal',
      availableBonds: [],
      selectedBond: null,
    });
    expect(useScopeSessionStore.getState().snapshot?.availablePerspectives).toContainEqual(
      workspacePerspective,
    );
    expect(useScopeSessionStore.getState().snapshot?.activeBond).toBeNull();
    await commitIdentityScopeSession({
      principalId: 'other-metadata-principal',
      availableBonds: [],
      selectedBond: null,
    });
    expect(useScopeSessionStore.getState().snapshot?.availablePerspectives).toEqual([
      PERSONAL_SCOPE_PERSPECTIVE,
    ]);
  });

  it('does not hydrate Cedar authority for a workspace lens without a canonical bond', async () => {
    const loadDecisions = vi.fn().mockResolvedValue(undefined);
    useCedarDecisionStore.setState({ loadDecisions });
    const workspacePerspective = {
      id: 'batch-one',
      kind: 'commercial' as const,
      displayName: 'Physics batch',
      instituteId: 'institute-one',
      instituteName: 'Institute One',
      subjectId: 'physics',
      subjectName: 'Physics',
      grade: 'Grade 11',
      medium: 'english' as const,
      batchId: 'batch-one',
      batchName: 'Physics batch',
      role: 'lead_tutor' as const,
      displayTitle: 'Physics batch',
    };

    await transitionScopeSession({
      principalId: 'metadata-principal',
      activePerspective: workspacePerspective,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, workspacePerspective],
      availableBonds: [],
    });

    expect(loadDecisions).not.toHaveBeenCalled();
    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      activePerspective: workspacePerspective,
      activeBond: null,
      authorityKind: 'workspace',
    });
  });

  it('rolls back all mirrors when capability loading rejects after a scope write', async () => {
    await transitionScopeSession({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
      availableBonds: [],
    });
    const loadDecisions = useCedarDecisionStore.getState().loadDecisions;
    useCedarDecisionStore.setState({
      loadDecisions: async () => {
        throw new Error('capability refresh failed');
      },
    });

    try {
      await expect(
        transitionScopeSession({
          principalId: 'principal-a',
          activePerspective: institutionalPerspective,
          availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
          availableBonds: [institutionalBond],
          selectedBond: institutionalBond,
        }),
      ).rejects.toThrow('capability refresh failed');
    } finally {
      useCedarDecisionStore.setState({ loadDecisions });
    }

    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
    expect(useScopeSessionStore.getState().snapshot?.activeBond).toBeNull();
  });

  it('clears only derived scope mirrors without touching unrelated store state', async () => {
    await transitionScopeSession({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
      availableBonds: [],
    });
    useAuthStore.setState({ user: { id: 'principal-a', display_name: 'Retained profile name' } });

    clearScopeSessionCompatibility();

    expect(useScopeSessionStore.getState().snapshot).toBeNull();
    expect(useAuthStore.getState()).toMatchObject({
      user: { id: 'principal-a', display_name: 'Retained profile name' },
    });
  });

  it('projects every server-authorized school bond while activating only the selected bond', async () => {
    const secondInstitutionalBond = {
      ...institutionalBond,
      id: 'bond:school-b:admin',
      entity_id: 'school-b',
      capacity: 'admin' as const,
    };
    await commitIdentityScopeSession({
      principalId: 'principal-a',
      availableBonds: [institutionalBond, secondInstitutionalBond],
      selectedBond: institutionalBond,
      schoolType: 'government',
    });

    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      principalId: 'principal-a',
      activeBond: institutionalBond,
      tenantId: 'school-a',
      activePerspective: {
        id: institutionalBond.id,
        kind: 'institutional',
        schoolId: 'school-a',
        schoolType: 'government',
        roles: ['teacher'],
      },
    });
    expect(useScopeSessionStore.getState().snapshot?.activeBond).toEqual(institutionalBond);
    expect(useScopeSessionStore.getState().snapshot?.tenantId).toBe('school-a');
    expect(useScopeSessionStore.getState().snapshot?.availablePerspectives).toEqual([
      PERSONAL_SCOPE_PERSPECTIVE,
      expect.objectContaining({ id: institutionalBond.id, schoolId: 'school-a' }),
      expect.objectContaining({ id: secondInstitutionalBond.id, schoolId: 'school-b' }),
    ]);

    const hydrated = useScopeSessionStore.getState().snapshot;
    if (!hydrated) throw new Error('Expected identity scope hydration to commit a snapshot.');
    const secondPerspective = hydrated.availablePerspectives.find(
      (perspective) => perspective.id === secondInstitutionalBond.id,
    );
    if (!secondPerspective) throw new Error('Expected the second school bond to be available.');

    await transitionScopeSession({
      principalId: hydrated.principalId,
      activePerspective: secondPerspective,
      availablePerspectives: hydrated.availablePerspectives,
      availableBonds: hydrated.availableBonds,
      selectedBond: secondInstitutionalBond,
    });

    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      activeBond: secondInstitutionalBond,
      tenantId: 'school-b',
    });
  });

  it('keeps an unsupported selected bond as a personal perspective without guessing its type', async () => {
    const personalBond = {
      ...institutionalBond,
      id: 'bond:personal-a',
      entity_id: 'personal-a',
      entity_type: 'PERSONAL_CLASSROOM' as const,
    };
    await commitIdentityScopeSession({
      principalId: 'principal-a',
      availableBonds: [personalBond],
      selectedBond: personalBond,
    });

    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      activeBond: personalBond,
      tenantId: null,
    });
  });
});
