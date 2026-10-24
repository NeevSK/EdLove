import {
  ACTIVATION_PRESETS,
  type CapacityFacts,
  experienceOf,
  type GovernorEvent,
  GURUDEVI_LEVERS,
  resolveActivation,
  UNKNOWN_CAPACITY,
  VERGER_POLICY,
} from '@repo/core/governor';
import type { SensoryPreferences } from '@repo/ui/context/experiencePolicy';
import type { FidelityLevel, NetworkQuality, RealityState } from '@repo/ui/context/types';
import { resolveVisualCapabilities } from '@repo/ui/context/visualPolicy';
import { applyVisualSafeMode } from '@repo/ui/context/visualSafety';
import { describe, expect, it } from 'vitest';

/**
 * The drift test (pipeline phase E2): the old governor is the differential oracle for verger.
 * Every input the old governor distinguishes is enumerated (a finite domain, so exhaustively,
 * not by sampling); each is fed to both, verger's levels are read through Gurudevi's view, and
 * every field that differs must be named below with its reason. An unnamed difference fails:
 * moving consumers to verger may change behaviour only on purpose.
 */

const GB = 1024 ** 3;
const TIERS = { low: 2 * GB, medium: 4 * GB, high: 8 * GB } as const;
type Tier = keyof typeof TIERS;
const FIDELITY: readonly FidelityLevel[] = ['auto', 'low', 'high'];
const NETWORK: readonly NetworkQuality[] = ['excellent', 'good', 'fair', 'poor', 'offline'];
const BOOL = [false, true] as const;

interface Case {
  readonly tier: Tier;
  readonly fidelity: FidelityLevel;
  readonly saver: boolean;
  readonly reduceMotion: boolean;
  readonly network: NetworkQuality;
  readonly sound: boolean;
  readonly haptics: boolean;
  readonly quiet: boolean;
  readonly safe: boolean;
}

function* cases(): Generator<Case> {
  for (const tier of Object.keys(TIERS) as Tier[])
    for (const fidelity of FIDELITY)
      for (const saver of BOOL)
        for (const reduceMotion of BOOL)
          for (const network of NETWORK)
            for (const sound of BOOL)
              for (const haptics of BOOL)
                for (const quiet of BOOL)
                  for (const safe of BOOL)
                    yield { tier, fidelity, saver, reduceMotion, network, sound, haptics, quiet, safe };
}

/** The old governor, as RealityProvider and collectRealitySignals feed it. */
function oldGovernor(c: Case) {
  const reality: RealityState = {
    deviceTier: c.tier,
    totalMemoryGB: TIERS[c.tier] / GB,
    networkQuality: c.network,
    // collectRealitySignals' rule: data saver is inferred from a poor or absent network.
    isDataSaverMode: c.network === 'poor' || c.network === 'offline',
    isBatterySaverMode: c.saver,
    isReducedMotionEnabled: c.reduceMotion,
  };
  const preferences: SensoryPreferences = {
    soundEnabled: c.sound,
    hapticsEnabled: c.haptics,
    quietMode: c.quiet,
  };
  // The old safe mode reads a global; set it for this case only.
  const previous = globalThis.__GURUDEVI_VISUAL_SAFE_MODE__;
  globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = c.safe;
  try {
    return applyVisualSafeMode(resolveVisualCapabilities(reality, c.fidelity, preferences));
  } finally {
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ = previous;
  }
}

/** The network the old governor's quality stands for, as the platform would report it. */
function networkEvent(quality: NetworkQuality, at: number): GovernorEvent {
  const base = { type: 'network' as const, at, validated: true, metered: true, dataSaver: 'disabled' as const };
  switch (quality) {
    case 'offline':
      return { ...base, transport: 'none', validated: false, downKbps: null };
    case 'poor':
      return { ...base, transport: 'cellular', downKbps: 128 };
    case 'fair':
      return { ...base, transport: 'cellular', downKbps: 512 };
    case 'good':
      return { ...base, transport: 'cellular', downKbps: 8192 };
    case 'excellent':
      return { ...base, transport: 'wifi', metered: false, downKbps: 32768 };
  }
}

/**
 * Verger's open-loop decision on the same knowledge: Gurudevi's levers under the `static`
 * preset, hearing power and network (verger senses both natively when it runs).
 */
function verger(c: Case) {
  const capacity: CapacityFacts = { ...UNKNOWN_CAPACITY, totalMemoryBytes: TIERS[c.tier] };
  const activation = resolveActivation(ACTIVATION_PRESETS.static, { sense: { network: true } });
  let state = VERGER_POLICY.create({ at: 0, levers: GURUDEVI_LEVERS, capacity, activation, hardware: false });
  const events: GovernorEvent[] = [
    { type: 'app-state', at: 1, state: 'active' },
    { type: 'preferences', at: 2, reduceMotion: c.reduceMotion, fidelity: c.fidelity },
    { type: 'power', at: 3, saver: c.saver },
    networkEvent(c.network, 4),
  ];
  for (const event of events) state = VERGER_POLICY.reduce(state, event);
  return experienceOf(VERGER_POLICY.snapshot(state), {
    fidelity: c.fidelity,
    deviceTier: c.tier,
    soundEnabled: c.sound,
    hapticsEnabled: c.haptics,
    quietMode: c.quiet,
    safeMode: c.safe,
  });
}

function flatten(value: object, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    if (v !== null && typeof v === 'object') Object.assign(out, flatten(v, `${prefix}${key}.`));
    else out[`${prefix}${key}`] = v;
  }
  return out;
}

