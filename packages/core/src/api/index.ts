import { academicCyclesAPI } from './academicCycles';
import { announcementAPI } from './announcements';
import { authAPI } from './auth';
import { circleAPI } from './circles';
import { contextualChallengesAPI } from './contextualChallenges';
import { dailyContentAPI } from './dailyContent';
import { readLocalFirst, writeLocalFirst } from './dataGateway';
import { demoAPI } from './demo';
import { deviceTrustAPI } from './deviceTrust';
import { echoAPI } from './echo';
import { formTemplatesAPI } from './formTemplates';
import { createSovereignGateway, sovereignGateway } from './gateway';
import { groupsAPI } from './groups';
import { historyAPI } from './history';
import { libraryAPI } from './library';
import { mappingAPI } from './mapping';
import { mediaAPI } from './media';
import { messagingAPI } from './messaging';
import { moonPhaseAPI } from './moonPhase';
import { naturePathsAPI } from './naturePaths';
import { onboardingAPI } from './onboarding';
import { growthAPI, growthStateAPI, missionsAPI, proAPI, ripplesAPI } from './orchestration/growth';
import { presenceAPI } from './presence';
import { principalNotesAPI } from './principalNotes';
import { privacyAPI } from './privacy';
// profileAPI is imported from orchestration/identity below to use the proxied version
import { resourcesAPI } from './resources';
import { rewardsAPI } from './rewards';
import { schoolForestAPI } from './schoolForest';
import { socialAPI } from './social';
import { studentObservationsAPI } from './studentObservations';
import { studentPotentialAPI } from './studentPotential';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';
import { tasksAPI } from './teacher';
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
import { identityAPI, profileAPI } from './orchestration/identity';
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

export type { CalendarEvent } from '@repo/schema';
export type { ClassroomNote } from '../types/ClassroomNote';
export type {
  BanyanStage,
  BhumiStage,
  CrystalTier,
  ImpactRipple,
  RippleSourceEntityType,
  RippleType,
  RiverStage,
  UserGrowthState,
} from '../types/Growth';
export type { PrincipalNote } from '../types/PrincipalNote';
// --- Re-exports (Types & Contracts) ---
export * from './admin.contract';
export * from './announcements';
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
export * from './growth.contract';
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
export * from './pro.contract';
export * from './profile.contract';
export * from './sacredMissions';
export * from './schoolForest';
export * from './self.contract';
export * from './staffManagement';
export * from './studentObservations';
export * from './studentPotential';
export * from './sync.contract';
export * from './teacherInsights';
export * from './teacherInsights.contract';
export * from './temporalPOAProxy';
export * from './temporalProxy';
export * from './thuthimal';
export * from './userGrowthState';
export * from './warmMirror';
export * from './workspaceLayout.contract';

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
  createSovereignGateway,
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
  readLocalFirst,
  resourcesAPI,
  rewardsAPI,
  schoolAPI,
  socialAPI,
  sovereignGateway,
  studentsAPI,
  tasksAPI,
  writeLocalFirst,
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
