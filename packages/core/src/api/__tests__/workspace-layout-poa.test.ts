vi.mock('../runtimes/workspaceLayout.runtime', () => ({
  workspaceLayoutServices: {
    getLayout: vi.fn(),
    upsertLayout: vi.fn(),
    deleteLayout: vi.fn(),
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

  test('workspace layout routes carry policy metadata', () => {
    expect(workspaceLayoutContract.getWorkspaceLayout.metadata?.policy).toEqual({
      action: 'read',
      subject: 'WorkspaceLayout',
    });
    expect(workspaceLayoutContract.upsertWorkspaceLayout.metadata?.policy).toEqual({
      action: 'update',
      subject: 'WorkspaceLayout',
    });
    expect(workspaceLayoutContract.deleteWorkspaceLayout.metadata?.policy).toEqual({
      action: 'delete',
      subject: 'WorkspaceLayout',
    });
  });
});

