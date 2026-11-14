import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json', 'utf8'));

// Build lookup maps
const nodeMap = new Map();
data.layerBreakdown.forEach(l => {
  l.files.forEach(f => {
    nodeMap.set(f.path, { ...f, layer: l.layer });
  });
});

console.log('=== 1. WHY IS featureRollout.port.ts AT LAYER 3? ===');
const frp = nodeMap.get('packages/core/src/logic/ports/featureRollout.port.ts');
if (frp) {
  console.log('Imports of featureRollout.port.ts:');
  frp.imports.forEach(imp => {
    const target = nodeMap.get(imp.canonical);
    console.log(`  -> ${imp.canonical} (Layer ${target?.layer ?? 'external'}) [symbols: ${imp.symbols.join(', ')}]`);
  });
}

console.log('\n=== 2. WHY IS supabaseEntitlement.adapter.ts AT LAYER 10? ===');
const sea = nodeMap.get('packages/core/src/adapters/supabase/supabaseEntitlement.adapter.ts');
if (sea) {
  console.log('Imports of supabaseEntitlement.adapter.ts:');
  sea.imports.forEach(imp => {
    const target = nodeMap.get(imp.canonical);
    console.log(`  -> ${imp.canonical} (Layer ${target?.layer ?? 'external'}) [symbols: ${imp.symbols.join(', ')}]`);
  });
}

console.log('\n=== 3. WHO IMPORTS FROM ADAPTERS DIRECTLY? (Inversion Violation) ===');
data.edges.forEach(e => {
  if (e.to.includes('/adapters/')) {
    const sourceNode = nodeMap.get(e.from);
    console.log(`[VIOLATION?] ${e.from} (L${sourceNode?.layer}) imports ADAPTER ${e.to} (symbols: ${e.symbols.join(', ')})`);
  }
});

console.log('\n=== 4. WHO IMPORTS FROM SCHEMAS DIRECTLY? ===');
data.edges.forEach(e => {
  if (e.to.includes('.schema.') || e.to.includes('/schemas/')) {
    const sourceNode = nodeMap.get(e.from);
    console.log(`  ${e.from} (L${sourceNode?.layer}) imports SCHEMA ${e.to} (symbols: ${e.symbols.join(', ')})`);
  }
});
