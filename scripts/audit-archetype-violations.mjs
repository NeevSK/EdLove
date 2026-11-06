import fs from 'node:fs';
import { ARCHETYPES, classifyArchetype } from './classify-archetypes.mjs';

const data = JSON.parse(fs.readFileSync('apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json', 'utf8'));

// Map all files to their archetype and tier rank
const fileMap = new Map();
data.layerBreakdown.forEach(l => {
  l.files.forEach(f => {
    const archKey = classifyArchetype(f.path);
    fileMap.set(f.path, {
      path: f.path,
      name: f.path.split('/').pop(),
      topologicalLayer: l.layer,
      archetypeKey: archKey,
      ...ARCHETYPES[archKey],
    });
  });
});

console.log('=== AUDITING 138 EDGES AGAINST ARCHITECTURAL HIERARCHY RULES ===\n');

const violations = {
  adapterCoupling: [],      // Store or Hook directly importing Concrete Adapter (violates Port abstraction)
  schemaRuntimeInHook: [],  // Hook running runtime Zod safeParse on Schema
  portImportingLogic: [],   // Port importing Domain Logic or Adapter
  domainImportingStore: [], // Domain logic importing Zustand store
  chainBypasses: [],        // Hook bypassing Store to reach Port directly
};

data.edges.forEach(e => {
  const source = fileMap.get(e.from);
  const target = fileMap.get(e.to);
  if (!source || !target) return;

  // 1. Adapter Coupling (Dependency Inversion Violation)
  // Non-adapters importing adapters!
  if (target.archetypeKey === 'TIER_3_ADAPTER' && source.archetypeKey !== 'TIER_3_ADAPTER') {
    violations.adapterCoupling.push({
      from: source.name,
      fromPath: source.path,
      fromTier: source.name,
      fromArchetype: source.archetypeKey,
      to: target.name,
      toPath: target.path,
      symbols: e.symbols,
      isTypeOnly: e.isTypeOnly,
    });
  }

  // 2. Hook directly importing Schema runtime values
  if (source.archetypeKey === 'TIER_5_HOOK' && target.archetypeKey === 'TIER_0_SCHEMA') {
    if (!e.isTypeOnly && e.symbols.some(s => s.endsWith('Schema'))) {
      violations.schemaRuntimeInHook.push({
        from: source.name,
        to: target.name,
        symbols: e.symbols.filter(s => s.endsWith('Schema')),
      });
    }
  }

  // 3. Chain Bypass: Hook importing Port directly when a Store exists for that seam!
  if (source.archetypeKey === 'TIER_5_HOOK' && target.archetypeKey === 'TIER_1_PORT') {
    violations.chainBypasses.push({
      hook: source.name,
      port: target.name,
      symbols: e.symbols,
      note: 'Hook invokes Port function directly instead of delegating to a Store action',
    });
  }
});

console.log(`1. ADAPTER DIRECT COUPLING VIOLATIONS (${violations.adapterCoupling.length}):`);
violations.adapterCoupling.forEach(v => {
  console.log(`   🚨 [${v.fromArchetype}] ${v.from} -> ADAPTER ${v.to} (symbols: ${v.symbols.join(', ')})`);
});

console.log(`\n2. RUNTIME SCHEMA PARSING IN HOOKS (${violations.schemaRuntimeInHook.length}):`);
violations.schemaRuntimeInHook.forEach(v => {
  console.log(`   ⚠️ Hook [${v.from}] parses runtime schema in [${v.to}] (symbols: ${v.symbols.join(', ')})`);
});

console.log(`\n3. CHAIN BYPASSES (Hook -> Port) (${violations.chainBypasses.length}):`);
violations.chainBypasses.forEach(v => {
  console.log(`   🔗 Hook [${v.hook}] calls Port [${v.port}] directly (symbols: ${v.symbols.join(', ')})`);
});
