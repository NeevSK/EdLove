import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');
const REPORT_PATH = path.join(REPO_ROOT, 'reports/canonical-file-types-audit.json');

export const CANONICAL_ARCHETYPES = {
  // ── CORE 12 ARCHETYPES ────────────────────────────────────────────────────
  SCHEMA: {
    tier: 0,
    name: 'Schema',
    suffix: '.schema.ts',
    description: 'Runtime data validation and Zod contracts',
    matcher: (n, p) => n.includes('.schema.') || p.includes('/schemas/'),
  },
  TYPE: {
    tier: 0,
    name: 'Type Definition',
    suffix: '.types.ts | types/*.ts',
    description: 'Compile-time pure TypeScript interfaces and types',
    matcher: (n, p) => p.includes('/types/') || n.endsWith('.types.ts') || n.endsWith('.d.ts'),
  },
  PORT: {
    tier: 1,
    name: 'Port / Interface',
    suffix: '.port.ts | interfaces/*.ts',
    description: 'Abstract boundary contracts for Dependency Inversion',
    matcher: (n, p) => n.includes('.port.') || p.includes('/ports/') || p.includes('/interfaces/'),
  },
  DOMAIN_ENTITY: {
    tier: 2,
    name: 'Entity / Domain Logic',
    suffix: '*.ts in logic/ or domain/',
    description: 'Pure business invariants, rules, and algorithms',
    matcher: (n, p) => (p.includes('/logic/') || p.includes('/domain/') || p.includes('/educational/') || p.includes('/thresholds/')) && !n.startsWith('use') && !n.includes('.schema.') && !n.includes('.port.') && !n.includes('.adapter.'),
  },
  DOMAIN_SERVICE: {
    tier: 2,
    name: 'Domain Service',
    suffix: '*Service.ts',
    description: 'Stateless domain coordinators',
    matcher: (n, p) => n.includes('Service') || n.includes('service'),
  },
  ADAPTER: {
    tier: 3,
    name: 'Adapter',
    suffix: '.adapter.ts | *Adapter.ts',
    description: 'Concrete implementation of ports binding to external technologies',
    matcher: (n, p) => n.includes('.adapter.') || n.includes('Adapter') || (p.includes('/adapters/') && !n.includes('schema') && !n.includes('Repository')) || p.includes('cloudinary') || p.includes('inngest') || p.includes('resend'),
  },
  REPOSITORY: {
    tier: 3,
    name: 'Repository',
    suffix: '*Repository.ts',
    description: 'Data access and persistence mapping for domain aggregates',
    matcher: (n, p) => n.includes('Repository') || n.includes('repository'),
  },
  STORE: {
    tier: 4,
    name: 'Store',
    suffix: 'use*Store.ts | *Store.ts',
    description: 'Reactive client state container (Zustand)',
    matcher: (n, p) => (n.includes('Store') || n.includes('store') || p.includes('/store/')) && !n.includes('/types/') && !n.includes('.slice.'),
  },
  SLICE: {
    tier: 4,
    name: 'Slice',
    suffix: '.slice.ts',
    description: 'Sub-partition of composite store state and actions',
    matcher: (n, p) => n.includes('.slice.'),
  },
  HOOK: {
    tier: 5,
    name: 'Hook',
    suffix: 'use*.ts | use*.tsx',
    description: 'React lifecycle facade connecting UI to state and services',
    matcher: (n, p) => n.startsWith('use') || p.includes('/hooks/'),
  },
  FLOW: {
    tier: 5,
    name: 'Flow / Coordinator',
    suffix: '.flow.ts | *Coordinator.ts',
    description: 'Multi-step transactional saga or user journey',
    matcher: (n, p) => n.includes('.flow.') || n.includes('Coordinator') || n.includes('coordinator') || p.includes('/flows/') || p.includes('/accounts/'),
  },
  BARREL: {
    tier: -1,
    name: 'Barrel / Index',
    suffix: 'index.ts | index.tsx',
    description: 'Public boundary export catalog',
    matcher: (n, p) => n === 'index.ts' || n === 'index.tsx',
  },

  // ── SPECIALIZED CROSS-CUTTING SUBSYSTEMS (The Pareto 20%) ──────────────────
  SYNC_ENGINE: {
    tier: 3,
    name: 'Sync Engine & Outbox',
    suffix: 'lib/sync/*.ts',
    description: 'Offline-first outbox, deltas, receipts, and mutation replay engine',
    matcher: (n, p) => p.includes('/lib/sync/'),
  },
  STORAGE_DRIVER: {
    tier: 3,
    name: 'Storage Driver',
    suffix: '*Storage.ts | guestScope.ts',
    description: 'Low-level persistence drivers and key resolvers (MMKV, local session)',
    matcher: (n, p) => (n.includes('Storage') || n.includes('storage') || n.includes('guestScope') || n.includes('localGuestSession') || n.includes('guestLease') || n.includes('guestConversion')) && !n.includes('Store'),
  },
  TELEMETRY: {
    tier: 3,
    name: 'Telemetry & Observability',
    suffix: 'monitoring/*.ts',
    description: 'Crash reporting (Sentry), events (PostHog), breadcrumbs, and safe telemetry',
    matcher: (n, p) => p.includes('/monitoring/') || n.includes('breadcrumbs') || n.includes('posthog') || n.includes('sentry') || n.includes('audit-log'),
  },
  RESILIENCE_EFFECT: {
    tier: 2,
    name: 'Resilience & Effect Runtime',
    suffix: 'effect/*.ts | circuit-breaker.ts',
    description: 'Composable fiber concurrency, retry schedules, and circuit breakers',
    matcher: (n, p) => p.includes('/effect/') || n.includes('circuit-breaker') || n.includes('retry') || n.includes('backoff') || n.includes('resilience'),
  },
  PROVIDER: {
    tier: 5,
    name: 'React Context Provider',
    suffix: '*Provider.tsx',
    description: 'React tree dependency injection and capability hydration roots',
    matcher: (n, p) => n.endsWith('Provider.tsx') || p.includes('/providers/'),
  },
  MATH_SPATIAL: {
    tier: 0,
    name: 'Static Geometry & Constants',
    suffix: 'spatial/*.ts | constants/*.ts',
    description: 'Static geo-spatial coordinates, centroids, and school registries',
    matcher: (n, p) => p.includes('/spatial/') || p.includes('/constants/') || n.includes('geoMath') || n.includes('Schools'),
  },
};

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

