import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.turbo', '__tests__'].includes(entry.name)) {
        files = files.concat(walk(full));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (!entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
        files.push({ name: entry.name, path: full.replace(/\\/g, '/') });
      }
    }
  }
  return files;
}

const files = walk('packages/core/src');
console.log('Total non-test files in packages/core/src:', files.length);

const patterns = {};
const samples = {};

files.forEach(f => {
  const n = f.name;
  let category = 'other';
  if (n === 'index.ts' || n === 'index.tsx') category = 'barrel / index';
  else if (n.includes('.schema.')) category = 'schema';
  else if (n.includes('.port.')) category = 'port';
  else if (n.includes('.adapter.')) category = 'adapter';
  else if (n.includes('Repository') || n.includes('repository')) category = 'repository';
  else if (n.includes('Manager') || n.includes('manager')) category = 'manager';
  else if (n.includes('Service') || n.includes('service')) category = 'service';
  else if (n.includes('Store') || n.includes('store')) category = 'store';
  else if (n.includes('.slice.')) category = 'slice';
  else if (n.includes('.flow.')) category = 'flow';
  else if (n.startsWith('use')) category = 'hook';
  else if (n.includes('storage') || n.includes('Storage')) category = 'storage';
  else if (n.includes('factory') || n.includes('Factory')) category = 'factory';
  else if (n.includes('Coordinator') || n.includes('coordinator')) category = 'coordinator';
  else if (n.includes('Registry') || n.includes('registry')) category = 'registry';
  else if (n.includes('Manifest') || n.includes('manifest')) category = 'manifest';
  else if (n.includes('shim') || n.includes('Shim') || n.includes('proxy') || n.includes('Proxy')) category = 'shim / proxy';
  else if (n.includes('util') || n.includes('helper')) category = 'utility / helper';
  else if (f.path.includes('/types/')) category = 'type definition';

  patterns[category] = (patterns[category] || 0) + 1;
  if (!samples[category]) samples[category] = [];
  if (samples[category].length < 3) samples[category].push(f.name);
});

console.log('\nArchetype occurrences in packages/core/src:');
Object.entries(patterns).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  - ${cat.padEnd(20)}: ${count.toString().padStart(3)} files (e.g. ${samples[cat].join(', ')})`);
});
