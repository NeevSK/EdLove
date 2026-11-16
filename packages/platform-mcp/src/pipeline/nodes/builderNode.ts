import type { PipelineStateType } from '../types/state.js';

export async function builderNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  const currentIteration = (state.iteration ?? 0) + 1;

  // Filter out deprecated symbols from allowed synthesis
  const allowedSymbols = state.groundedSymbols.filter((s) => !s.deprecated);
  const forbiddenAttempted = state.lastError?.includes('deprecated') || false;

  const modifiedFiles = [...state.modifiedFiles];
  if (state.contract?.path && !modifiedFiles.includes(state.contract.path)) {
    modifiedFiles.push(state.contract.path);
  }

  return {
    iteration: currentIteration,
    modifiedFiles,
    // Clear lastError for the new attempt
    lastError: undefined,
  };
}
