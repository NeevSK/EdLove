import { academicCyclesAPI } from './academicCycles';
import { announcementAPI } from './announcements';
import { assignmentsAPI as rawAssignmentsAPI } from './assignments';
import { attendanceAPI as rawAttendanceAPI } from './attendance';
import { authAPI } from './auth';
import { circleAPI } from './circles';
import { classroomGroupsAPI as rawClassroomGroupsAPI } from './classroomGroups';
import { classroomNotesAPI as rawClassroomNotesAPI } from './classroomNotes';
import { classroomStudentsAPI as rawClassroomStudentsAPI } from './classroomStudents';
import { classroomsAPI as rawClassroomsAPI } from './classrooms';
import { communityAPI as rawCommunityAPI } from './community';
import { communityContract } from './community.contract';
import { contextualChallengesAPI } from './contextualChallenges';
import { dailyContentAPI } from './dailyContent';
import { demoAPI, demoAPI as demoProviderAPI } from './demo';
import { deviceTrustAPI } from './deviceTrust';
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
import { guardianAPI as rawGuardianAPI } from './guardian';
import { guardianContract } from './guardian.contract';
import { historyAPI } from './history';
import { identityContract } from './identity.contract';
import { inventoryAPI as rawInventoryAPI } from './inventory';
import { libraryAPI } from './library';
import { longitudinalAPI as rawLongitudinalAPI } from './longitudinal';
import { longitudinalContract } from './longitudinal.contract';
import { mappingAPI } from './mapping';
import { mediaAPI } from './media';
import { messagingAPI } from './messaging';
import { moonPhaseAPI } from './moonPhase';
import { naturePathsAPI } from './naturePaths';
import { onboardingAPI } from './onboarding';
import { growthAPI, growthStateAPI, missionsAPI, proAPI, ripplesAPI } from './orchestration/growth';
import { presenceAPI } from './presence';
import { principalNotesAPI } from './principalNotes';
import { principalWorkspaceAPI as rawPrincipalWorkspaceAPI } from './principalWorkspace';
import { principalWorkspaceContract } from './principalWorkspace.contract';
import { privacyAPI } from './privacy';
import { proContract } from './pro.contract';
import { profileAPI } from './profile';
import { profileContract } from './profile.contract';
import { resourcesAPI } from './resources';
import { rewardsAPI } from './rewards';
import { schoolAPI as rawSchoolAPI } from './school';
import { schoolForestAPI } from './schoolForest';
import { socialAPI } from './social';
import { staffManagementAPI as rawStaffManagementAPI } from './staffManagement';
import { studentObservationsAPI } from './studentObservations';
import { studentPotentialAPI } from './studentPotential';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';
import { tasksAPI } from './teacher';
import { teacherInsightsAPI as rawTeacherInsightsAPI } from './teacherInsights';
import { teacherInsightsContract } from './teacherInsights.contract';
import { thuthimalAPI } from './thuthimal';
import { trackingAPI } from './tracking';
import { warmMirrorAPI } from './warmMirror';

export * from './base';
export { adminHandlers } from './handlers/admin';
export { communityHandlers } from './handlers/community';
export { educationalHandlers } from './handlers/educational';
export { gradingHandlers } from './handlers/grading';
export { identityHandlers } from './handlers/identity';
export { libraryHandlers } from './handlers/library';
export { operationsHandlers } from './handlers/operations';
export { profileHandlers } from './handlers/profile';
export { selfHandlers } from './handlers/self';
export { syncHandlers } from './handlers/sync';

import { communityAPI } from './orchestration/community';
import {
  assignmentsAPI,
  classroomGroupsAPI,
  classroomNotesAPI,
  classroomStudentsAPI,
  classroomsAPI,
  lessonMaterialsAPI,
  lessonsAPI,
  studentsAPI,
} from './orchestration/educational';
import { accountingAPI, paymentsAPI } from './orchestration/erp';
// --- Orchestrated APIs (Extracted Domains) ---
import { identityAPI } from './orchestration/identity';
import {
  attendanceAPI,
  inventoryAPI,
  schoolAPI,
  staffManagementAPI,
} from './orchestration/operations';
import {
  founderAPI,
  gradingAPI,
  guardianAPI,
  longitudinalAPI,
  principalWorkspaceAPI,
  teacherInsightsAPI,
} from './orchestration/specialized';

// --- Re-exports (Types & Contracts) ---
export * from './admin.contract';
export * from './pro.contract';
export * from './growth.contract';
export * from './workspaceLayout.contract';
export * from './announcements';
export * from './assignments';
export * from './circles';
export * from './classroomGroups';
export * from './classroomNotes.contract';
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
export * from './sync.contract';
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
export type { BhumiStage, BanyanStage, RiverStage, CrystalTier, UserGrowthState, ImpactRipple, RippleType, RippleSourceEntityType } from '../types/Growth';
export type { CalendarEvent } from '@repo/schema';
export type { ClassroomNote } from '../types/ClassroomNote';


export {
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase,
  academicCyclesAPI,
  assignmentsAPI,
  attendanceAPI,
  authAPI,
  classroomNotesAPI,
  classroomStudentsAPI,
  classroomsAPI,
  communityAPI,
  dailyContentAPI,
  demoAPI,
  echoAPI,
  formTemplatesAPI,
  gradingAPI,
  identityAPI,
  inventoryAPI,
  lessonMaterialsAPI,
  lessonsAPI,
  libraryAPI,
  mediaAPI,
  messagingAPI,
  missionsAPI,
  onboardingAPI,
  presenceAPI,
  profileAPI,
  resourcesAPI,
  rewardsAPI,
  schoolAPI,
  socialAPI,
  studentsAPI,
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
  supabase: __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
  tasks: tasksAPI,
  notes: classroomNotesAPI,
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
  classroomNotes: classroomNotesAPI,
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
  media: mediaAPI,
  library: libraryAPI,
};

export default api;
