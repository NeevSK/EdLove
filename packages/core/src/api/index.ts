import { academicCyclesAPI } from './academicCycles';
import { authAPI } from './auth';
import { announcementAPI } from './announcements';
import { circleAPI } from './circles';
import { communityContract } from './community.contract';
import { contextualChallengesAPI } from './contextualChallenges';
import { dailyContentAPI } from './dailyContent';
import { demoAPI } from './demo';
import { deviceTrustAPI } from './deviceTrust';
import { echoAPI } from './echo';
import { attendanceAPI as rawAttendanceAPI } from './attendance';
import { assignmentsAPI as rawAssignmentsAPI } from './assignments';
import { classroomGroupsAPI as rawClassroomGroupsAPI } from './classroomGroups';
import { classroomStudentsAPI as rawClassroomStudentsAPI } from './classroomStudents';
import { classroomsAPI as rawClassroomsAPI } from './classrooms';
import { gradingAPI as rawGradingAPI } from './grading';
import { schoolAPI as rawSchoolAPI } from './school';
import { inventoryAPI as rawInventoryAPI } from './inventory';
import { accountingAPI as rawAccountingAPI } from './erp';
import { paymentsAPI as rawPaymentsAPI } from './erp';
import { rewardsAPI } from './rewards';
import { trackingAPI } from './tracking';
import { onboardingAPI } from './onboarding';
import { presenceAPI } from './presence';
import { growthAPI, missionsAPI, ripplesAPI, growthStateAPI, proAPI } from './orchestration/growth';
import { classroomNotesAPI as rawClassroomNotesAPI } from './classroomNotes';
import { principalNotesAPI } from './principalNotes';
import { communityAPI as rawCommunityAPI } from './community';
import { messagingAPI } from './messaging';
import { guardianAPI as rawGuardianAPI } from './guardian';
import { staffManagementAPI as rawStaffManagementAPI } from './staffManagement';
import { demoAPI as demoProviderAPI } from './demo';
import { warmMirrorAPI } from './warmMirror';
import { naturePathsAPI } from './naturePaths';
import { moonPhaseAPI } from './moonPhase';
import { schoolForestAPI } from './schoolForest';
import { founderAPI as rawFounderAPI } from './founder';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from './principalWorkspace';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from './teacherInsights';
import { longitudinalAPI as rawLongitudinalAPI } from './longitudinal';
import { studentObservationsAPI } from './studentObservations';
import { privacyAPI } from './privacy';
import { studentPotentialAPI } from './studentPotential';
import { mappingAPI } from './mapping';
import { historyAPI } from './history';
import { formTemplatesAPI } from './formTemplates';
import { profileAPI } from './profile';
import { socialAPI } from './social';
import { supabase } from './supabase';
import { educationalContract } from './educational.contract';
import { founderContract } from './founder.contract';
import { gradingContract } from './grading.contract';
import { groupsAPI } from './groups';
import { growthContract } from './growth.contract';
import { guardianContract } from './guardian.contract';
import { identityContract } from './identity.contract';
import { longitudinalContract } from './longitudinal.contract';
import { principalWorkspaceContract } from './principalWorkspace.contract';
import { proContract } from './pro.contract';
import { profileContract } from './profile.contract';
import { resourcesAPI } from './resources';
import { tasksAPI } from './teacher';
import { teacherInsightsContract } from './teacherInsights.contract';
import { thuthimalAPI } from './thuthimal';

// --- Orchestrated APIs (Extracted Domains) ---
import { identityAPI } from './orchestration/identity';
import {
  staffManagementAPI,
  attendanceAPI,
  schoolAPI,
  inventoryAPI,
} from './orchestration/operations';
import {
  classroomsAPI,
  lessonsAPI,
  studentsAPI,
  assignmentsAPI,
  classroomGroupsAPI,
  classroomStudentsAPI,
  lessonMaterialsAPI,
} from './orchestration/educational';
import { accountingAPI, paymentsAPI } from './orchestration/erp';
import { communityAPI } from './orchestration/community';
import {
  gradingAPI,
  founderAPI,
  guardianAPI,
  principalWorkspaceAPI,
  teacherInsightsAPI,
  longitudinalAPI,
  notesWithPOA,
} from './orchestration/specialized';

// --- Re-exports (Types & Contracts) ---
export * from './announcements';
export * from './assignments';
export * from './circles';
export * from './classroomGroups';
export type { ClassroomNote } from './classroomNotes';
export * from './classroomNotes.contract';
export type * from './community';
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
export * from './hooks';
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
export * from './sacredMissions';
export * from './schoolForest';
export * from './self.contract';
export * from './staffManagement';
export * from './studentObservations';
export * from './studentPotential';
export * from './teacherInsights';
export * from './teacherInsights.contract';
export * from './temporalPOAProxy';
export * from './temporalProxy';
export * from './thuthimal';
export * from './userGrowthState';
export * from './warmMirror';

export {
  academicCyclesAPI,
  authAPI,
  attendanceAPI,
  classroomStudentsAPI,
  classroomsAPI,
  dailyContentAPI,
  demoAPI,
  echoAPI,
  formTemplatesAPI,
  identityAPI,
  inventoryAPI,
  lessonMaterialsAPI,
  lessonsAPI,
  messagingAPI,
  notesWithPOA as classroomNotesAPI,
  gradingAPI,
  onboardingAPI,
  presenceAPI,
  profileAPI,
  resourcesAPI,
  rewardsAPI,
  missionsAPI,
  schoolAPI,
  socialAPI,
  communityAPI,
  studentsAPI,
  supabase,
  tasksAPI,
};

/**
 * Unified API Object (Sovereign Orchestration)
 */
export const api: Record<string, any> = {
  announcements: announcementAPI,
  auth: authAPI,
  circles: circleAPI,
  identity: identityAPI,
  supabase,
  tasks: tasksAPI,
  notes: notesWithPOA,
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
  presence: presenceAPI,
  sacredMissions: missionsAPI,
  dailyContent: dailyContentAPI,
  thuthimal: proAPI,
  pro: proAPI,
  classroomNotes: notesWithPOA,
  principalNotes: principalNotesAPI,
  community: communityAPI,
  messaging: messagingAPI,
  community_group: communityAPI,
  guardian: guardianAPI,
  staffManagement: staffManagementAPI,
  missions: missionsAPI,
  demo: demoAPI,
  growth: growthAPI,
  growthState: growthStateAPI,
  ripples: ripplesAPI,
  warmMirror: warmMirrorAPI,
  naturePaths: naturePathsAPI,
  moonPhase: moonPhaseAPI,
  schoolForest: schoolForestAPI,
  challenges: contextualChallengesAPI,
  deviceTrust: deviceTrustAPI,
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
