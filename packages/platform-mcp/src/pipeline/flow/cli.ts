#!/usr/bin/env node
import { flowRegistry } from './registry.js';
import { validateFlow } from './flowValidator.js';
import type { FlowDefinition } from './types.js';

async function main() {
  const args = process.argv.slice(2);
  const isList = args.includes('--list') || args.includes('-l');
  const journeyArg = args.find((a) => a.startsWith('--journey='))?.replace('--journey=', '') || 'chat.send_message';
  const formatArg = args.find((a) => a.startsWith('--format='))?.replace('--format=', '') || 'dsl';

  if (isList) {
    console.log('📋 REGISTERED 4-LAYER PRODUCTION FLOWS:');
    for (const f of flowRegistry.list()) {
      console.log(`  • ${f.metadata.id} (v${f.metadata.version}) [Tier: ${f.metadata.riskTier}] - Domain: ${f.metadata.domain}`);
    }
    return;
  }

  const flow = flowRegistry.resolve(journeyArg);
  if (!flow) {
    const available = flowRegistry.list().map((f) => f.metadata.id).join(', ');
    console.error(`Error: Unknown journey "${journeyArg}". Available journeys: ${available}`);
    process.exit(1);
  }

  const receipt = validateFlow(flow);

  if (formatArg === 'json') {
    console.log(JSON.stringify({ flow, validation: receipt }, null, 2));
    return;
  }

  // DSL Pseudocode output mode
  console.log('===============================================================');
  console.log(`🧭 DECLARATIVE 4-LAYER FLOW SPECIFICATION: ${flow.metadata.id}`);
  console.log('===============================================================');
  console.log(`📌 Version:       v${flow.metadata.version} (SemVer)`);
  console.log(`🏛️ Domain:        ${flow.metadata.domain}`);
  console.log(`⚠️ Risk Tier:     ${flow.metadata.riskTier.toUpperCase()}`);
  console.log(`🎯 Target Engine: Expo ${flow.metadata.targetEngines.expo}, React ${flow.metadata.targetEngines.react}`);
  console.log(`✅ Flow Valid:    ${receipt.valid ? 'YES (0 errors)' : 'NO'}`);
  console.log('---------------------------------------------------------------\n');

  console.log('🚪 INGRESS VECTORS & ADMISSION GUARDS:');
  for (const v of flow.ingress.supportedVectors) {
    console.log(`  • [Ingress] ${v.type}${v.deepLinkPattern ? ` -> Pattern: "${v.deepLinkPattern}"` : ''}`);
  }
  for (const g of flow.ingress.guards) {
    console.log(`  • [Guard]   ${g.name}: ${g.predicate} => Else Bounce: "${g.onFailureBounceRoute}"`);
  }

  console.log('\n📐 LAYER 1 & 2: TOPOLOGICAL STATES & SOMATIC MOTION RECIPES:');
  for (const [stateName, node] of Object.entries(flow.states)) {
    console.log(`  📍 State: [${stateName}] on Screen: "${node.screen}"`);
    console.log(`     Component: ${node.component} (Keyboard: ${node.keyboardAvoidance || 'none'})`);
    for (const [eventName, transition] of Object.entries(node.onEvents)) {
      console.log(`     ⚡ Event: (${eventName}) ${transition.guard ? `[Guard: ${transition.guard}]` : ''} -> Target: [${transition.targetState}]`);
      if (transition.motion) {
        console.log(`        🎨 Motion:  ${transition.motion.type} (damping: ${transition.motion.damping}, stiffness: ${transition.motion.stiffness}, haptic: ${transition.motion.haptic || 'none'})`);
      }
      if (transition.dataMutation) {
        console.log(`        💾 Data:    ${transition.dataMutation.type} on table "${transition.dataMutation.table || 'remote'}"`);
      }
    }
  }

  console.log('\n🏁 TERMINAL CONVERGENCE NODES (Where the flow ends):');
  for (const [termName, node] of Object.entries(flow.terminals)) {
    console.log(`  🏁 Terminal: [${termName}] (${node.type.toUpperCase()}) -> Convergence: "${node.convergence}"`);
    if (node.action) {
      console.log(`     Action: ${node.action} (Badge: ${node.uiBadge || 'none'}, Haptic: ${node.haptic || 'none'})`);
    }
  }

  console.log('\n🛡️ LAYER 4: INVARIANT & GOVERNANCE ENVELOPE (Kernel Enforced):');
  console.log(`  🔒 RLS Policy:       ${flow.invariants.rlsPolicy}`);
  console.log(`  🗑️ Soft Delete:      ${flow.invariants.softDeleteField}`);
  console.log(`  🚫 Forbidden Dialects: ${flow.invariants.forbiddenDialects.join(', ')}`);

  console.log('\n===============================================================');
  console.log(`📊 Validated: ${receipt.totalStates} States, ${receipt.totalTerminals} Terminals. Errors: ${receipt.errors.length}, Warnings: ${receipt.warnings.length}`);
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
