import { academicCyclesAPI } from '@repo/core/api/academicCycles';
import { agentAPI } from '@repo/core/api/agent';
import { announcementAPI } from '@repo/core/api/announcements';
import { authAPI } from '@repo/core/api/auth';
import { circleAPI } from '@repo/core/api/circles';
import { contextualChallengesAPI } from '@repo/core/api/contextualChallenges';
import { dailyContentAPI } from '@repo/core/api/dailyContent';
import { readLocalFirst, writeLocalFirst } from '@repo/core/api/dataGateway';
import { demoAPI } from '@repo/core/api/demo';
import { deviceTrustAPI } from '@repo/core/api/deviceTrust';
import { echoAPI } from '@repo/core/api/echo';
import { formTemplatesAPI } from '@repo/core/api/formTemplates';
import { createSovereignGateway, sovereignGateway } from '@repo/core/api/gateway';
import { groupsAPI } from '@repo/core/api/groups';
import { historyAPI } from '@repo/core/api/history';
import { libraryAPI } from '@repo/core/api/library';
import { mappingAPI } from '@repo/core/api/mapping';
import { mediaAPI } from '@repo/core/api/media';
import { messagingAPI } from '@repo/core/api/messaging';
import { moonPhaseAPI } from '@repo/core/api/moonPhase';
import { naturePathsAPI } from '@repo/core/api/naturePaths';
import { onboardingAPI } from '@repo/core/api/onboarding';
import {
  growthAPI,
  growthStateAPI,
  missionsAPI,
  proAPI,
  ripplesAPI,
} from '@repo/core/api/orchestration/growth';
import { type ORPCClient, type ORPCUtils, orpc, orpcClient } from '@repo/core/api/orpcClient';
import { planBridgeAPI } from '@repo/core/api/planBridge';
import { presenceAPI } from '@repo/core/api/presence';
import { principalNotesAPI } from '@repo/core/api/principalNotes';
import { privacyAPI } from '@repo/core/api/privacy';
// profileAPI is imported from orchestration/identity below to use the proxied version
import { resourcesAPI } from '@repo/core/api/resources';
import { rewardsAPI } from '@repo/core/api/rewards';
import { schoolForestAPI } from '@repo/core/api/schoolForest';
import { socialAPI } from '@repo/core/api/social';
import { studentObservationsAPI } from '@repo/core/api/studentObservations';
import { studentPotentialAPI } from '@repo/core/api/studentPotential';
import { tasksAPI } from '@repo/core/api/teacher';
import { trackingAPI } from '@repo/core/api/tracking';
import { warmMirrorAPI } from '@repo/core/api/warmMirror';

export * from '@repo/core/api/base';

import { communityAPI } from '@repo/core/api/orchestration/community';
import {
  assignmentsAPI,
  classroomGroupsAPI,
  classroomNotesAPI,
  classroomStudentsAPI,
  classroomsAPI,
  lessonMaterialsAPI,
  lessonsAPI,
  studentsAPI,
} from '@repo/core/api/orchestration/educational';
import { accountingAPI, paymentsAPI } from '@repo/core/api/orchestration/erp';
import { identityAPI, profileAPI } from '@repo/core/api/orchestration/identity';
import {
  attendanceAPI,
  inventoryAPI,
  schoolAPI,
  staffManagementAPI,
} from '@repo/core/api/orchestration/operations';
import {
  founderAPI,
  gradingAPI,
  guardianAPI,
  longitudinalAPI,
  principalWorkspaceAPI,
  teacherInsightsAPI,
} from '@repo/core/api/orchestration/specialized';

