import fs from 'node:fs';
import path from 'node:path';

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

const allFiles = walk(CORE_SRC);
const authFiles = allFiles.filter(f => {
  const p = f.path.toLowerCase();
  const n = f.name.toLowerCase();
  return p.includes('auth') || p.includes('identity') || p.includes('session') || p.includes('user') || p.includes('bond') || p.includes('citizen');
});

console.log(`Total Auth/Identity/Session/User files in @repo/core/src: ${authFiles.length}`);

// Group by role
const categories = {
  stores: [],
  hooks: [],
  schemas: [],
  ports: [],
  adapters: [],
  providers: [],
  logic_policies: [],
  other: [],
};

authFiles.forEach(f => {
  const n = f.name.toLowerCase();
  const p = f.path.toLowerCase();

  if (n.includes('store') || p.includes('/store/')) categories.stores.push(f);
  else if (n.startsWith('use') || p.includes('/hooks/')) categories.hooks.push(f);
  else if (n.includes('schema') || p.includes('/schemas/')) categories.schemas.push(f);
  else if (n.includes('port') || p.includes('/ports/')) categories.ports.push(f);
  else if (n.includes('adapter') || p.includes('/adapters/')) categories.adapters.push(f);
  else if (n.includes('provider') || p.includes('/providers/')) categories.providers.push(f);
  else if (p.includes('/logic/') || p.includes('/registry/')) categories.logic_policies.push(f);
  else categories.other.push(f);
});

console.log('\n=== AUTH FILES BREAKDOWN ===');
Object.entries(categories).forEach(([cat, list]) => {
  console.log(`\n🔹 ${cat.toUpperCase()} (${list.length} files):`);
  list.forEach(f => {
    console.log(`   - ${f.name} (${f.path.split('packages/core/src/')[1]})`);
  });
});
