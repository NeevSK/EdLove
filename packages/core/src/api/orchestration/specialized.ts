import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { founderAPI as rawFounderAPI } from '../founder';
import { founderContract } from '../founder.contract';
import { gradingAPI as rawGradingAPI } from '../grading';
import { gradingContract } from '../grading.contract';
import { guardianAPI as rawGuardianAPI } from '../guardian';
import { guardianContract } from '../guardian.contract';
import { longitudinalAPI as rawLongitudinalAPI } from '../longitudinal';
import { longitudinalContract } from '../longitudinal.contract';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from '../principalWorkspace';
import { principalWorkspaceContract } from '../principalWorkspace.contract';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from '../teacherInsights';
import { teacherInsightsContract } from '../teacherInsights.contract';
import { createTemporalProxy } from '../temporalProxy';

const _gradingCoverage = assertContractCoverage(
  rawGradingAPI,
  defineContractCoverage({
    moduleName: 'grading',
    contract: gradingContract,
    methodMapping: {
      fetchStudentReport: 'getReportCard',
      recordAcademicMark: 'submitGrade',
      finalizeAcademicRecord: 'publishGrade',
    },
    internalMethods: [
      'getGradebookSnapshot',
      'updateGradingSettings',
      'saveGradeDraft',
      'publishGrade',
    ],
  }),
);

export const gradingAPI = createTemporalProxy('grading', rawGradingAPI);

const _founderCoverage = assertContractCoverage(
  rawFounderAPI,
  defineContractCoverage({
    moduleName: 'founder',
    contract: founderContract,
  }),
);

export const founderAPI = rawFounderAPI;

const _guardianCoverage = assertContractCoverage(
  rawGuardianAPI,
  defineContractCoverage({
    moduleName: 'guardian',
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

export const guardianAPI = rawGuardianAPI;

const _principalWorkspaceCoverage = assertContractCoverage(
  rawPrincipalWorkspaceAPI,
  defineContractCoverage({
    moduleName: 'principalWorkspace',
    contract: principalWorkspaceContract,
  }),
);

export const principalWorkspaceAPI = rawPrincipalWorkspaceAPI;

const _teacherInsightsCoverage = assertContractCoverage(
  rawTeacherInsightsAPI,
  defineContractCoverage({
    moduleName: 'teacherInsights',
    contract: teacherInsightsContract,
  }),
);

export const teacherInsightsAPI = rawTeacherInsightsAPI;

const _longitudinalCoverage = assertContractCoverage(
  rawLongitudinalAPI,
  defineContractCoverage({
    moduleName: 'longitudinal',
    contract: longitudinalContract,
  }),
);

export const longitudinalAPI = createTemporalProxy('longitudinal', rawLongitudinalAPI);
