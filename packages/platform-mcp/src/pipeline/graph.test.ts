import { describe, it, expect } from 'vitest';
import { createAgentPipeline } from './graph.js';

describe('Deterministic LangGraph Agent Pipeline', () => {
  it('executes the full feedforward and verification stages to completion', async () => {
    const pipeline = createAgentPipeline();

    const result = await pipeline.invoke({
      taskId: 'test-task-1',
      intent: 'Verify attendance export flow',
      targetPackage: '@repo/core',
    });

    expect(result.status).toBe('PASSED');
    expect(result.iteration).toBe(1);
    expect(result.contract).toBeDefined();
    expect(result.contract?.path).toContain('verify_attendance_export_flow');
    expect(result.groundedSymbols.length).toBeGreaterThan(0);

    // Verify all 3 verification receipts were generated
    const stages = result.receipts.map((r: any) => r.stage);
    expect(stages).toContain('STATIC');
    expect(stages).toContain('HEADLESS');
    expect(stages).toContain('E2E');
  }, 30000);

  it('correctly populates grounded symbols and detects deprecated dialect rules', async () => {
    const pipeline = createAgentPipeline();

    const result = await pipeline.invoke({
      taskId: 'test-grounding',
      intent: 'Audit gesture and worklets substrate',
      targetPackage: 'apps/gurudevi-mobile',
    });

    const workletsSymbol = result.groundedSymbols.find((s: any) => s.name === 'scheduleOnRN');
    expect(workletsSymbol).toBeDefined();
    expect(workletsSymbol?.source).toBe('react-native-worklets');

    const deprecatedSymbol = result.groundedSymbols.find((s: any) => s.name === 'runOnJS');
    expect(deprecatedSymbol).toBeDefined();
    expect(deprecatedSymbol?.deprecated).toBe(true);
  }, 30000);

  it('resolves declarative 4-layer flow from journey intent and executes flow-grounded pipeline', async () => {
    const pipeline = createAgentPipeline();

    const result = await pipeline.invoke({
      taskId: 'test-flow-pipeline',
      intent: 'journey:chat.send_message',
      targetPackage: 'apps/gurudevi-mobile',
    });

    expect(result.status).toBe('PASSED');
    expect(result.flowDefinition).toBeDefined();
    expect(result.flowDefinition?.metadata.id).toBe('journey:chat.send_message');
    expect(result.flowReceipt?.valid).toBe(true);

    // Verify contract is grounded in flow metadata and invariants
    expect(result.contract?.schemaText).toContain('journey:chat.send_message');
    expect(result.contract?.schemaText).toContain('composer_idle');
    expect(result.contract?.schemaText).toContain('rlsPolicy');

    // Verify headless verification simulated the 4-layer statechart
    const headlessReceipt = result.receipts.find((r: any) => r.stage === 'HEADLESS');
    expect(headlessReceipt).toBeDefined();
    expect(headlessReceipt?.passed).toBe(true);
    expect(headlessReceipt?.output).toContain('Shopify Headless: 100% scenarios verified');
  }, 30000);
});
