import fs from 'node:fs';
import path from 'node:path';
import { CANONICAL_ARCHETYPES } from './audit-canonical-file-types.mjs';

const REPO_ROOT = process.cwd();
const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');

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

const files = walk(CORE_SRC);
const unclassified = [];

files.forEach(f => {
  let matched = false;
  for (const meta of Object.values(CANONICAL_ARCHETYPES)) {
    if (meta.matcher(f.name, f.path)) {
      matched = true;
      break;
    }
  }
  if (!matched) {
    unclassified.push(f);
  }
});

console.log(`Total Unclassified Files: ${unclassified.length}`);

// Group by immediate folder inside packages/core/src/
const folderMap = {};
unclassified.forEach(f => {
  const parts = f.path.split('packages/core/src/')[1]?.split('/') || [];
  const folder = parts[0] || 'root';
  if (!folderMap[folder]) folderMap[folder] = [];
  folderMap[folder].push(f);
});

console.log('\n=== UNCLASSIFIED (PARETO 20%) BY FOLDER ===');
Object.entries(folderMap).sort((a,b) => b[1].length - a[1].length).forEach(([folder, list]) => {
  console.log(`\n📁 [${folder}/] (${list.length} files):`);
  list.slice(0, 10).forEach(f => {
    console.log(`   - ${f.name} (${f.path.split('packages/core/src/')[1]})`);
  });
  if (list.length > 10) console.log(`   ... and ${list.length - 10} more`);
});
