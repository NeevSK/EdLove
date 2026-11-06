import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const ARCH_DATA_PATH = path.join(REPO_ROOT, 'apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json');
const REPORT_PATH = path.join(REPO_ROOT, 'reports/archetype-hierarchy-audit.json');

// Canonical 7-Tier Archetypes
export const ARCHETYPES = {
  TIER_0_SCHEMA: { rank: 0, name: 'Tier 0: Contract / Schema / Type', icon: '📜', description: 'Pure data contracts, Zod schemas, TypeScript types, and constants' },
  TIER_1_PORT:   { rank: 1, name: 'Tier 1: Port / Boundary Interface', icon: '🔌', description: 'Abstract interfaces defining external capabilities for DIP' },
  TIER_2_LOGIC:  { rank: 2, name: 'Tier 2: Pure Domain Logic', icon: '⚙️', description: 'Deterministic business evaluators, manifests, and pure calculators' },
  TIER_3_ADAPTER:{ rank: 3, name: 'Tier 3: Adapter / Infra / Storage', icon: '💾', description: 'Concrete implementations of ports (PowerSync, Supabase, SQLite, MMKV)' },
  TIER_4_STORE:  { rank: 4, name: 'Tier 4: State Store (Zustand)', icon: '📦', description: 'Reactive client state containers and snapshot selectors' },
  TIER_5_HOOK:   { rank: 5, name: 'Tier 5: Application Facade / Hook', icon: '🪝', description: 'High-level hooks orchestrating multiple stores for client UI' },
  TIER_6_UI:     { rank: 6, name: 'Tier 6: Presentation UI', icon: '🎨', description: 'User-facing components, prompts, action buttons, and guards' },
};

export function classifyArchetype(filePath) {
  const p = filePath.toLowerCase();

  // Tier 6: UI Presentation
  if (p.includes('/components/') || p.endsWith('.tsx') || p.includes('/icons') || p.includes('/primitives')) {
    if (p.includes('guard') || p.includes('prompt') || p.includes('button') || p.includes('spinner') || p.includes('text') || p.includes('view') || p.includes('pressable') || p.includes('/ui/')) {
      return 'TIER_6_UI';
    }
  }

  // Tier 5: Application Facades & Hooks
  if (p.includes('/hooks/') || p.startsWith('use') || p.includes('/usesanctuaryfeature')) {
    return 'TIER_5_HOOK';
  }

  // Tier 4: State Stores
  if (p.includes('/store/') || p.includes('store.ts') || p.includes('.slice.ts') || p.includes('scopesession.ts')) {
    if (p.includes('/types/')) return 'TIER_0_SCHEMA';
    return 'TIER_4_STORE';
  }

  // Tier 3: Adapters / Storage implementations
  if (p.includes('/adapters/') || p.includes('.adapter.') || p.includes('/powersync/') || p.includes('supabaseclient') || p.includes('storage.ts') || p.includes('storagewrapper') || p.includes('authstorage') || p.includes('scopedstatestorage') || p.includes('authprofilestorage') || p.includes('localguestsession') || p.includes('guestscope')) {
    if (p.includes('schema.ts')) return 'TIER_0_SCHEMA';
    return 'TIER_3_ADAPTER';
  }

  // Tier 1: Ports & Boundary Interfaces
  if (p.includes('.port.') || p.includes('/ports/') || p.includes('/interfaces/')) {
    return 'TIER_1_PORT';
  }

  // Tier 2: Pure Domain Logic
  if (p.includes('/registry/') || p.includes('sanctuaryfeature.ts') || p.includes('bondscope.ts') || p.includes('signature.ts') || p.includes('accesscontext.ts') || p.includes('baselinecapabilities.ts') || p.includes('edloveuuidv8.ts') || p.includes('networkmanager') || p.includes('featureflag.factory') || p.includes('experiencestate') || p.includes('transportsecurity') || p.includes('breadcrumbs') || p.includes('eventbus') || p.includes('runtimeregistry')) {
    return 'TIER_2_LOGIC';
  }

  // Tier 0: Contracts & Schemas
  if (p.includes('.schema.') || p.includes('/schemas/') || p.includes('/types/') || p.includes('/constants/') || p.includes('srilankanschools')) {
    return 'TIER_0_SCHEMA';
  }

  return 'TIER_2_LOGIC';
}

