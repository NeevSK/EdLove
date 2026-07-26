import { assertContractCoverage, defineContractCoverage } from '@/api/contractCoverage';
import { founderAPI as rawFounderAPI } from '@/api/founder';
import { founderContract } from '@/api/founder.contract';
import { gradingAPI as rawGradingAPI } from '@/api/grading';
import { gradingContract } from '@/api/grading.contract';
import { guardianAPI as rawGuardianAPI } from '@/api/guardian';
import { guardianContract } from '@/api/guardian.contract';
import { longitudinalAPI as rawLongitudinalAPI } from '@/api/longitudinal';
import { longitudinalContract } from '@/api/longitudinal.contract';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from '@/api/principalWorkspace';
import { principalWorkspaceContract } from '@/api/principalWorkspace.contract';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from '@/api/teacherInsights';
import { teacherInsightsContract } from '@/api/teacherInsights.contract';
import { createTemporalProxy } from '@/api/temporalProxy';

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
