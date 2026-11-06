import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('apps/gurudevi-web/app/(sanctuary)/architecture/architectureData.json', 'utf8'));

// Define the 7 Architectural Archetypes
export const ARCHETYPES = {
  TIER_0_SCHEMA: { rank: 0, name: 'Tier 0: Contract / Schema / Type', icon: '📜' },
  TIER_1_PORT:   { rank: 1, name: 'Tier 1: Port / Interface',         icon: '🔌' },
  TIER_2_LOGIC:  { rank: 2, name: 'Tier 2: Pure Domain Logic',        icon: '⚙️' },
  TIER_3_ADAPTER:{ rank: 3, name: 'Tier 3: Adapter / Infra / Storage',icon: '💾' },
  TIER_4_STORE:  { rank: 4, name: 'Tier 4: State Store (Zustand)',    icon: '📦' },
  TIER_5_HOOK:   { rank: 5, name: 'Tier 5: Application Facade / Hook',icon: '🪝' },
  TIER_6_UI:     { rank: 6, name: 'Tier 6: Presentation UI',          icon: '🎨' },
};

export function classifyArchetype(path) {
  const p = path.toLowerCase();
  
  // UI Presentation
  if (p.includes('/components/') || p.endsWith('.tsx') || p.includes('/icons') || p.includes('/primitives')) {
    if (p.includes('guard') || p.includes('prompt') || p.includes('button') || p.includes('spinner') || p.includes('text') || p.includes('view') || p.includes('pressable') || p.includes('/ui/')) {
      return 'TIER_6_UI';
    }
  }

  // Application Facades & Hooks
  if (p.includes('/hooks/') || p.startsWith('use') || p.includes('/usesanctuaryfeature')) {
    return 'TIER_5_HOOK';
  }

  // State Stores
  if (p.includes('/store/') || p.includes('store.ts') || p.includes('.slice.ts') || p.includes('scopesession.ts')) {
    if (p.includes('/types/')) return 'TIER_0_SCHEMA';
    return 'TIER_4_STORE';
  }

  // Adapters / Storage implementations
  if (p.includes('/adapters/') || p.includes('.adapter.') || p.includes('/powersync/') || p.includes('supabaseclient') || p.includes('storage.ts') || p.includes('storagewrapper') || p.includes('authstorage') || p.includes('scopedstatestorage') || p.includes('authprofilestorage') || p.includes('localguestsession') || p.includes('guestscope')) {
    if (p.includes('schema.ts')) return 'TIER_0_SCHEMA';
    return 'TIER_3_ADAPTER';
  }

  // Ports & Interfaces
  if (p.includes('.port.') || p.includes('/ports/') || p.includes('/interfaces/')) {
    return 'TIER_1_PORT';
  }

  // Pure Domain Logic / Manifests / Evaluators
  if (p.includes('/registry/') || p.includes('sanctuaryfeature.ts') || p.includes('bondscope.ts') || p.includes('signature.ts') || p.includes('accesscontext.ts') || p.includes('baselinecapabilities.ts') || p.includes('edloveuuidv8.ts') || p.includes('networkmanager') || p.includes('featureflag.factory') || p.includes('experiencestate') || p.includes('transportsecurity') || p.includes('breadcrumbs') || p.includes('eventbus') || p.includes('runtimeregistry')) {
    return 'TIER_2_LOGIC';
  }

  // Contracts / Schemas / Types
  if (p.includes('.schema.') || p.includes('/schemas/') || p.includes('/types/') || p.includes('/constants/') || p.includes('srilankanschools')) {
    return 'TIER_0_SCHEMA';
  }

  return 'TIER_2_LOGIC'; // fallback
}

// Group files by Archetype
const groups = {};
Object.keys(ARCHETYPES).forEach(k => groups[k] = []);

const fileMap = new Map();

data.layerBreakdown.forEach(l => {
  l.files.forEach(f => {
    const arch = classifyArchetype(f.path);
    const item = { ...f, topologicalLayer: l.layer, archetype: arch };
    fileMap.set(f.path, item);
    groups[arch].push(item);
  });
});

console.log('=== ARCHITECTURAL ARCHETYPES BREAKDOWN (79 files) ===');
Object.entries(ARCHETYPES).forEach(([key, meta]) => {
  const files = groups[key];
  console.log(`\n${meta.icon} ${meta.name} (${files.length} files):`);
  files.forEach(f => {
    const name = f.path.split('/').pop();
    console.log(`   - [${name}] Topo-L${f.topologicalLayer} | ${f.path}`);
  });
});
