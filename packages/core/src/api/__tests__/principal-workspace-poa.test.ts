jest.mock('../../domains/principalWorkspace/runtime', () => ({
  principalWorkspaceServices: {
    listInviteCodes: jest.fn(),
    generateInviteCode: jest.fn(),
    listObservationsByDate: jest.fn(),
    listRecentObservations: jest.fn(),
    createObservation: jest.fn(),
    recordInviteEvent: jest.fn(),
    recordObservationFollowUp: jest.fn(),
    getGovernanceTimeline: jest.fn(),
    getGovernanceSnapshotAsOf: jest.fn(),
  },
}));

import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from '../principalWorkspace';
import { principalWorkspaceContract } from '../principalWorkspace.contract';

describe('principal workspace POA coverage', () => {
  test('principal workspace public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawPrincipalWorkspaceAPI,
      defineContractCoverage({
        moduleName: 'principalWorkspace-test',
        contract: principalWorkspaceContract,
      }),
    );

    expect(coverage.contract).toBe(principalWorkspaceContract);
  });

  test('principal workspace routes carry authority metadata', () => {
    expect(principalWorkspaceContract.listInviteCodes.metadata?.authority).toEqual({
      action: 'read',
      subject: 'SchoolInvite',
    });
    expect(principalWorkspaceContract.generateInviteCode.metadata?.authority).toEqual({
      action: 'create',
      subject: 'SchoolInvite',
    });
    expect(principalWorkspaceContract.listObservationsByDate.metadata?.authority).toEqual({
      action: 'read',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.createObservation.metadata?.authority).toEqual({
      action: 'create',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.recordInviteEvent.metadata?.authority).toEqual({
      action: 'update',
      subject: 'SchoolInvite',
    });
    expect(principalWorkspaceContract.recordObservationFollowUp.metadata?.authority).toEqual({
      action: 'update',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.getGovernanceTimeline.metadata?.authority).toEqual({
      action: 'read',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.getGovernanceSnapshotAsOf.metadata?.authority).toEqual({
      action: 'read',
      subject: 'PrincipalObservation',
    });
  });
});
