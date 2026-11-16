import type { PipelineStateType } from '../types/state.js';
import { flowRegistry } from '../flow/registry.js';
import { validateFlow } from '../flow/flowValidator.js';

export async function ingestNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  const intent = state.intent || 'Execute deterministic task';
  const targetPackage = state.targetPackage || '@repo/core';

  // 1. Resolve declarative flow from intent or journey ID
  const flowDefinition = flowRegistry.resolve(intent);
  let flowReceipt = undefined;
  let status: 'IN_PROGRESS' | 'FAILED' = 'IN_PROGRESS';
  let lastError: string | undefined = undefined;

  if (flowDefinition) {
    flowReceipt = validateFlow(flowDefinition);
    if (!flowReceipt.valid) {
      status = 'FAILED';
      lastError = `Flow validation failed for ${flowDefinition.metadata.id}: ${flowReceipt.errors.join('; ')}`;
    }
  }

  return {
    taskId: state.taskId || `task-${Date.now()}`,
    intent,
    targetPackage,
    flowDefinition,
    flowReceipt,
    status,
    lastError,
    receipts: [],
  };
}
