jest.mock('../../domains/founder/runtime', () => ({
  founderServices: {
    getEcosystemStats: jest.fn(),
    getAllSchools: jest.fn(),
    createSchool: jest.fn(),
    createClassroom: jest.fn(),
    createGroup: jest.fn(),
    listAllUsers: jest.fn(),
    updateSchoolMetadata: jest.fn(),
    getEcosystemPulse: jest.fn(),
    getSentinelGovernance: jest.fn(),
  },
}));

jest.mock('../../domains/guardian/runtime', () => ({
  guardianServices: {
    createProfile: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getStudents: jest.fn(),
    getStudentGuardians: jest.fn(),
    getDashboard: jest.fn(),
    verifyGuardian: jest.fn(),
    linkGuardianToStudent: jest.fn(),
    updatePermissions: jest.fn(),
    terminateRelationship: jest.fn(),
    updateNotificationSettings: jest.fn(),
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
