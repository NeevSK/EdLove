import { authAPI } from '../native/auth';
import { identityAPI as rawIdentityAPI } from '../native/identity';
import { academicCyclesAPI } from './academicCycles';
import { assignmentsAPI as rawAssignmentsAPI } from './assignments';
import { attendanceAPI as rawAttendanceAPI } from './attendance';
import { lessonsAPI as rawLessonsAPI, studentsAPI as rawStudentsAPI } from './classroom';
import { classroomGroupsAPI as rawClassroomGroupsAPI } from './classroomGroups';
import { classroomNotesAPI as rawClassroomNotesAPI } from './classroomNotes';
import { classroomNotesContract } from './classroomNotes.contract';
import { classroomStudentsAPI as rawClassroomStudentsAPI } from './classroomStudents';
import { classroomsAPI as rawClassroomsAPI } from './classrooms';
import { communityAPI as rawCommunityAPI } from './community';
import { communityContract } from './community.contract';
import { contextualChallengesAPI } from './contextualChallenges';
import { assertContractCoverage, defineContractCoverage } from './contractCoverage';
import { dailyContentAPI } from './dailyContent';
import { demoAPI } from './demo';
import { echoAPI } from './echo';
import { educationalContract } from './educational.contract';
import { accountingAPI as rawAccountingAPI, paymentsAPI as rawPaymentsAPI } from './erp';
import { formTemplatesAPI } from './formTemplates';
import { founderAPI as rawFounderAPI } from './founder';
import { founderContract } from './founder.contract';
import { gradingAPI as rawGradingAPI } from './grading';
import { gradingContract } from './grading.contract';
import { groupsAPI } from './groups';
import { growthContract } from './growth.contract';
import { growthSignalsAPI } from './growthSignals';
import { guardianAPI as rawGuardianAPI } from './guardian';
import { guardianContract } from './guardian.contract';
import { historyAPI } from './history';
// Contracts for POA Enforcement
import { identityContract } from './identity.contract';
import { impactRipplesAPI } from './impactRipples';
import { inventoryAPI as rawInventoryAPI } from './inventory';
import { lessonMaterialsAPI as rawLessonMaterialsAPI } from './lessonMaterials';
import { longitudinalAPI as rawLongitudinalAPI } from './longitudinal';
import { longitudinalContract } from './longitudinal.contract';
import { mappingAPI } from './mapping';
import { moonPhaseAPI } from './moonPhase';
import { naturePathsAPI } from './naturePaths';
import { onboardingAPI } from './onboarding';
import { operationsContract } from './operations.contract';
import { createPOAProxy } from './poaProxy';
import { principalNotesAPI } from './principalNotes';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from './principalWorkspace';
import { principalWorkspaceContract } from './principalWorkspace.contract';
import { privacyAPI } from './privacy';
import { proContract } from './pro.contract';
import { profileAPI as rawProfileAPI } from './profile';
import { profileContract } from './profile.contract';
import { resourcesAPI } from './resources';
import { rewardsAPI } from './rewards';
// Scattered imports moved to top
import { sacredMissionsAPI } from './sacredMissions';
import { schoolAPI as rawSchoolAPI } from './school';
import { schoolForestAPI } from './schoolForest';
import { socialAPI } from './social';
import { staffManagementAPI as _staffManagementAPI } from './staffManagement';
import { studentObservationsAPI } from './studentObservations';
import { studentPotentialAPI } from './studentPotential';
import { notesAPI, tasksAPI } from './teacher';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from './teacherInsights';
import { teacherInsightsContract } from './teacherInsights.contract';
import { createTemporalPOAProxy } from './temporalPOAProxy';
import { thuthimalAPI } from './thuthimal';
import { trackingAPI } from './tracking';
import { userGrowthStateAPI } from './userGrowthState';
import { warmMirrorAPI } from './warmMirror';

