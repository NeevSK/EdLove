#!/usr/bin/env node
import { createAgentPipeline } from './graph.js';

async function main() {
  const args = process.argv.slice(2);
  const intentArg = args.find((a) => a.startsWith('--intent='))?.replace('--intent=', '') || 'Refactor attendance export capability';
  const packageArg = args.find((a) => a.startsWith('--package='))?.replace('--package=', '') || '@repo/core';

  console.log('===============================================================');
  console.log('🚀 INITIALIZING IN-PROCESS LANGGRAPH DETERMINISTIC AGENT PIPELINE');
  console.log('===============================================================');
  console.log(`📌 Task Intent:    ${intentArg}`);
  console.log(`📦 Target Package: ${packageArg}`);
  console.log(`🔒 Control Plane:  LangGraph v1.7.3 (Zero-Daemon In-Process)`);
  console.log('---------------------------------------------------------------\n');

  const pipeline = createAgentPipeline();

  const initialState = {
    taskId: `task-${Date.now()}`,
    intent: intentArg,
    targetPackage: packageArg,
  };

  const startTime = Date.now();
  const finalState = await pipeline.invoke(initialState);
  const duration = Date.now() - startTime;

  console.log('\n===============================================================');
  console.log(`🏁 PIPELINE EXECUTION COMPLETED IN ${duration}ms`);
  console.log(`📊 Final Status:    ${finalState.status}`);
  console.log(`🔁 Total Loops:     ${finalState.iteration} / ${finalState.maxIterations}`);
  if (finalState.flowDefinition) {
    console.log(`🧭 Flow Contract:   ${finalState.flowDefinition.metadata.id} (v${finalState.flowDefinition.metadata.version})`);
    console.log(`⚠️ Risk Tier:       ${finalState.flowDefinition.metadata.riskTier.toUpperCase()}`);
    console.log(`🔒 RLS Policy:       ${finalState.flowDefinition.invariants.rlsPolicy}`);
  }
  console.log(`📄 Scaffolding:     ${finalState.contract?.path ?? 'none'}`);
  console.log(`🛡️ Grounded Symbols: ${finalState.groundedSymbols.length} inspected`);
  console.log('---------------------------------------------------------------');
  console.log('📋 VERIFICATION RECEIPTS:');

  for (const receipt of finalState.receipts) {
    const icon = receipt.passed ? '✅' : '❌';
    console.log(`  ${icon} [${receipt.stage}] ${receipt.output || receipt.errorTrace} (${receipt.durationMs}ms)`);
  }

  console.log('===============================================================\n');

  if (finalState.status !== 'PASSED') {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Pipeline Execution Error:', err);
  process.exit(1);
});
