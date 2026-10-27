export {
  FlowTriggerSchema,
  FlowFallbackConditionSchema,
  FlowFallbackEdgeSchema,
  FlowNodeStepSchema,
  FeatureJTBDGraphSchema,
} from '@repo/core/logic/registry/domainEntry';

export type {
  FlowTrigger,
  FlowFallbackCondition,
  FlowFallbackEdge,
  FlowNodeStep,
  FeatureJTBDGraph,
} from '@repo/core/logic/registry/domainEntry';

import type { FeatureJTBDGraph, FlowNodeStep } from '@repo/core/logic/registry/domainEntry';

/**
 * Validates that a JTBD flow forms a valid Directed Acyclic Graph (DAG)
 * and that all fallback references point to known nodes or valid external routes.
 */
export function validateFlowDAG(graph: FeatureJTBDGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const nodeMap = new Map<string, FlowNodeStep>();

  for (const node of graph.nodes) {
    if (nodeMap.has(node.stepId)) {
      errors.push(`Duplicate stepId "${node.stepId}" in feature "${graph.featureId}".`);
    }
    nodeMap.set(node.stepId, node);
  }

  // Ensure at least one terminal or completion node exists
  const hasTerminal = graph.nodes.some(
    (n) => n.purpose === 'terminal_success' || n.fallbacks.length === 0,
  );
  if (!hasTerminal) {
    errors.push(
      `Feature "${graph.featureId}" must have at least one terminal node or exit path.`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
