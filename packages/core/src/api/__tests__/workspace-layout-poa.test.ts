jest.mock('../native/runtimes/workspaceLayout.runtime', () => ({
  workspaceLayoutServices: {
    getLayout: jest.fn(),
    upsertLayout: jest.fn(),
    deleteLayout: jest.fn(),
  },
}));

import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { workspaceLayoutAPI as rawWorkspaceLayoutAPI } from '../workspaceLayout';
import { workspaceLayoutContract } from '../workspaceLayout.contract';

describe('workspace layout POA coverage', () => {
  test('workspace layout public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawWorkspaceLayoutAPI,
      defineContractCoverage({
        moduleName: 'workspaceLayout-test',
        contract: workspaceLayoutContract,
      }),
    );

    expect(coverage.contract).toBe(workspaceLayoutContract);
  });

  test('workspace layout routes carry authority metadata', () => {
    expect(workspaceLayoutContract.getWorkspaceLayout.metadata?.authority).toEqual({
      action: 'read',
      subject: 'WorkspaceLayout',
    });
    expect(workspaceLayoutContract.upsertWorkspaceLayout.metadata?.authority).toEqual({
      action: 'update',
      subject: 'WorkspaceLayout',
    });
    expect(workspaceLayoutContract.deleteWorkspaceLayout.metadata?.authority).toEqual({
      action: 'delete',
      subject: 'WorkspaceLayout',
    });
  });
});
