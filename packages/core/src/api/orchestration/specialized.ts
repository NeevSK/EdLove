import { assertContractCoverage, defineContractCoverage } from '@repo/core/api/contractCoverage';
import { founderAPI as rawFounderAPI } from '@repo/core/api/founder';
import { founderContract } from '@repo/core/api/founder.contract';
import { gradingAPI as rawGradingAPI } from '@repo/core/api/grading';
import { gradingContract } from '@repo/core/api/grading.contract';
import { guardianAPI as rawGuardianAPI } from '@repo/core/api/guardian';
import { guardianContract } from '@repo/core/api/guardian.contract';
import { longitudinalAPI as rawLongitudinalAPI } from '@repo/core/api/longitudinal';
import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from '@repo/core/api/principalWorkspace';
import { principalWorkspaceContract } from '@repo/core/api/principalWorkspace.contract';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from '@repo/core/api/teacherInsights';
import { teacherInsightsContract } from '@repo/core/api/teacherInsights.contract';
import { createTemporalProxy } from '@repo/core/api/temporalProxy';

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
      'getSchoolPublishedGradingCompletion',
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
