vi.mock('../runtimes/founder.runtime', () => ({
  founderServices: {
    getEcosystemStats: vi.fn(),
    getAllSchools: vi.fn(),
    createSchool: vi.fn(),
    createClassroom: vi.fn(),
    createGroup: vi.fn(),
    listAllUsers: vi.fn(),
    updateSchoolMetadata: vi.fn(),
    getEcosystemPulse: vi.fn(),
    getSentinelGovernance: vi.fn(),
  },
}));

vi.mock('../runtimes/guardian.runtime', () => ({
  guardianServices: {
    createProfile: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getStudents: vi.fn(),
    getStudentGuardians: vi.fn(),
    getDashboard: vi.fn(),
    verifyGuardian: vi.fn(),
    linkGuardianToStudent: vi.fn(),
    updatePermissions: vi.fn(),
    terminateRelationship: vi.fn(),
    updateNotificationSettings: vi.fn(),
  },
}));

import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { founderAPI as rawFounderAPI } from '../founder';
import { founderContract } from '../founder.contract';
import { guardianAPI as rawGuardianAPI } from '../guardian';
import { guardianContract } from '../guardian.contract';

describe('founder and guardian POA coverage', () => {
  test('founder public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawFounderAPI,
      defineContractCoverage({
        moduleName: 'founder-test',
        contract: founderContract,
      }),
    );

    expect(coverage.contract).toBe(founderContract);
  });

  test('guardian public API methods are fully contract-covered with alias mapping', () => {
    const coverage = assertContractCoverage(
      rawGuardianAPI,
      defineContractCoverage({
        moduleName: 'guardian-test',
        contract: guardianContract,
        methodMapping: {
          createProfile: 'createGuardianProfile',
          getProfile: 'getGuardianProfile',
          updateProfile: 'updateGuardianProfile',
          getStudents: 'getGuardianStudents',
          getDashboard: 'getGuardianDashboard',
          updatePermissions: 'updateGuardianPermissions',
          terminateRelationship: 'terminateGuardianRelationship',
          updateNotificationSettings: 'updateGuardianNotificationSettings',
        },
      }),
    );

    expect(coverage.contract).toBe(guardianContract);
  });

  test('guardian coverage fails fast when alias mapping is missing', () => {
    expect(() =>
      assertContractCoverage(
        rawGuardianAPI,
        defineContractCoverage({
          moduleName: 'guardian-test-missing-aliases',
          contract: guardianContract,
        }),
      ),
    ).toThrow(
      /createProfile, getProfile, updateProfile, getStudents, getDashboard, updatePermissions, terminateRelationship, updateNotificationSettings/,
    );
  });

  test('founder routes carry authority metadata', () => {
    expect(founderContract.getEcosystemStats.metadata?.authority).toEqual({
      action: 'read',
      subject: 'FounderDashboard',
    });
    expect(founderContract.createSchool.metadata?.authority).toEqual({
      action: 'create',
      subject: 'School',
    });
  });

  test('guardian routes carry authority metadata', () => {
    expect(guardianContract.getGuardianDashboard.metadata?.authority).toEqual({
      action: 'read',
      subject: 'GuardianDashboard',
    });
    expect(guardianContract.updateGuardianProfile.metadata?.authority).toEqual({
      action: 'update',
      subject: 'GuardianProfile',
    });
    expect(guardianContract.createGuardianProfile.metadata?.authority).toEqual({
      action: 'create',
      subject: 'GuardianProfile',
    });
    expect(guardianContract.updateGuardianNotificationSettings.metadata?.authority).toEqual({
      action: 'update',
      subject: 'GuardianNotificationSettings',
    });
  });
});