export function runArchetypeHierarchyAudit() {
  const data = JSON.parse(fs.readFileSync(ARCH_DATA_PATH, 'utf8'));

  const fileMap = new Map();
  const tierGroups = {
    TIER_0_SCHEMA: [],
    TIER_1_PORT: [],
    TIER_2_LOGIC: [],
    TIER_3_ADAPTER: [],
    TIER_4_STORE: [],
    TIER_5_HOOK: [],
    TIER_6_UI: [],
  };

  data.layerBreakdown.forEach(l => {
    l.files.forEach(f => {
      const archKey = classifyArchetype(f.path);
      const meta = ARCHETYPES[archKey];
      const entry = {
        path: f.path,
        name: f.path.split('/').pop(),
        loc: f.loc,
        topologicalLayer: l.layer,
        archetypeKey: archKey,
        archetypeName: meta.name,
        rank: meta.rank,
        icon: meta.icon,
      };
      fileMap.set(f.path, entry);
      tierGroups[archKey].push(entry);
    });
  });

  const violations = {
    adapterCoupling: [],
    schemaRuntimeInHook: [],
    chainBypasses: [],
  };

  data.edges.forEach(e => {
    const source = fileMap.get(e.from);
    const target = fileMap.get(e.to);
    if (!source || !target) return;

    // 1. Adapter Direct Coupling (Store/Logic directly importing concrete Adapter)
    if (target.archetypeKey === 'TIER_3_ADAPTER' && source.archetypeKey !== 'TIER_3_ADAPTER') {
      violations.adapterCoupling.push({
        sourceFile: source.name,
        sourcePath: source.path,
        sourceTier: source.archetypeName,
        targetFile: target.name,
        targetPath: target.path,
        targetTier: target.archetypeName,
        symbols: e.symbols,
        isTypeOnly: Boolean(e.isTypeOnly),
      });
    }

    // 2. Runtime Schema Parsing in Hook
    if (source.archetypeKey === 'TIER_5_HOOK' && target.archetypeKey === 'TIER_0_SCHEMA') {
      const runtimeSchemas = e.symbols.filter(s => s.endsWith('Schema'));
      if (!e.isTypeOnly && runtimeSchemas.length > 0) {
        violations.schemaRuntimeInHook.push({
          hookFile: source.name,
          hookPath: source.path,
          schemaFile: target.name,
          schemaPath: target.path,
          symbols: runtimeSchemas,
        });
      }
    }

    // 3. Chain Bypass (Hook calling Port directly)
    if (source.archetypeKey === 'TIER_5_HOOK' && target.archetypeKey === 'TIER_1_PORT') {
      violations.chainBypasses.push({
        hookFile: source.name,
        hookPath: source.path,
        portFile: target.name,
        portPath: target.path,
        symbols: e.symbols,
      });
    }
  });

  const tiersSummary = Object.entries(ARCHETYPES).map(([key, meta]) => {
    const files = tierGroups[key];
    const totalLoc = files.reduce((acc, f) => acc + f.loc, 0);
    const minTopo = files.length > 0 ? Math.min(...files.map(f => f.topologicalLayer)) : 0;
    const maxTopo = files.length > 0 ? Math.max(...files.map(f => f.topologicalLayer)) : 0;
    return {
      tierKey: key,
      rank: meta.rank,
      name: meta.name,
      icon: meta.icon,
      description: meta.description,
      fileCount: files.length,
      totalLoc,
      topologicalSpan: `L${minTopo}..L${maxTopo}`,
      files,
    };
  });

  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: data.totalFiles,
    totalEdges: data.totalEdges,
    tiersSummary,
    violations: {
      adapterCouplingCount: violations.adapterCoupling.length,
      adapterCoupling: violations.adapterCoupling,
      schemaRuntimeInHookCount: violations.schemaRuntimeInHook.length,
      schemaRuntimeInHook: violations.schemaRuntimeInHook,
      chainBypassesCount: violations.chainBypasses.length,
      chainBypasses: violations.chainBypasses,
    },
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log(`✅ Archetype Hierarchy Audit Complete! Report saved to: ${REPORT_PATH}`);
  console.log(`   - Tiers: 7`);
  console.log(`   - Adapter Coupling Violations: ${violations.adapterCoupling.length}`);
  console.log(`   - Schema Runtime In Hook: ${violations.schemaRuntimeInHook.length}`);
  console.log(`   - Chain Bypasses (Hook->Port): ${violations.chainBypasses.length}`);

  return report;
}

if (process.argv[1]?.endsWith('audit-archetype-hierarchy.mjs')) {
  runArchetypeHierarchyAudit();
}
