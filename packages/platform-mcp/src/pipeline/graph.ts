import { StateGraph, END, START } from '@langchain/langgraph';
import { PipelineState, type PipelineStateType, type VerificationReceipt } from './types/state.js';
import { ingestNode } from './nodes/ingestNode.js';
import { scaffoldNode } from './nodes/scaffoldNode.js';
import { groundingNode } from './nodes/groundingNode.js';
import { builderNode } from './nodes/builderNode.js';
import { verifyStaticNode } from './nodes/verifyStaticNode.js';
import { verifyHeadlessNode } from './nodes/verifyHeadlessNode.js';
import { verifyE2ENode } from './nodes/verifyE2ENode.js';

function getLastReceipt(receipts: VerificationReceipt[], stage: 'STATIC' | 'HEADLESS' | 'E2E'): VerificationReceipt | undefined {
  for (let i = receipts.length - 1; i >= 0; i--) {
    const r = receipts[i];
    if (r && r.stage === stage) return r;
  }
  return undefined;
}

export function createAgentPipeline() {
  const workflow = new StateGraph(PipelineState)
    .addNode('ingest', ingestNode)
    .addNode('scaffold', scaffoldNode)
    .addNode('grounding', groundingNode)
    .addNode('builder', builderNode)
    .addNode('verify_static', verifyStaticNode)
    .addNode('verify_headless', verifyHeadlessNode)
    .addNode('verify_e2e', verifyE2ENode)
    .addEdge(START, 'ingest')
    .addEdge('ingest', 'scaffold')
    .addEdge('scaffold', 'grounding')
    .addEdge('grounding', 'builder')
    .addEdge('builder', 'verify_static')
    .addConditionalEdges('verify_static', (state: PipelineStateType) => {
      const lastReceipt = getLastReceipt(state.receipts, 'STATIC');
      if (!lastReceipt?.passed) {
        return state.iteration >= state.maxIterations ? END : 'builder';
      }
      return 'verify_headless';
    })
    .addConditionalEdges('verify_headless', (state: PipelineStateType) => {
      const lastReceipt = getLastReceipt(state.receipts, 'HEADLESS');
      if (!lastReceipt?.passed) {
        return state.iteration >= state.maxIterations ? END : 'builder';
      }
      return 'verify_e2e';
    })
    .addConditionalEdges('verify_e2e', (state: PipelineStateType) => {
      const lastReceipt = getLastReceipt(state.receipts, 'E2E');
      if (!lastReceipt?.passed) {
        return state.iteration >= state.maxIterations ? END : 'builder';
      }
      return END;
    });

  return workflow.compile();
}
