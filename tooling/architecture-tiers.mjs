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
  C: ['T0', 'T1', 'T2', 'T3'],
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

/** Untrusted input is decoded once, at the boundary (adapters); tiers above receive typed data. */
export const PARSE_ALLOWED_IN = ['T0', 'T3', 'C'];

/** Ordered: first match wins. Paths are repo-relative. */
export const FOLDER_RULES = [
  ['packages/core/src/types/', 'T0'],
  ['packages/core/src/logic/schemas/', 'T0'],
  ['packages/core/src/constants/', 'T0'],
  ['packages/core/src/store/types/', 'T0'],
  ['packages/core/src/effect/Errors.ts', 'T0'],
  ['packages/core/src/logic/ports/', 'T1'],
  ['packages/core/src/logic/interfaces/', 'T1'],
  ['packages/core/src/effect/AppRuntime.ts', 'C'],
  ['packages/core/src/effect/Layers.ts', 'C'],
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
 * Files whose folder doesn't state their tier. Each says what the file is, its tier, and its
 * proper home. Remove an entry once the file has moved.
 */
export const PLACEMENTS = {
  'packages/core/src/logic/utils/edloveUuidV8.ts': {
    tier: 'T0',
    home: 'packages/core/src/logic/schemas/',
    why: 'The account ID format check that identity.schema.ts is built on; a contract primitive',
  },
  'packages/core/src/lib/accountScope.ts': {
    tier: 'T2',
    home: 'packages/core/src/logic/accounts/',
    why: 'Pure derivation of account-scoped keys, no imports',
  },
  'packages/core/src/lib/featureRolloutSnapshot.ts': {
    tier: 'T2',
    home: 'packages/core/src/logic/registry/',
    why: 'Pure: turns a rollout port result into a flag snapshot',
  },
  'packages/core/src/lib/experienceState.ts': {
    tier: 'T4',
    home: 'packages/core/src/store/',
    why: 'A Zustand store with persistence',
  },
  'packages/core/src/lib/storage.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/storage/',
    why: 'Wraps the platform storage driver',
  },
  'packages/core/src/lib/storageWrapper.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/storage/',
    why: 'Zustand persist storage over the storage adapter',
  },
  'packages/core/src/lib/authStorage.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/storage/',
    why: 'Reads and writes auth records in storage',
  },
  'packages/core/src/lib/scopedStateStorage.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/storage/',
    why: 'Account-scoped persist storage',
  },
  'packages/core/src/lib/authProfileStorage.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/storage/',
    why: 'Persists the auth profile',
  },
  'packages/core/src/lib/devicePreferences.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/storage/',
    why: 'Device preference records in storage',
  },
  'packages/core/src/lib/sync/eventBus.ts': {
    tier: 'T3',
    home: 'packages/core/src/adapters/events/',
    why: 'In-process pub/sub runtime',
  },
  'packages/core/src/lib/security/transportSecurity.ts': {
    tier: 'T3',
    home: 'packages/core/src/platform/drivers/',
    why: 'Guards and performs network fetches',
  },
  'packages/core/src/logic/permissions/signature.ts': {
    tier: 'T3',
    home: 'packages/core/src/platform/drivers/cryptoVault',
    why: 'Verifies signatures with the platform WebCrypto API, which is I/O',
  },
};

export function tierOf(filePath) {
  const placed = PLACEMENTS[filePath];
  if (placed) return placed.tier;
  for (const [rule, tier] of FOLDER_RULES) {
    if (typeof rule === 'string' ? filePath.startsWith(rule) : rule.test(filePath)) return tier;
  }
  return 'UNPLACED';
}