export function runCanonicalFileTypesAudit() {
  const files = walk(CORE_SRC);
  const archetypeCounts = {};
  const classifiedFiles = [];
  const unclassified = [];

  Object.keys(CANONICAL_ARCHETYPES).forEach(k => archetypeCounts[k] = 0);

  files.forEach(f => {
    let matchedKey = null;

    // Check each archetype matcher in precedence order
    for (const [key, meta] of Object.entries(CANONICAL_ARCHETYPES)) {
      if (meta.matcher(f.name, f.path)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      archetypeCounts[matchedKey]++;
      classifiedFiles.push({
        path: f.path,
        name: f.name,
        archetype: matchedKey,
        tier: CANONICAL_ARCHETYPES[matchedKey].tier,
        typeName: CANONICAL_ARCHETYPES[matchedKey].name,
      });
    } else {
      unclassified.push(f);
    }
  });

  const summary = Object.entries(CANONICAL_ARCHETYPES).map(([key, meta]) => ({
    key,
    name: meta.name,
    tier: meta.tier,
    suffix: meta.suffix,
    description: meta.description,
    count: archetypeCounts[key],
  }));

  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    classifiedCount: classifiedFiles.length,
    unclassifiedCount: unclassified.length,
    percentage: Math.round((classifiedFiles.length / files.length) * 100),
    summary,
    unclassifiedSample: unclassified.slice(0, 30).map(f => f.path.split('packages/core/src/')[1]),
    unclassifiedTotalCount: unclassified.length,
    paretoBreakdown: {
      libCount: unclassified.filter(f => f.path.includes('/lib/')).length,
      nativeCount: unclassified.filter(f => f.path.includes('/native/')).length,
      vergerCount: unclassified.filter(f => f.path.includes('/verger/')).length,
      otherCount: unclassified.filter(f => !f.path.includes('/lib/') && !f.path.includes('/native/') && !f.path.includes('/verger/')).length,
    },
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`✅ Canonical File Types Audit Complete! Saved to: ${REPORT_PATH}`);
  console.log(`   - Total Files Audited: ${files.length}`);
  console.log(`   - Classified into Archetypes: ${classifiedFiles.length} (${report.percentage}%)`);
  console.log(`   - Remaining Freeform / Junk-Drawer: ${unclassified.length}`);
  console.log(`     • lib/ remaining: ${report.paretoBreakdown.libCount}`);
  console.log(`     • native/ remaining: ${report.paretoBreakdown.nativeCount}`);
  console.log(`     • verger/ remaining: ${report.paretoBreakdown.vergerCount}`);

  return report;
}

if (process.argv[1]?.endsWith('audit-canonical-file-types.mjs')) {
  runCanonicalFileTypesAudit();
}
