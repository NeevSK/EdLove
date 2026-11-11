import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';
export { inspectJourneyPilot, inspectJourneyContract } from './journeyPilot';
import { guardianLinkStudentFlow } from './admin/guardianLinkStudent.flow';
import { principalTermSetupFlow } from './admin/principalTermSetup.flow';
import { principalConnectSchoolFlow } from './admin/principalConnectSchool.flow';
import { studentClaimPassFlow } from './classroom/studentClaimPass.flow';
import { studentProfileSoulViewFlow } from './classroom/studentProfileSoulView.flow';
import { teacherRollCallFlow } from './classroom/teacherRollCall.flow';
import { teacherFirstWorkspaceFlow } from './classroom/teacherFirstWorkspace.flow';
import { teacherStudentRadarAttunementFlow } from './classroom/teacherStudentRadarAttunement.flow';
import { linkedProvidersFlow } from './account/linkedProviders.flow';
import { mobileEntryFlow } from './entry/mobileEntry.flow';
import { webSanctuaryEntryFlow } from './entry/webSanctuaryEntry.flow';
import { qrResolutionFlow } from './qr/qrResolution.flow';
import { mindfulBreathingFlow } from './self/mindfulBreathing.flow';
import { founderCommandDeckFlow } from './founder/founderCommandDeck.flow';
import { studentDailyPrepFlow } from './self/studentDailyPrep.flow';

export const FLOW_REGISTRY = {
  'flow:entry:mobile': mobileEntryFlow,
  'flow:entry:web_sanctuary': webSanctuaryEntryFlow,
  'flow:account:linked_providers': linkedProvidersFlow,
  'flow:qr:resolve': qrResolutionFlow,
  'flow:teacher:roll_call': teacherRollCallFlow,
  'flow:teacher:first_workspace': teacherFirstWorkspaceFlow,
  'flow:student:join_classroom': studentClaimPassFlow,
  'flow:teacher:student_radar_attunement': teacherStudentRadarAttunementFlow,
  'flow:student:profile_soul_view': studentProfileSoulViewFlow,
  'flow:guardian:link_child': guardianLinkStudentFlow,
  'flow:principal:term_setup': principalTermSetupFlow,
  'flow:principal:connect_school': principalConnectSchoolFlow,
  'flow:self:mindful_breath': mindfulBreathingFlow,
  'flow:founder:command_deck': founderCommandDeckFlow,
  'flow:self:student_daily_prep': studentDailyPrepFlow,
} as const;

export type FlowId = keyof typeof FLOW_REGISTRY;

/**
 * Resolves a JTBD flow by its foreign key FlowId.
 */
export function getFlow(flowId: FlowId): FeatureJTBDGraph {
  const flow = FLOW_REGISTRY[flowId];
  if (!flow) {
    throw new Error(`FlowRegistry: Flow not found for foreign key "${flowId}".`);
  }
  return flow;
}

/**
 * Lists all registered flows in the monorepo.
 */
export function getAllFlows(): FeatureJTBDGraph[] {
  return Object.values(FLOW_REGISTRY);
}