const staffManagementAPI = createTemporalPOAProxy(
  'staffManagement',
  _staffManagementAPI,
  operationsContract,
);
const identityCoverage = assertContractCoverage(
  rawIdentityAPI,
  defineContractCoverage({
    moduleName: 'identity',
    contract: identityContract,
    methodMapping: {
      resolveInternalId: 'resolveIdentity',
      getMyInternalId: 'resolveIdentity',
      updateProfile: 'updateProfile',
    },
    internalMethods: ['linkIdentity', 'clearCache'], // Explicitly internal
  }),
);
const identityAPI = createPOAProxy(
  'identity',
  rawIdentityAPI,
  identityCoverage.contract,
  identityCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const attendanceCoverage = assertContractCoverage(
  rawAttendanceAPI,
  defineContractCoverage({
    moduleName: 'attendance',
    contract: operationsContract,
    methodMapping: {
      getByDate: 'getAttendance',
      record: 'recordAttendance',
      batchRecord: 'batchRecordAttendance',
      getForStudent: 'getAttendanceForStudent',
      getClassroomAttendanceSnapshot: 'getClassroomAttendanceSnapshot',
      getStudentAttendanceTimeline: 'getStudentAttendanceTimeline',
      getSchoolAttendancePulse: 'getSchoolAttendancePulse',
      getAttendanceReport: 'getAttendanceReport',
    },
    internalMethods: ['logAttendanceAudit'],
  }),
);
const attendanceAPI = createTemporalPOAProxy(
  'attendance',
  rawAttendanceAPI,
  attendanceCoverage.contract,
  attendanceCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);

// ERP Domain Hardening
import { erpContract } from './erp.contract';

const accountingAPI = createPOAProxy('accounting', rawAccountingAPI, erpContract, {
  getAccounts: 'getAccounts',
  recordTransaction: 'recordTransaction',
});
const paymentsAPI = createPOAProxy('payments', rawPaymentsAPI, erpContract, {
  createPaymentIntent: 'createPaymentIntent',
  getInvoices: 'getInvoices',
  getReceipt: 'getReceipt',
});

const classroomsCoverage = assertContractCoverage(
  rawClassroomsAPI,
  defineContractCoverage({
    moduleName: 'classrooms',
    contract: educationalContract,
  }),
);
const classroomsAPI = createTemporalPOAProxy(
  'classrooms',
  rawClassroomsAPI,
  classroomsCoverage.contract,
  classroomsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const lessonsCoverage = assertContractCoverage(
  rawLessonsAPI,
  defineContractCoverage({
    moduleName: 'lessons',
    contract: educationalContract,
    methodMapping: {
      create: 'createLesson',
      update: 'updateLesson',
      delete: 'deleteLesson',
    },
  }),
);
const lessonsAPI = createTemporalPOAProxy(
  'lessons',
  rawLessonsAPI,
  lessonsCoverage.contract,
  lessonsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const studentsCoverage = assertContractCoverage(
  rawStudentsAPI,
  defineContractCoverage({
    moduleName: 'students',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getClassroomStudents',
      enroll: 'enrollClassroomStudent',
      remove: 'removeClassroomStudent',
      create: 'add',
      update: 'updateById',
    },
  }),
);
const studentsAPI = createTemporalPOAProxy(
  'students',
  rawStudentsAPI,
  studentsCoverage.contract,
  studentsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const assignmentsCoverage = assertContractCoverage(
  rawAssignmentsAPI,
  defineContractCoverage({
    moduleName: 'assignments',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getAssignments',
      getByLesson: 'getByLessonAssignment',
      getUpcomingForStudent: 'getUpcomingAssignmentsForStudent',
      getSubmissionHistoryForStudent: 'getStudentSubmissionHistory',
      submitSubmission: 'submitAssignmentSubmission',
      update: 'updateAssignment',
      delete: 'deleteAssignment',
    },
  }),
);
const assignmentsAPI = createTemporalPOAProxy(
  'assignments',
  rawAssignmentsAPI,
  assignmentsCoverage.contract,
  assignmentsCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const classroomGroupsCoverage = assertContractCoverage(
  rawClassroomGroupsAPI,
  defineContractCoverage({
    moduleName: 'classroomGroups',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getClassroomGroups',
      create: 'createClassroomGroup',
      update: 'updateClassroomGroup',
      delete: 'deleteClassroomGroup',
    },
  }),
);
const classroomGroupsAPI = createTemporalPOAProxy(
  'classroomGroups',
  rawClassroomGroupsAPI,
  classroomGroupsCoverage.contract,
  classroomGroupsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
const classroomStudentsCoverage = assertContractCoverage(
  rawClassroomStudentsAPI,
  defineContractCoverage({
    moduleName: 'classroomStudents',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getEnrollmentRecords',
      update: 'updateEnrollmentRecord',
      remove: 'deleteEnrollmentRecord',
    },
  }),
);
const classroomStudentsAPI = createTemporalPOAProxy(
  'classroomStudents',
  rawClassroomStudentsAPI,
  classroomStudentsCoverage.contract,
  classroomStudentsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
const lessonMaterialsCoverage = assertContractCoverage(
  rawLessonMaterialsAPI,
  defineContractCoverage({
    moduleName: 'lessonMaterials',
    contract: educationalContract,
    methodMapping: {
      getAll: 'getAllMaterials',
      getByLesson: 'getByLessonMaterial',
      create: 'createMaterial',
      update: 'updateMaterial',
      delete: 'deleteMaterial',
    },
  }),
);
const lessonMaterialsAPI = createTemporalPOAProxy(
  'lessonMaterials',
  rawLessonMaterialsAPI,
  lessonMaterialsCoverage.contract,
  lessonMaterialsCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
const gradingCoverage = assertContractCoverage(
  rawGradingAPI,
  defineContractCoverage({
    moduleName: 'grading',
    contract: gradingContract,
    methodMapping: {
      saveGradeDraft: 'saveGradeDraft',
      getGradebookSnapshot: 'getGradebookSnapshot',
      getStudentGradeTimeline: 'getStudentGradeTimeline',
      getPublishedStudentGrades: 'getPublishedStudentGrades',
      getSchoolGradingCompletion: 'getSchoolGradingCompletion',
      getSchoolPublishedGradingCompletion: 'getSchoolPublishedGradingCompletion',
      publishGrade: 'publishGrade',
      revisePublishedGrade: 'revisePublishedGrade',
      overrideGrade: 'overrideGrade',
    },
    internalMethods: ['getGradeLifecycleRows'],
  }),
);
const gradingAPI = createTemporalPOAProxy(
  'grading',
  rawGradingAPI,
  gradingCoverage.contract,
  gradingCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const schoolCoverage = assertContractCoverage(
  rawSchoolAPI,
  defineContractCoverage({
    moduleName: 'school',
    contract: operationsContract,
    methodMapping: {
      create: 'createSchool',
      searchSchools: 'searchSchools',
      getSchool: 'getSchool',
      getSchoolStats: 'getSchoolStats',
      getSections: 'getSchoolSections',
      getGrades: 'getSectionGrades',
      getInviteCodes: 'getInviteCodes',
      generateInviteCode: 'generateInviteCode',
      update: 'updateSchool',
      createSection: 'createSchoolSection',
      createGrade: 'createSectionGrade',
    },
  }),
);
const schoolAPI = createTemporalPOAProxy(
  'school',
  rawSchoolAPI,
  schoolCoverage.contract,
  schoolCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const inventoryCoverage = assertContractCoverage(
  rawInventoryAPI,
  defineContractCoverage({
    moduleName: 'inventory',
    contract: operationsContract,
    methodMapping: {
      getAll: 'getInventory',
      update: 'updateInventory',
      createRequest: 'createInventoryRequest',
      getSchoolResourceNeeds: 'getSchoolResourceNeeds',
      getSchoolRequests: 'getSchoolRequests',
    },
  }),
);
const inventoryAPI = createTemporalPOAProxy(
  'inventory',
  rawInventoryAPI,
  inventoryCoverage.contract,
  inventoryCoverage.methodMapping,
  {
    strictUnmappedMethods: true,
  },
);
const communityCoverage = assertContractCoverage(
  rawCommunityAPI,
  defineContractCoverage({
    moduleName: 'community',
    contract: communityContract,
    methodMapping: {
      getGroupById: 'getGroup',
      get: 'getGroup',
      getGroupMessages: 'getMessages',
      sendGroupMessage: 'sendMessage',
      togglePostReaction: 'toggleReaction',
      createGroupWithOwner: 'createGroup',
    },
  }),
);
const communityAPI = createTemporalPOAProxy(
  'community',
  rawCommunityAPI,
  communityCoverage.contract,
  communityCoverage.methodMapping,
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
const founderAPI = createPOAProxy(
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
const guardianAPI = createPOAProxy(
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
const principalWorkspaceAPI = createPOAProxy(
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
const teacherInsightsAPI = createPOAProxy(
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
const longitudinalAPI = createTemporalPOAProxy(
  'longitudinal',
  rawLongitudinalAPI,
  longitudinalCoverage.contract,
  longitudinalCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
const classroomNotesCoverage = assertContractCoverage(
  rawClassroomNotesAPI,
  defineContractCoverage({
    moduleName: 'classroomNotes',
    contract: classroomNotesContract,
    methodMapping: {
      getAll: 'listVisibleNotes',
      getSnapshotAsOf: 'getVisibleNotesSnapshot',
      create: 'createClassroomNote',
      update: 'updateClassroomNote',
      delete: 'deleteClassroomNote',
      getTimeline: 'getClassroomNoteTimeline',
    },
  }),
);
const notesWithPOA = createTemporalPOAProxy(
  'classroomNotes',
  rawClassroomNotesAPI,
  classroomNotesCoverage.contract,
  classroomNotesCoverage.methodMapping,
  { strictUnmappedMethods: true },
);
const profileCoverage = assertContractCoverage(
  rawProfileAPI,
  defineContractCoverage({
    moduleName: 'profile',
    contract: profileContract,
    methodMapping: {
      getSchoolPulse: 'getSchoolPulse',
    },
  }),
);
const profileAPI = createPOAProxy(
  'profile',
  rawProfileAPI,
  profileCoverage.contract,
  profileCoverage.methodMapping,
  { strictUnmappedMethods: true },
);

// Growth & Pro Ecosystem Hardening
export const growthAPI = createPOAProxy('growth', growthSignalsAPI, growthContract);
export const proAPI = createPOAProxy('pro', thuthimalAPI, proContract);
export const missionsAPI = createPOAProxy('missions', sacredMissionsAPI, growthContract);
export const ripplesAPI = createPOAProxy('ripples', impactRipplesAPI, growthContract);
export const growthStateAPI = createPOAProxy('growthState', userGrowthStateAPI, growthContract);

export * from '../logic/schemas/staff.schema';
export * from '../logic/schemas/temporal.schema';
export * from '../types';
export * from './assignments'; // Export assignments/submissions API
export * from './classroomGroups';
export type { ClassroomNote } from './classroomNotes';
export * from './classroomNotes.contract';
export * from './community'; // Export community types/API
export * from './community.contract';
export * from './contextualChallenges';
export * from './contractCoverage';
export * from './educational.contract';
export * from './erp';
export * from './erp.contract';
export * from './founder.contract';
export * from './grading.contract';
export * from './growthSignals';
export * from './guardian';
export * from './guardian.contract';
export * from './history';
export * from './identity.contract';
export * from './impactRipples';
export * from './library.contract';
export * from './longitudinal';
export * from './longitudinal.contract';
export * from './mapping';
export * from './mockData';
export * from './moonPhase';
export * from './naturePaths';
export * from './operations.contract';
export * from './poaProxy';
export * from './principalNotes';
export * from './principalWorkspace';
export * from './principalWorkspace.contract';
export * from './privacy';
export * from './profile.contract';
export * from './sacredMissions'; // Export mission types
export * from './schoolForest';
export * from './self.contract';
export * from './staffManagement'; // Export staff management types
export * from './studentObservations';
export * from './studentPotential';
export * from './teacherInsights';
export * from './teacherInsights.contract';
export * from './temporalPOAProxy';
export * from './temporalProxy';
export * from './thuthimal'; // Restore types and thuthimalAPI
export * from './userGrowthState';
export * from './warmMirror';
// Simplified named exports for direct access
export {
  academicCyclesAPI,
  assignmentsAPI,
  attendanceAPI,
  authAPI,
  classroomGroupsAPI,
  classroomStudentsAPI,
  classroomsAPI,
  communityAPI,
  contextualChallengesAPI,
  dailyContentAPI,
  demoAPI,
  echoAPI,
  formTemplatesAPI,
  founderAPI,
  gradingAPI,
  groupsAPI,
  guardianAPI,
  historyAPI,
  identityAPI,
  inventoryAPI,
  lessonMaterialsAPI,
  lessonsAPI,
  longitudinalAPI,
  mappingAPI,
  moonPhaseAPI,
  naturePathsAPI,
  notesAPI,
  notesWithPOA as classroomNotesAPI,
  onboardingAPI,
  principalNotesAPI,
  principalWorkspaceAPI,
  privacyAPI,
  profileAPI,
  resourcesAPI,
  rewardsAPI,
  schoolAPI,
  schoolForestAPI,
  socialAPI,
  staffManagementAPI,
  studentObservationsAPI,
  studentPotentialAPI,
  studentsAPI,
  tasksAPI,
  teacherInsightsAPI,
  thuthimalAPI,
  trackingAPI,
  warmMirrorAPI,
};

/**
 * Unified API Object
 *
 * IMPORTANT: This is defined as a plain object to ensure
 * Hermes handles it as a non-writable module property.
 */
export const api = {
  auth: authAPI,
  identity: identityAPI,
  tasks: tasksAPI,
  notes: notesAPI,
  lessons: lessonsAPI,
  students: studentsAPI,
  attendance: attendanceAPI,
  resources: resourcesAPI,
  groups: groupsAPI,
  lessonMaterials: lessonMaterialsAPI,
  assignments: assignmentsAPI,
  classroomGroups: classroomGroupsAPI,
  classroomStudents: classroomStudentsAPI,
  classrooms: classroomsAPI,
  grading: gradingAPI,
  school: schoolAPI,
  inventory: inventoryAPI,
  accounting: accountingAPI,
  payments: paymentsAPI,
  erp: {
    inventory: inventoryAPI,
    accounting: accountingAPI,
    payments: paymentsAPI,
  },
  rewards: rewardsAPI,
  tracking: trackingAPI,
  onboarding: onboardingAPI,
  dailyContent: dailyContentAPI,
  thuthimal: proAPI,
  pro: proAPI,
  classroomNotes: notesWithPOA,
  principalNotes: principalNotesAPI,
  community: communityAPI,
  community_group: communityAPI,
  guardian: guardianAPI,
  staffManagement: staffManagementAPI,
  missions: missionsAPI,
  demo: demoAPI,
  // Growth Model v3.0  Full Nature-Inspired Growth Ecosystem
  growth: growthAPI,
  growthState: growthStateAPI,
  ripples: ripplesAPI,
  warmMirror: warmMirrorAPI,
  naturePaths: naturePathsAPI,
  moonPhase: moonPhaseAPI,
  schoolForest: schoolForestAPI,
  challenges: contextualChallengesAPI,
  founder: founderAPI,
  principalWorkspace: principalWorkspaceAPI,
  teacherInsights: teacherInsightsAPI,
  longitudinal: longitudinalAPI,
  academicCycles: academicCyclesAPI,
  studentObservations: studentObservationsAPI,
  privacy: privacyAPI,
  echo: echoAPI,
  studentPotential: studentPotentialAPI,
  mapping: mappingAPI,
  history: historyAPI,
  forms: formTemplatesAPI,
  socialAPI,
  profile: profileAPI,
};

export default api;
