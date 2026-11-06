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

const files = walk(CORE_SRC);

// Refined Archetype Matchers (12 Core + 6 Specialized Cross-Cutting = 18 Total)
const EXTENDED_ARCHETYPES = {
  // CORE 12
  SCHEMA: (n, p) => n.includes('.schema.') || p.includes('/schemas/'),
  TYPE: (n, p) => p.includes('/types/') || n.endsWith('.types.ts') || n.endsWith('.d.ts'),
  PORT: (n, p) => n.includes('.port.') || p.includes('/ports/') || p.includes('/interfaces/'),
  DOMAIN_ENTITY: (n, p) => (p.includes('/logic/') || p.includes('/domain/') || p.includes('/educational/') || p.includes('/thresholds/')) && !n.startsWith('use') && !n.includes('.schema.') && !n.includes('.port.') && !n.includes('.adapter.'),
  DOMAIN_SERVICE: (n, p) => n.includes('Service') || n.includes('service'),
  ADAPTER: (n, p) => n.includes('.adapter.') || n.includes('Adapter') || (p.includes('/adapters/') && !n.includes('schema') && !n.includes('Repository')) || p.includes('cloudinary') || p.includes('inngest') || p.includes('resend'),
  REPOSITORY: (n, p) => n.includes('Repository') || n.includes('repository'),
  STORE: (n, p) => (n.includes('Store') || n.includes('store') || p.includes('/store/')) && !n.includes('/types/') && !n.includes('.slice.'),
  SLICE: (n, p) => n.includes('.slice.'),
  HOOK: (n, p) => n.startsWith('use') || p.includes('/hooks/'),
  FLOW: (n, p) => n.includes('.flow.') || n.includes('Coordinator') || n.includes('coordinator') || p.includes('/flows/') || p.includes('/accounts/'),
  BARREL: (n, p) => n === 'index.ts' || n === 'index.tsx',

  // SPECIALIZED 6 (The Pareto 20% Discovered)
  PROVIDER: (n, p) => n.endsWith('Provider.tsx') || p.includes('/providers/'),
  TELEMETRY: (n, p) => p.includes('/monitoring/') || n.includes('breadcrumbs') || n.includes('posthog') || n.includes('sentry') || n.includes('audit-log'),
  STORAGE_DRIVER: (n, p) => n.includes('Storage') || n.includes('storage') || n.includes('guestScope') || n.includes('localGuestSession') || n.includes('guestLease') || n.includes('guestConversion'),
  RESILIENCE_EFFECT: (n, p) => p.includes('/effect/') || n.includes('circuit-breaker') || n.includes('retry') || n.includes('backoff') || n.includes('resilience'),
  CONFIG_ENV: (n, p) => p.includes('/config/') || n.includes('publicUrls') || n.includes('Manifest') || n.includes('manifest') || n.includes('Registry') || n.includes('registry'),
  MATH_SPATIAL: (n, p) => p.includes('/spatial/') || p.includes('/constants/') || n.includes('geoMath') || n.includes('Schools'),
};

const counts = {};
Object.keys(EXTENDED_ARCHETYPES).forEach(k => counts[k] = 0);
const remainingUnclassified = [];

files.forEach(f => {
  let matched = false;
  for (const [key, matcher] of Object.entries(EXTENDED_ARCHETYPES)) {
    if (matcher(f.name, f.path)) {
      counts[key]++;
      matched = true;
      break;
    }
  }
  if (!matched) {
    remainingUnclassified.push(f);
  }
});

const totalMatched = files.length - remainingUnclassified.length;
const coverage = Math.round((totalMatched / files.length) * 100);

console.log(`\n=== EXTENDED ARCHETYPES COVERAGE ===`);
console.log(`Total Files: ${files.length}`);
console.log(`Total Classified: ${totalMatched} (${coverage}%)`);
console.log(`Remaining Freeform: ${remainingUnclassified.length}`);

console.log('\nArchetype breakdown:');
Object.entries(counts).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  - ${cat.padEnd(20)}: ${count.toString().padStart(3)} files`);
});

if (remainingUnclassified.length > 0) {
  console.log('\nRemaining unclassified files:');
  remainingUnclassified.forEach(f => console.log('  ', f.path.split('packages/core/src/')[1]));
}
