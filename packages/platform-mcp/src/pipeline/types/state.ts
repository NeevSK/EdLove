import { Annotation } from '@langchain/langgraph';
import type { FlowDefinition, FlowValidationReceipt } from '../flow/types.js';

export interface VerificationReceipt {
  stage: 'STATIC' | 'HEADLESS' | 'E2E';
  passed: boolean;
  durationMs: number;
  output?: string;
  errorTrace?: string;
}

export interface GroundedSymbol {
  name: string;
  signature: string;
  source: string;
  deprecated?: boolean;
}

export interface ScaffoldingContract {
  path: string;
  schemaText: string;
  contractType: 'zod' | 'orpc' | 'viewmodel';
}

export const PipelineState = Annotation.Root({
  taskId: Annotation<string>({
    reducer: (curr, update) => update ?? curr,
    default: () => 'task-' + Date.now(),
  }),
  intent: Annotation<string>({
    reducer: (curr, update) => update ?? curr,
    default: () => '',
  }),
  targetPackage: Annotation<string>({
    reducer: (curr, update) => update ?? curr,
    default: () => '@repo/core',
  }),
  contract: Annotation<ScaffoldingContract | undefined>({
    reducer: (curr, update) => update !== undefined ? update : curr,
    default: () => undefined,
  }),
  flowDefinition: Annotation<FlowDefinition | undefined>({
    reducer: (curr, update) => update !== undefined ? update : curr,
    default: () => undefined,
  }),
  flowReceipt: Annotation<FlowValidationReceipt | undefined>({
    reducer: (curr, update) => update !== undefined ? update : curr,
    default: () => undefined,
  }),
  groundedSymbols: Annotation<GroundedSymbol[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  modifiedFiles: Annotation<string[]>({
    reducer: (curr, update) => Array.from(new Set([...curr, ...update])),
    default: () => [],
  }),
  receipts: Annotation<VerificationReceipt[]>({
    reducer: (curr, update) => [...curr, ...update],
    default: () => [],
  }),
  iteration: Annotation<number>({
    reducer: (curr, update) => (update !== undefined ? update : curr + 1),
    default: () => 0,
  }),
  maxIterations: Annotation<number>({
    reducer: (curr, update) => update ?? curr,
    default: () => 3,
  }),
  status: Annotation<'IN_PROGRESS' | 'PASSED' | 'FAILED'>({
    reducer: (curr, update) => update ?? curr,
    default: () => 'IN_PROGRESS',
  }),
  lastError: Annotation<string | undefined>({
    reducer: (curr, update) => update !== undefined ? update : curr,
    default: () => undefined,
  }),
});

export type PipelineStateType = typeof PipelineState.State;
