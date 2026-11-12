/**
 * The architecture tier standard, as data. One source for the classifier, the import checker and
 * the /architecture views. Rules and reasons: docs/architecture/2026-11-01-architectural-hierarchy-and-archetypes.md
 *
 * A file's tier comes from where it lives (FOLDER_RULES), or from an explicit PLACEMENTS entry
 * when the folder doesn't say (mostly lib/ and logic/). A placement is a finding in its own right:
 * `home` is where the file should move so its folder states its tier.
 */

export const TIERS = {
  T0: { rank: 0, key: 'TIER_0_SCHEMA', name: 'Tier 0: Contracts', icon: '📜' },
  T1: { rank: 1, key: 'TIER_1_PORT', name: 'Tier 1: Ports', icon: '🔌' },
  T2: { rank: 2, key: 'TIER_2_LOGIC', name: 'Tier 2: Domain', icon: '⚙️' },
  T3: { rank: 3, key: 'TIER_3_ADAPTER', name: 'Tier 3: Adapters', icon: '💾' },
  C: { rank: 3.5, key: 'TIER_C_COMPOSITION', name: 'Composition root', icon: '🧩' },
  T4: { rank: 4, key: 'TIER_4_STORE', name: 'Tier 4: State', icon: '📦' },
  T5: { rank: 5, key: 'TIER_5_HOOK', name: 'Tier 5: Application hooks', icon: '🪝' },
  T6: { rank: 6, key: 'TIER_6_UI', name: 'Tier 6: Presentation', icon: '🎨' },
  UNPLACED: { rank: -1, key: 'UNPLACED', name: 'No tier', icon: '❓' },
};

/** Which tiers each tier may import at runtime. `import type` of Tier 0 is allowed everywhere. */
export const ALLOWED = {
  T0: ['T0'],
  T1: ['T0'],
  T2: ['T0', 'T2'],
  T3: ['T0', 'T1', 'T2', 'T3'],
  C: ['T0', 'T1', 'T2', 'T3', 'C'],
  T4: ['T0', 'T1', 'T2', 'C'],
  T5: ['T0', 'T2', 'T4', 'T5'],
  T6: ['T0', 'T5', 'T6'],
};

/** Outside packages a tier may not use: the bedrock and the domain stay free of I/O and React. */
export const FORBIDDEN_PACKAGES = {
  T0: [/^react/, /^expo/, /^zustand/, /^xstate/, /supabase/, /powersync/, /mmkv/, /drizzle/],
  T1: [/^react/, /^expo/, /^zustand/, /^xstate/, /supabase/, /powersync/, /mmkv/, /drizzle/],
  T2: [/^react/, /^expo/, /^zustand/, /^xstate/, /supabase/, /powersync/, /mmkv/, /drizzle/],
  T3: [/^react($|-dom)/],
  T4: [/supabase/, /powersync/, /mmkv/, /drizzle/],
  T5: [/supabase/, /powersync/, /mmkv/, /drizzle/],
  T6: [/supabase/, /powersync/, /mmkv/, /drizzle/, /^zustand/],
};

/**
 * A vendor's React binding over an adapter (PowerSync's useQuery, a live Supabase channel): the
 * adapter's reactive face. Named `*.react.ts`, it is still Tier 3 and may use React, nothing else changes.
 */
export const REACT_BINDING = /\.react\.tsx?$/;

/** Untrusted input is decoded once, at the boundary (adapters); tiers above receive typed data. */
export const PARSE_ALLOWED_IN = ['T0', 'T3', 'C'];