export * from '@repo/core/api/admin.contract';
export * from '@repo/core/api/agent.contract';
export * from '@repo/core/api/announcements';
export * from '@repo/core/api/circles';
export * from '@repo/core/api/classroomGroups';
export * from '@repo/core/api/classroomNotes.contract';
export * from '@repo/core/api/community.contract';
export * from '@repo/core/api/contextualChallenges';
export * from '@repo/core/api/contractCoverage';
export * from '@repo/core/api/contracts';
export * from '@repo/core/api/decisionJournal.contract';
export * from '@repo/core/api/demoProvider';
export * from '@repo/core/api/durableAgents.contract';
export * from '@repo/core/api/editorial.contract';
export * from '@repo/core/api/educational.contract';
export * from '@repo/core/api/erp';
export * from '@repo/core/api/erp.contract';
export * from '@repo/core/api/forms.contract';
export * from '@repo/core/api/founder.contract';
export * from '@repo/core/api/grading.contract';
export * from '@repo/core/api/growth.contract';
export * from '@repo/core/api/growthSignals';
export * from '@repo/core/api/guardian';
export * from '@repo/core/api/guardian.contract';
export * from '@repo/core/api/history';
export * from '@repo/core/api/history.contract';
export * from '@repo/core/api/hooks';
export * from '@repo/core/api/identity.contract';
export * from '@repo/core/api/impactRipples';
export * from '@repo/core/api/inventory.contract';
export * from '@repo/core/api/journalEntries.contract';
export * from '@repo/core/api/library.contract';
export * from '@repo/core/api/longitudinal';
export * from '@repo/core/api/longitudinal.contract';
export * from '@repo/core/api/mapping';
export * from '@repo/core/api/mapping.contract';
export * from '@repo/core/api/mockData';
export * from '@repo/core/api/moonPhase';
export * from '@repo/core/api/naturePaths';
export * from '@repo/core/api/operations.contract';
export * from '@repo/core/api/presence.contract';
export * from '@repo/core/api/principalNotes';
export * from '@repo/core/api/principalWorkspace';
export * from '@repo/core/api/principalWorkspace.contract';
export * from '@repo/core/api/privacy';
export * from '@repo/core/api/pro.contract';
export * from '@repo/core/api/profile.contract';
export * from '@repo/core/api/sacredMissions';
export * from '@repo/core/api/sacredMissions.contract';
export * from '@repo/core/api/schoolForest';
export * from '@repo/core/api/self.contract';
export * from '@repo/core/api/staffManagement';
export * from '@repo/core/api/studentObservations';
export * from '@repo/core/api/studentPotential';
export * from '@repo/core/api/studentPotential.contract';
export * from '@repo/core/api/sync.contract';
export * from '@repo/core/api/teacherInsights';
export * from '@repo/core/api/teacherInsights.contract';
export * from '@repo/core/api/temporalProxy';
export * from '@repo/core/api/thuthimal';
export * from '@repo/core/api/tracking.contract';
export * from '@repo/core/api/userGrowthState';
// Only the runtime API here — WarmMirrorDataPoints comes from the contract
// module above; re-exporting both star-exports makes the type ambiguous.
export { warmMirrorAPI } from '@repo/core/api/warmMirror';
export * from '@repo/core/api/warmMirror.contract';
export * from '@repo/core/api/workspaceLayout.contract';
export type { ClassroomNote } from '@repo/core/types/ClassroomNote';
export type {
  BanyanStage,
  BhumiStage,
  CrystalTier,
  ImpactRipple,
  RippleSourceEntityType,
  RippleType,
  RiverStage,
  UserGrowthState,
} from '@repo/core/types/Growth';
export type { PrincipalNote } from '@repo/core/types/PrincipalNote';
export type { CalendarEvent } from '@repo/schema/generated/orm/models';
export type { ORPCClient, ORPCUtils };
export {
  academicCyclesAPI,
  agentAPI,
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
  orpc,
  orpcClient,
  planBridgeAPI,
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
 * Modern Sovereign oRPC v2 Dynamic Client Proxy
 *
 * Replaces the monolithic 70-entry manual API object with a lightweight,
 * zero-overhead proxy over `orpcClient`.
 *
 * Procedure calls route directly through orpcClient.<domain>.<procedure>().
 * Deleted or non-existent legacy methods throw loud, actionable errors.
 */
export const api: any = new Proxy(orpcClient, {
  get(target: any, domainProp: string) {
    if (domainProp in target) {
      return target[domainProp];
    }
    // Domain aliases for existing consumers
    if (domainProp === 'academicCycles') return target.educational;
    if (domainProp === 'tasks') return target.educational;
    if (domainProp === 'notes') return target.classroomNotes ?? target.educational;
    if (domainProp === 'lessons') return target.educational;
    if (domainProp === 'students') return target.educational;
    if (domainProp === 'accounting' || domainProp === 'payments') return target.erp;
    if (domainProp === 'challenges') return target.growth;
    if (domainProp === 'missions') return target.sacredMissions;
    if (domainProp === 'pro') return target.thuthimal;
    if (domainProp === 'echo') return target.echoes;
    if (domainProp === 'forms') return target.forms;
    if (domainProp === 'school') return target.admin;

    // Loud break for deleted/unmapped domain properties
    throw new Error(
      `[NUCLEAR-HARD-CUT] Domain property "api.${domainProp}" does not exist in oRPC v2. Migrate directly to orpcClient.${domainProp}.*`,
    );
  },
});

export default api;
export * from './pilot.orpc.v2';
