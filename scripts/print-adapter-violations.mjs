import fs from 'node:fs';
import { ARCHETYPES, classifyArchetype } from './classify-archetypes.mjs';

const data = JSON.parse(fs.readFileSync('apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json', 'utf8'));

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

console.log('=== EXACT DETAILS OF ADAPTER DIRECT COUPLING (11) ===');
data.edges.forEach(e => {
  const s = fileMap.get(e.from);
  const t = fileMap.get(e.to);
  if (!s || !t) return;

  if (t.archetypeKey === 'TIER_3_ADAPTER' && s.archetypeKey !== 'TIER_3_ADAPTER') {
    console.log(`- [${s.archetypeKey}] ${s.name} (${s.path})`);
    console.log(`    ──imports──► [${t.archetypeKey}] ${t.name} (${t.path})`);
    console.log(`    symbols: [${e.symbols.join(', ')}]\n`);
  }
});