/** Ordered: first match wins. Paths are repo-relative. */
export const FOLDER_RULES = [
  // The generated database contract (ZModel types and Zod factories): the bedrock of the bedrock.
  ['packages/schema/src/', 'T0'],
  ['packages/core/src/types/', 'T0'],
  ['packages/core/src/logic/schemas/', 'T0'],
  ['packages/core/src/constants/', 'T0'],
  ['packages/core/src/store/types/', 'T0'],
  // Journey definitions are declarative data checked by types/FlowDAG.ts; the rest of flows/ is logic.
  [/^packages\/core\/src\/flows\/.*\.flow\.ts$/, 'T0'],
  ['packages/core/src/flows/', 'T2'],
  ['packages/core/src/effect/Errors.ts', 'T0'],
  ['packages/core/src/logic/ports/', 'T1'],
  ['packages/core/src/logic/interfaces/', 'T1'],
  ['packages/core/src/effect/AppRuntime.ts', 'C'],
  ['packages/core/src/effect/Layers.ts', 'C'],
  ['packages/core/src/effect/bindings.ts', 'C'],
  ['packages/core/src/effect/bindings/', 'C'],
  // Promise bridges onto the app runtime (runEffect, fireAndForgetEffect): part of the root.
  ['packages/core/src/effect/Runtime.ts', 'C'],
  ['packages/core/src/adapters/', 'T3'],
  ['packages/core/src/platform/drivers/', 'T3'],
  ['packages/core/src/native/', 'T3'],
  ['packages/core/src/monitoring/', 'T3'],
  ['packages/core/src/store/', 'T4'],
  ['packages/core/src/hooks/', 'T5'],
  [/^packages\/core\/src\/logic\/.*\/hooks\//, 'T5'],
  ['packages/core/src/logic/', 'T2'],
  ['packages/ui/src/', 'T6'],
];

/**
 * Files whose name and folder can't state their tier. Each says what the file is and its tier.
 * Prefer a name suffix from NAME_RULES; an entry here is a last resort.
 */
export const PLACEMENTS = {};

/**
 * The tier a file's name declares, from the naming taxonomy in AGENTS.md. A feature module (lib/sync,
 * verger, spatial ...) keeps its files together; each file says what it is by its name.
 * Tests and declaration files are not tiered.
 */
export const NAME_RULES = [
  [/\.(schema|types|contract)\.tsx?$|\/types\.ts$/, 'T0'],
  [/\.port\.ts$|\.tags\.ts$/, 'T1'],
  [/\.adapter(\.(native|web|ios|android))?\.tsx?$|(Driver|Monitor|Sink|Vault)\.ts$/, 'T3'],
  [/\/use\w*Store\.ts$|\.store\.ts$|\.slice\.ts$|\.machine\.ts$/, 'T4'],
  [/\/use[A-Z]\w*\.tsx?$/, 'T5'],
  [/\.tsx$/, 'T6'],
];

/**
 * Folders that say only "domain" in general: a file's name (`*.adapter.ts`, `*.store.ts` ...) decides
 * its tier there, and a plain name is Tier 2.
 */
const GENERIC_FOLDERS = ['packages/core/src/logic/', 'packages/core/src/flows/'];

/** Packages whose untiered files default to Tier 2 (pure logic) until their names say otherwise. */
const DEFAULT_T2_ROOTS = ['packages/core/src/'];

/** The pre-v1 client: being retired, not fixed. Nothing live may import it (rule imports-retired). */
export const RETIRED = [/^packages\/core\/src\/api\/(?!v1\/)/];

export function tierOf(filePath) {
  if (RETIRED.some((re) => re.test(filePath))) return 'RETIRED';
  const placed = PLACEMENTS[filePath];
  if (placed) return placed.tier;
  // Explicit tier folders first: types/, logic/ports/, adapters/, store/, hooks/ mean what they say.
  for (const [rule, tier] of FOLDER_RULES) {
    if (GENERIC_FOLDERS.includes(rule)) continue;
    if (typeof rule === 'string' ? filePath.startsWith(rule) : rule.test(filePath)) return tier;
  }
  if (/(__tests__|__mocks__)\/|\.(test|spec)\.tsx?$|\.d\.ts$|^packages\/core\/src\/testing\//.test(filePath)) return 'UNPLACED';
  // Then the name; logic/ and module folders are judged by what each file says it is.
  if (DEFAULT_T2_ROOTS.some((root) => filePath.startsWith(root))) {
    for (const [rule, tier] of NAME_RULES) if (rule.test(filePath)) return tier;
    return 'T2';
  }
  return 'UNPLACED';
}