/**
 * Every intended difference, by cause. `decide`: verger's behaviour differs and the choice is
 * open (a chair, stage-and-chairs.md); the test keeps it visible until it is made.
 */
interface Difference {
  readonly id: string;
  readonly status: 'intended' | 'decide';
  readonly why: string;
  readonly applies: (c: Case) => boolean;
  readonly fields: readonly string[];
}

const AMBIENT_FIELDS = [
  'experience.motion',
  'experience.celebration',
  'experience.maxParticles',
  'maxCelebrationParticles',
] as const;

export const DIFFERENCES: readonly Difference[] = [
  {
    id: 'medium-phone-floor',
    status: 'decide',
    why:
      'The old governor capped 3-6 GB phones at "refined" (no ambient effects, no blur, disk image ' +
      'cache) by class. Verger floors only phones under 3 GB and compresses the rest by ' +
      'measurement while it runs; while it is off a 4 GB phone gets the full experience.',
    applies: (c) => c.tier === 'medium' && c.fidelity === 'auto',
    fields: [
      ...AMBIENT_FIELDS,
      'allowAmbientEffects',
      'allowRichAnimation',
      'allowBlur',
      'quality',
      'experience.visualEffects',
      'imageCachePolicy',
    ],
  },
  {
    id: 'low-fidelity-is-honoured',
    status: 'intended',
    why:
      'The old governor let a high-memory phone stay "rich" in motion and celebration when the ' +
      'user chose low fidelity. Verger takes the user at their word: low fidelity stills ambient ' +
      'levers and reduces the rest one step. Prefetch gets one answer: the old governor stopped ' +
      'it for low fidelity in one field (`shouldPrefetchAssets`) and allowed it in the other.',
    applies: (c) => c.fidelity === 'low',
    fields: [...AMBIENT_FIELDS, 'experience.visualEffects', 'experience.allowAssetPrefetch'],
  },
  {
    id: 'reduce-motion-keeps-blur',
    status: 'intended',
    why:
      'Blur is not motion. The old governor tied blur to rich animation, so reduced motion removed ' +
      'it; verger stops what moves and keeps what is still.',
    applies: (c) => c.reduceMotion,
    fields: ['allowBlur'],
  },
  {
    id: 'battery-saver-stills-ambient',
    status: 'intended',
    why:
      'Under battery saver the old governor slowed ambient motion to "refined"; verger stills it, ' +
      'since an ambient animation is energy spent for nothing the user asked for.',
    applies: (c) => c.saver,
    fields: AMBIENT_FIELDS,
  },
  {
    id: 'battery-saver-stops-prefetch',
    status: 'intended',
    why: 'Prefetch is optional energy work: verger stops it under battery saver; the old governor did not.',
    applies: (c) => c.saver,
    fields: ['experience.allowAssetPrefetch', 'shouldPrefetchAssets'],
  },
  {
    id: 'low-phone-blur-reduced-not-flat',
    status: 'intended',
    why:
      'On a phone under 3 GB verger lowers blur one step (reduced radius, "refined"); the old ' +
      'governor named the level "essential". Both allow no full blur.',
    applies: (c) => c.tier === 'low' && c.fidelity !== 'high',
    fields: ['experience.visualEffects'],
  },
  {
    id: 'inferred-data-saver',
    status: 'decide',
    why:
      'The old governor inferred "data saver" from a poor or absent network and then stopped ' +
      'prefetch and the memory image cache. Verger reads the OS Data Saver and offline; a slow ' +
      'network alone limits nothing, and the daily data budget (B3) is where cost belongs; the ' +
      'image cache is memory, not data, so a network never sets it. Whether slow networks should ' +
      'also stop prefetch is open.',
    applies: (c) => c.network === 'poor' || c.network === 'offline',
    fields: ['experience.allowAssetPrefetch', 'shouldPrefetchAssets', 'imageCachePolicy'],
  },
  {
    id: 'safe-mode-respects-the-user',
    status: 'intended',
    why:
      'The old safe mode set haptics to "essential" even when the user had turned haptics off or ' +
      'chosen quiet mode. An emergency override may take quality away, never add back what the ' +
      'user switched off.',
    applies: (c) => c.safe && (!c.haptics || c.quiet),
    fields: ['experience.haptics'],
  },
];

describe('drift: the old governor against verger (exhaustive)', () => {
  const unexplained = new Map<string, { count: number; example: Case }>();
  const used = new Set<string>();
  let total = 0;
  for (const c of cases()) {
    total += 1;
    const before = flatten(oldGovernor(c));
    const after = flatten(verger(c));
    for (const field of Object.keys(before)) {
      if (before[field] === after[field]) continue;
      const causes = DIFFERENCES.filter((d) => d.applies(c) && d.fields.includes(field));
      for (const d of causes) used.add(d.id);
      if (causes.length > 0) continue;
      const key = `${field}: ${String(before[field])} -> ${String(after[field])}`;
      const seen = unexplained.get(key);
      if (seen) seen.count += 1;
      else unexplained.set(key, { count: 1, example: c });
    }
  }

  it('covers every combination the old governor distinguishes', () => {
    expect(total).toBe(3 * 3 * 2 * 2 * 5 * 2 * 2 * 2 * 2);
  });

  it('every difference has a named cause', () => {
    const report = [...unexplained].map(([key, g]) => `${key} (${g.count}) e.g. ${JSON.stringify(g.example)}`);
    expect(report).toEqual([]);
  });

  it('every named cause still explains something (no stale entries)', () => {
    expect(DIFFERENCES.map((d) => d.id).filter((id) => !used.has(id))).toEqual([]);
  });
});
