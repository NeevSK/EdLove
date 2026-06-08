import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { founderAPI as rawFounderAPI } from '../founder';
import { founderContract } from '../founder.contract';
import { gradingAPI as rawGradingAPI } from '../grading';
import { gradingContract } from '../grading.contract';
import { guardianAPI as rawGuardianAPI } from '../guardian';
import { guardianContract } from '../guardian.contract';
import { longitudinalAPI as rawLongitudinalAPI } from '../longitudinal';
import { longitudinalContract } from '../longitudinal.contract';
import { createPOAProxy } from '../poaProxy';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from '../principalWorkspace';
import { principalWorkspaceContract } from '../principalWorkspace.contract';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from '../teacherInsights';
import { teacherInsightsContract } from '../teacherInsights.contract';
import { createTemporalPOAProxy } from '../temporalPOAProxy';

const gradingCoverage = assertContractCoverage(
  rawGradingAPI,
  defineContractCoverage({
    moduleName: 'grading',
    contract: gradingContract,
    methodMapping: {
      fetchStudentReport: 'getReportCard',
      recordAcademicMark: 'submitGrade',
      finalizeAcademicRecord: 'publishGrade',
    },
  }),
);

export const gradingAPI = createTemporalPOAProxy(
  'grading',
  rawGradingAPI,
  gradingCoverage.contract,
  gradingCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const founderCoverage = assertContractCoverage(
  rawFounderAPI,
  defineContractCoverage({
    moduleName: 'founder',
    contract: founderContract,
  }),
);

export const founderAPI = createPOAProxy(
  'founder',
  rawFounderAPI,
  founderCoverage.contract,
  founderCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const guardianCoverage = assertContractCoverage(
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

export const guardianAPI = createPOAProxy(
  'guardian',
  rawGuardianAPI,
  guardianCoverage.contract,
  guardianCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

const principalWorkspaceCoverage = assertContractCoverage(
  rawPrincipalWorkspaceAPI,
  defineContractCoverage({
    moduleName: 'principalWorkspace',
    contract: principalWorkspaceContract,
  }),
);

export const principalWorkspaceAPI = createPOAProxy(
  'principalWorkspace',
  rawPrincipalWorkspaceAPI,
  principalWorkspaceCoverage.contract,
  principalWorkspaceCoverage.methodMapping,
  { strictUnmappedMethods: true },
);

const teacherInsightsCoverage = assertContractCoverage(
  rawTeacherInsightsAPI,
  defineContractCoverage({
    moduleName: 'teacherInsights',
    contract: teacherInsightsContract,
  }),
);

export const teacherInsightsAPI = createPOAProxy(
  'teacherInsights',
  rawTeacherInsightsAPI,
  teacherInsightsCoverage.contract,
  teacherInsightsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);

const longitudinalCoverage = assertContractCoverage(
  rawLongitudinalAPI,
  defineContractCoverage({
    moduleName: 'longitudinal',
    contract: longitudinalContract,
  }),
);

export const longitudinalAPI = createTemporalPOAProxy(
  'longitudinal',
  rawLongitudinalAPI,
  longitudinalCoverage.contract,
  longitudinalCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
