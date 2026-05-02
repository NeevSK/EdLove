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
import { educationalContract } from './educational.contract';
import { formTemplatesAPI } from './formTemplates';
import { founderContract } from './founder.contract';
import { gradingContract } from './grading.contract';
import { groupsAPI } from './groups';
import { growthContract } from './growth.contract';
import { guardianContract } from './guardian.contract';
import { historyAPI } from './history';
import { identityContract } from './identity.contract';
import { longitudinalContract } from './longitudinal.contract';
import { mappingAPI } from './mapping';
import { messagingAPI } from './messaging';
import { moonPhaseAPI } from './moonPhase';
import { naturePathsAPI } from './naturePaths';
import { onboardingAPI } from './onboarding';
import { presenceAPI } from './presence';
import { principalNotesAPI } from './principalNotes';
import { principalWorkspaceContract } from './principalWorkspace.contract';
import { privacyAPI } from './privacy';
import { proContract } from './pro.contract';
import { profileContract } from './profile.contract';
import { resourcesAPI } from './resources';
import { rewardsAPI } from './rewards';
import { schoolForestAPI } from './schoolForest';
import { studentObservationsAPI } from './studentObservations';
import { studentPotentialAPI } from './studentPotential';
import { supabase } from './supabase';
import { notesAPI, tasksAPI } from './teacher';
import { teacherInsightsContract } from './teacherInsights.contract';
import { thuthimalAPI } from './thuthimal';
import { trackingAPI } from './tracking';
import { warmMirrorAPI } from './warmMirror';

// --- Orchestrated APIs (Extracted Domains) ---
import { identityAPI, profileAPI } from './orchestration/identity';
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
import {
  growthAPI,
  proAPI,
  missionsAPI,
  ripplesAPI,
  growthStateAPI,
} from './orchestration/growth';
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
import { socialAPI } from './social';

// --- Re-exports (Types & Contracts) ---
export * from './announcements';
export * from './assignments';
export * from './circles';
export * from './classroomGroups';
export type { ClassroomNote } from './classroomNotes';
export * from './classroomNotes.contract';
export * from './community';
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

// Simplified named exports for direct access
export {
  academicCyclesAPI,
  announcementAPI,
  assignmentsAPI,
  attendanceAPI,
  authAPI,
  circleAPI,
  classroomGroupsAPI,
  classroomStudentsAPI,
  classroomsAPI,
  communityAPI,
  contextualChallengesAPI,
  dailyContentAPI,
  demoAPI,
  deviceTrustAPI,
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
  messagingAPI,
  moonPhaseAPI,
  naturePathsAPI,
  notesAPI,
  notesWithPOA as classroomNotesAPI,
  onboardingAPI,
  presenceAPI,
  principalNotesAPI,
  principalWorkspaceAPI,
  privacyAPI,
  profileAPI,
  resourcesAPI,
  rewardsAPI,
  missionsAPI,
  schoolAPI,
  schoolForestAPI,
  socialAPI,
  staffManagementAPI,
  studentObservationsAPI,
  studentPotentialAPI,
  studentsAPI,
  supabase,
  tasksAPI,
  teacherInsightsAPI,
  thuthimalAPI,
  trackingAPI,
  warmMirrorAPI,
};

/**
 * Unified API Object (Sovereign Orchestration)
 */
export const api = {
  announcements: announcementAPI,
  auth: authAPI,
  circles: circleAPI,
  identity: identityAPI,
  supabase,
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
