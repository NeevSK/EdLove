import { academicCyclesAPI } from '@/api/academicCycles';
import { announcementAPI } from '@/api/announcements';
import { authAPI } from '@/api/auth';
import { circleAPI } from '@/api/circles';
import { contextualChallengesAPI } from '@/api/contextualChallenges';
import { dailyContentAPI } from '@/api/dailyContent';
import { readLocalFirst, writeLocalFirst } from '@/api/dataGateway';
import { demoAPI } from '@/api/demo';
import { deviceTrustAPI } from '@/api/deviceTrust';
import { echoAPI } from '@/api/echo';
import { formTemplatesAPI } from '@/api/formTemplates';
import { createSovereignGateway, sovereignGateway } from '@/api/gateway';
import { groupsAPI } from '@/api/groups';
import { historyAPI } from '@/api/history';
import { libraryAPI } from '@/api/library';
import { mappingAPI } from '@/api/mapping';
import { mediaAPI } from '@/api/media';
import { messagingAPI } from '@/api/messaging';
import { moonPhaseAPI } from '@/api/moonPhase';
import { naturePathsAPI } from '@/api/naturePaths';
import { onboardingAPI } from '@/api/onboarding';
import { growthAPI, growthStateAPI, missionsAPI, proAPI, ripplesAPI } from '@/api/orchestration/growth';
import { presenceAPI } from '@/api/presence';
import { principalNotesAPI } from '@/api/principalNotes';
import { privacyAPI } from '@/api/privacy';
// profileAPI is imported from orchestration/identity below to use the proxied version
import { resourcesAPI } from '@/api/resources';
import { rewardsAPI } from '@/api/rewards';
import { schoolForestAPI } from '@/api/schoolForest';
import { socialAPI } from '@/api/social';
import { studentObservationsAPI } from '@/api/studentObservations';
import { studentPotentialAPI } from '@/api/studentPotential';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import { tasksAPI } from '@/api/teacher';
import { trackingAPI } from '@/api/tracking';
import { warmMirrorAPI } from '@/api/warmMirror';

export * from '@/api/base';
export { adminHandlers } from '@/api/handlers/admin';
export { communityHandlers } from '@/api/handlers/community';
export { educationalHandlers } from '@/api/handlers/educational';
export { gradingHandlers } from '@/api/handlers/grading';
export { identityHandlers } from '@/api/handlers/identity';
export { libraryHandlers } from '@/api/handlers/library';
export { operationsHandlers } from '@/api/handlers/operations';
export { profileHandlers } from '@/api/handlers/profile';
export { selfHandlers } from '@/api/handlers/self';
export { syncHandlers } from '@/api/handlers/sync';

import { communityAPI } from '@/api/orchestration/community';
import {
  assignmentsAPI,
  classroomGroupsAPI,
  classroomNotesAPI,
  classroomStudentsAPI,
  classroomsAPI,
  lessonMaterialsAPI,
  lessonsAPI,
  studentsAPI,
} from '@/api/orchestration/educational';
import { accountingAPI, paymentsAPI } from '@/api/orchestration/erp';
// --- Orchestrated APIs (Extracted Domains) ---
import { identityAPI, profileAPI } from '@/api/orchestration/identity';
import {
  attendanceAPI,
  inventoryAPI,
  schoolAPI,
  staffManagementAPI,
} from '@/api/orchestration/operations';
import {
  founderAPI,
  gradingAPI,
  guardianAPI,
  longitudinalAPI,
  principalWorkspaceAPI,
  teacherInsightsAPI,
} from '@/api/orchestration/specialized';

export type { CalendarEvent } from '@repo/schema';
export type { ClassroomNote } from '@/types/ClassroomNote';
export type {
  BanyanStage,
  BhumiStage,
  CrystalTier,
  ImpactRipple,
  RippleSourceEntityType,
  RippleType,
  RiverStage,
  UserGrowthState,
} from '@/types/Growth';
export type { PrincipalNote } from '@/types/PrincipalNote';
// --- Re-exports (Types & Contracts) ---
export * from '@/api/admin.contract';
export * from '@/api/announcements';
export * from '@/api/circles';
export * from '@/api/classroomGroups';
export * from '@/api/classroomNotes.contract';
export * from '@/api/community.contract';
export * from '@/api/contextualChallenges';
export * from '@/api/contractCoverage';
export * from '@/api/educational.contract';
export * from '@/api/erp';
export * from '@/api/erp.contract';
export * from '@/api/founder.contract';
export * from '@/api/grading.contract';
export * from '@/api/growth.contract';
export * from '@/api/growthSignals';
export * from '@/api/guardian';
export * from '@/api/guardian.contract';
export * from '@/api/history';
export * from '@/api/hooks';
export * from '@/api/identity.contract';
export * from '@/api/impactRipples';
export * from '@/api/library.contract';
export * from '@/api/longitudinal';
export * from '@/api/longitudinal.contract';
export * from '@/api/mapping';
export * from '@/api/mockData';
export * from '@/api/moonPhase';
export * from '@/api/naturePaths';
export * from '@/api/operations.contract';
export * from '@/api/principalNotes';
export * from '@/api/principalWorkspace';
export * from '@/api/principalWorkspace.contract';
export * from '@/api/privacy';
export * from '@/api/pro.contract';
export * from '@/api/profile.contract';
export * from '@/api/sacredMissions';
export * from '@/api/schoolForest';
export * from '@/api/self.contract';
export * from '@/api/staffManagement';
export * from '@/api/studentObservations';
export * from '@/api/studentPotential';
export * from '@/api/sync.contract';
export * from '@/api/teacherInsights';
export * from '@/api/teacherInsights.contract';
export * from '@/api/temporalProxy';
export * from '@/api/thuthimal';
export * from '@/api/userGrowthState';
export * from '@/api/warmMirror';
export * from '@/api/workspaceLayout.contract';

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
