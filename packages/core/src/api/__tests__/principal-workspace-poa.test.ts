vi.mock('../runtimes/principalWorkspace.runtime', () => ({
  principalWorkspaceServices: {
    listInviteCodes: vi.fn(),
    generateInviteCode: vi.fn(),
    listObservationsByDate: vi.fn(),
    listRecentObservations: vi.fn(),
    createObservation: vi.fn(),
    recordInviteEvent: vi.fn(),
    recordObservationFollowUp: vi.fn(),
    getGovernanceTimeline: vi.fn(),
    getGovernanceSnapshotAsOf: vi.fn(),
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

  test('principal workspace routes carry policy metadata', () => {
    expect(principalWorkspaceContract.listInviteCodes.metadata?.policy).toEqual({
      action: 'read',
      subject: 'SchoolInvite',
    });
    expect(principalWorkspaceContract.generateInviteCode.metadata?.policy).toEqual({
      action: 'create',
      subject: 'SchoolInvite',
    });
    expect(principalWorkspaceContract.listObservationsByDate.metadata?.policy).toEqual({
      action: 'read',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.createObservation.metadata?.policy).toEqual({
      action: 'create',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.recordInviteEvent.metadata?.policy).toEqual({
      action: 'update',
      subject: 'SchoolInvite',
    });
    expect(principalWorkspaceContract.recordObservationFollowUp.metadata?.policy).toEqual({
      action: 'update',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.getGovernanceTimeline.metadata?.policy).toEqual({
      action: 'read',
      subject: 'PrincipalObservation',
    });
    expect(principalWorkspaceContract.getGovernanceSnapshotAsOf.metadata?.policy).toEqual({
      action: 'read',
      subject: 'PrincipalObservation',
    });
  });
});

