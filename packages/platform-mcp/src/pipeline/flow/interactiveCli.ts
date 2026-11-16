#!/usr/bin/env node
import { flowRegistry } from './registry.js';
import { GranularJourneySimulator } from './simulator.js';

async function main() {
  const args = process.argv.slice(2);
  const journeyArg = args.find((a) => a.startsWith('--journey='))?.replace('--journey=', '') || 'chat.send_message';
  const scenarioArg = args.find((a) => a.startsWith('--scenario='))?.replace('--scenario=', '');
  const listScenarios = args.includes('--list-scenarios');

  const flow = flowRegistry.resolve(journeyArg);
  if (!flow) {
    console.error(`Error: Unknown journey "${journeyArg}". Available journeys: ${flowRegistry.list().map((f) => f.metadata.id).join(', ')}`);
    process.exit(1);
  }

  const simulator = new GranularJourneySimulator(flow);

  if (listScenarios) {
    console.log(`📋 SCENARIOS FOR ${flow.metadata.id}:`);
    for (const [id, s] of Object.entries(flow.scenarios || {})) {
      console.log(`  • ${id}: "${s.title}" (Persona: ${s.persona})`);
    }
    return;
  }

  console.log('========================================================================');
  console.log(`🧭 PRODUCT OWNER GRANULAR JOURNEY SIMULATOR: ${flow.metadata.id}`);
  console.log('========================================================================');
  console.log(`📌 SemVer:       v${flow.metadata.version}`);
  console.log(`🏛️ Domain:       ${flow.metadata.domain}`);
  console.log(`⚠️ Risk Tier:    ${flow.metadata.riskTier.toUpperCase()}`);
  console.log(`🎯 Target:       Expo ${flow.metadata.targetEngines.expo}, React ${flow.metadata.targetEngines.react}`);
  console.log('------------------------------------------------------------------------\n');

  if (flow.personas && flow.personas.length > 0) {
    console.log('👥 TARGET USER PERSONAS:');
    for (const p of flow.personas) {
      console.log(`  👤 ${p.role}: ${p.description}`);
      console.log(`     📱 Device: ${p.device} | 📶 Network: ${p.network}`);
    }
    console.log('------------------------------------------------------------------------\n');
  }

  if (flow.acceptanceCriteria && flow.acceptanceCriteria.length > 0) {
    console.log('📋 PRODUCT OWNER ACCEPTANCE CRITERIA MATRIX:');
    for (const ac of flow.acceptanceCriteria) {
      console.log(`  [${ac.id}] ${ac.title}`);
      console.log(`        📜 Rule: ${ac.rule}`);
      console.log(`        🧪 Verified By: "${ac.verifiedByScenario}"`);
    }
    console.log('------------------------------------------------------------------------\n');
  }

  const scenariosToRun = scenarioArg ? [scenarioArg] : Object.keys(flow.scenarios || {});

  if (scenariosToRun.length === 0) {
    console.log('ℹ️ No scenarios defined for this flow.');
    return;
  }

  for (const scenId of scenariosToRun) {
    console.log(`\n========================================================================`);
    console.log(`🎬 SIMULATING SCENARIO: "${scenId}"`);
    console.log('========================================================================');

    try {
      const result = simulator.runScenario(scenId);
      console.log(`📝 Scenario:     ${result.title}`);
      console.log(`👤 Active Persona: ${result.persona}`);
      console.log(`🏁 Outcome:      ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`);

      for (const step of result.steps) {
        console.log(`─── STEP ${step.stepIndex}: Event [${step.event}] ───────────────────────────────`);
        if (step.actor) {
          console.log(`  👤 Actor:   [${step.actor.toUpperCase()}]`);
        }
        console.log(`  🔄 State:   [${step.fromState}] ➔ [${step.toState}]`);
        if (step.motion) {
          console.log(`  🎨 Somatic: ${step.motion.type} (damping: ${step.motion.damping}, stiffness: ${step.motion.stiffness}, haptic: ${step.motion.haptic || 'none'})`);
        }
        if (step.sqliteMutation) {
          console.log(`  💾 Storage: ${step.sqliteMutation.operation} on table "${step.sqliteMutation.table}" (status: "${step.sqliteMutation.status}")`);
        }
        if (step.secondaryMutations && step.secondaryMutations.length > 0) {
          for (const sec of step.secondaryMutations) {
            console.log(`  💾 Compound: ${sec.operation} on table "${sec.table}" (status: "${sec.status || 'synced'}")`);
          }
        }
        console.log(`  🧪 PO Check: ${step.assertionPassed ? '✅' : '❌'} ${step.assertionMessage}`);

        // Render Visual Screen Mockup
        console.log('\n  📱 User Screen View:');
        console.log(simulator.renderAsciiScreen(step.visualFrame, step.toState));
        console.log('');
      }

      if (result.verifiedAcceptanceCriteria.length > 0) {
        console.log('🛡️ VERIFIED ACCEPTANCE CRITERIA:');
        for (const ac of result.verifiedAcceptanceCriteria) {
          console.log(`  ✅ ${ac}`);
        }
      }

      if (!result.success) {
        console.error(`❌ Error in scenario: ${result.error}`);
        process.exit(1);
      }
    } catch (err: any) {
      console.error(`❌ Error running scenario "${scenId}":`, err.message);
      process.exit(1);
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL PRODUCT OWNER SCENARIOS DETERMINISTICALLY VERIFIED (0 ERRORS)');
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
