import type { FeatureJTBDGraph } from '@repo/core/types/FlowDAG';
import { teacherRollCallFlow } from './classroom/teacherRollCall.flow';
import { studentClaimPassFlow } from './classroom/studentClaimPass.flow';
import { guardianLinkStudentFlow } from './admin/guardianLinkStudent.flow';
import { principalTermSetupFlow } from './admin/principalTermSetup.flow';
import { mindfulBreathingFlow } from './self/mindfulBreathing.flow';

export const FLOW_REGISTRY = {
  'flow:teacher:roll_call': teacherRollCallFlow,
  'flow:student:join_classroom': studentClaimPassFlow,
  'flow:guardian:link_child': guardianLinkStudentFlow,
  'flow:principal:term_setup': principalTermSetupFlow,
  'flow:self:mindful_breath': mindfulBreathingFlow,
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
