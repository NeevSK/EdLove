import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';
import { disposeAccountBoundaryQueries, scopedQueryKey } from '../lib/clientStateFoundation';
import { resetScopedStores } from './resetScopedStores';
import { PERSONAL_SCOPE_PERSPECTIVE, useScopeSessionStore } from './scopeSession';
import {
  clearScopeSessionCompatibility,
  commitIdentityScopeSession,
  transitionScopeSession,
} from './scopeSessionCoordinator';
import { useCedarDecisionStore } from './useCedarDecisionStore';

const accountASchoolBond = {
  id: 'bond:account-a:school-a:teacher',
  user_id: 'account-a',
  entity_id: 'school-a',
  entity_type: 'SCHOOL' as const,
  capacity: 'teacher' as const,
  status: 'active' as const,
};

const accountBSchoolBond = {
  id: 'bond:account-b:school-b:admin',
  user_id: 'account-b',
  entity_id: 'school-b',
  entity_type: 'SCHOOL' as const,
  capacity: 'admin' as const,
  status: 'active' as const,
};

describe('G2 scenario: scope-session lifecycle', () => {
  beforeEach(() => {
    resetScopedStores();
  });

  it('evicts Account A scope and Query data before Account B identity becomes visible', async () => {
    const queryClient = new QueryClient();
    const accountAQuery = scopedQueryKey(
      { principalId: 'account-a', tenantId: 'school-a', perspectiveId: accountASchoolBond.id },
      ['attendance'],
    );
    const accountBQuery = scopedQueryKey(
      { principalId: 'account-b', tenantId: 'school-b', perspectiveId: accountBSchoolBond.id },
      ['attendance'],
    );
    const command = queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['command', 'account-a'],
      mutationFn: async () => undefined,
    });
    queryClient.setQueryData(accountAQuery, { learner: 'Account A private record' });
    queryClient.setQueryData(['legacy', 'private-profile'], { principalId: 'account-a' });

    await commitIdentityScopeSession({
      principalId: 'account-a',
      availableBonds: [accountASchoolBond],
      selectedBond: accountASchoolBond,
    });
    expect(useScopeSessionStore.getState().snapshot?.principalId).toBe('account-a');
    expect(useScopeSessionStore.getState().snapshot?.activeBond?.entity_id).toBe('school-a');

    await disposeAccountBoundaryQueries(queryClient, 'account-a');
    clearScopeSessionCompatibility();
    await commitIdentityScopeSession({
      principalId: 'account-b',
      availableBonds: [accountBSchoolBond],
      selectedBond: accountBSchoolBond,
    });
    queryClient.setQueryData(accountBQuery, { learner: 'Account B private record' });

    expect(queryClient.getQueryData(accountAQuery)).toBeUndefined();
    expect(queryClient.getQueryData(['legacy', 'private-profile'])).toBeUndefined();
    expect(queryClient.getQueryData(accountBQuery)).toEqual({
      learner: 'Account B private record',
    });
    expect(queryClient.getMutationCache().find({ mutationId: command.mutationId })).toBe(command);
    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      principalId: 'account-b',
      activeBond: accountBSchoolBond,
      tenantId: 'school-b',
    });
  });

  it('moves Personal Sanctuary to an authorized institutional scope and back without a list-order fallback', async () => {
    const institutionalPerspective = {
      id: accountASchoolBond.id,
      kind: 'institutional' as const,
      displayName: 'School A',
      schoolId: 'school-a',
      schoolName: 'School A',
      capacity: 'teacher' as const,
      roles: ['teacher' as const],
    };
    const availablePerspectives = [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective];

    await transitionScopeSession({
      principalId: 'account-a',
      activePerspective: institutionalPerspective,
      availablePerspectives,
      availableBonds: [accountASchoolBond],
      selectedBond: accountASchoolBond,
    });
    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      activeBond: accountASchoolBond,
      tenantId: 'school-a',
    });

    await transitionScopeSession({
      principalId: 'account-a',
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives,
      availableBonds: [accountASchoolBond],
    });

    expect(useScopeSessionStore.getState().snapshot).toMatchObject({
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      activeBond: null,
      tenantId: null,
    });
  });

  it('returns safely to Personal Sanctuary when institutional capability refresh fails', async () => {
    await transitionScopeSession({
      principalId: null,
      activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
      availableBonds: [],
    });
    const originalLoadDecisions = useCedarDecisionStore.getState().loadDecisions;
    useCedarDecisionStore.setState({
      loadDecisions: async () => {
        throw new Error('offline capability refresh');
      },
    });

    try {
      await expect(
        transitionScopeSession({
          principalId: 'account-a',
          activePerspective: {
            id: accountASchoolBond.id,
            kind: 'institutional',
            displayName: 'School A',
            schoolId: 'school-a',
            schoolName: 'School A',
            capacity: 'teacher',
            roles: ['teacher'],
          },
          availablePerspectives: [
            PERSONAL_SCOPE_PERSPECTIVE,
            {
              id: accountASchoolBond.id,
              kind: 'institutional',
              displayName: 'School A',
              schoolId: 'school-a',
              schoolName: 'School A',
              capacity: 'teacher',
              roles: ['teacher'],
            },
          ],
          availableBonds: [accountASchoolBond],
          selectedBond: accountASchoolBond,
        }),
      ).rejects.toThrow('offline capability refresh');
    } finally {
      useCedarDecisionStore.setState({ loadDecisions: originalLoadDecisions });
    }

    expect(useScopeSessionStore.getState().snapshot?.activePerspective).toEqual(
      PERSONAL_SCOPE_PERSPECTIVE,
    );
  });
});
