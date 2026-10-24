import {
  ACTIVATION_PRESETS,
  type CapacityFacts,
  experienceOf,
  type GovernorEvent,
  GURUDEVI_MOBILE_HOST,
  resolveActivation,
  UNKNOWN_CAPACITY,
  VERGER_POLICY,
} from '@repo/core/governor';
import type { SensoryPreferences } from '@repo/ui/context/experiencePolicy';
import type { FidelityLevel, NetworkQuality, RealityState } from '@repo/ui/context/types';
import { classifyDeviceTier, resolveVisualCapabilities } from '@repo/ui/context/visualPolicy';
import { applyVisualSafeMode } from '@repo/ui/context/visualSafety';
import { describe, expect, it } from 'vitest';

/**
 * The drift test (pipeline phase E2): the old governor is the differential oracle for verger.
 * Every input the old governor distinguishes is enumerated (a finite domain, so exhaustively,
 * not by sampling); each is fed to both, verger's levels are read through Gurudevi's view, and
 * every field that differs must be named below with its reason. An unnamed difference fails:
 * moving consumers to verger may change behaviour only on purpose.
 */

const GIB = 1024 ** 3;
/**
 * Phones by marketed size, with the memory they report (below the marketed size: the OS keeps
 * some). The 8 GB figure is the A52's, measured; the others are typical, to confirm on phones.
 */
const PHONES = {
  '2GB': 1.8 * GIB,
  '3GB': 2.8 * GIB,
  '4GB': 3.7 * GIB,
  '6GB': 5.5 * GIB,
  '8GB': 7_668_940 * 1024,
  '12GB': 11.2 * GIB,
} as const;
type Phone = keyof typeof PHONES;
const VERGER_LOW: readonly Phone[] = ['2GB', '3GB', '4GB'];
const FIDELITY: readonly FidelityLevel[] = ['auto', 'low', 'high'];
const NETWORK: readonly NetworkQuality[] = ['excellent', 'good', 'fair', 'poor', 'offline'];
const BOOL = [false, true] as const;

interface Case {
  readonly phone: Phone;
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
  for (const phone of Object.keys(PHONES) as Phone[])
    for (const fidelity of FIDELITY)
      for (const saver of BOOL)
        for (const reduceMotion of BOOL)
          for (const network of NETWORK)
            for (const sound of BOOL)
              for (const haptics of BOOL)
                for (const quiet of BOOL)
                  for (const safe of BOOL)
                    yield { phone, fidelity, saver, reduceMotion, network, sound, haptics, quiet, safe };
}

/** The old governor, as RealityProvider and collectRealitySignals feed it. */
function oldGovernor(c: Case) {
  const reality: RealityState = {
    deviceTier: classifyDeviceTier(PHONES[c.phone]),
    totalMemoryGB: PHONES[c.phone] / GIB,
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
  const capacity: CapacityFacts = { ...UNKNOWN_CAPACITY, totalMemoryBytes: PHONES[c.phone] };
  const activation = resolveActivation(ACTIVATION_PRESETS.static, { sense: { network: true } });
  let state = VERGER_POLICY.create({ at: 0, levers: GURUDEVI_MOBILE_HOST.levers, capacity, activation, hardware: false });
  const events: GovernorEvent[] = [
    { type: 'app-state', at: 1, state: 'active' },
    { type: 'preferences', at: 2, reduceMotion: c.reduceMotion, fidelity: c.fidelity },
    { type: 'power', at: 3, saver: c.saver },
    networkEvent(c.network, 4),
  ];
  for (const event of events) state = VERGER_POLICY.reduce(state, event);
  return experienceOf(VERGER_POLICY.snapshot(state), {
    fidelity: c.fidelity,
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
 * open (a chair, stage-and-chairs.md); the test keeps it visible until it is made. None is open
 * now: both found on 2026-10-24 were decided the same day.
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

/** Everything a phone's class sets: its tier, and what the class floors and fidelity give it. */
const CLASS_FIELDS = [
  ...AMBIENT_FIELDS,
  'deviceTier',
  'effectiveFidelity',
  'quality',
  'allowAmbientEffects',
  'allowRichAnimation',
  'allowBlur',
  'imageCachePolicy',
  'imageDecodeFormat',
  'experience.visualEffects',
  'experience.haptics',
] as const;

export const DIFFERENCES: readonly Difference[] = [
  {
    id: 'four-gb-phones-are-low',
    status: 'intended',
    why:
      'Decided 2026-10-24: the hardware is the ceiling, and 4 GB phones are low end. The old ' +
      'governor (low below 3 GiB) gave them its medium tier; verger classes them low ' +
      '(`lowCapacityBelowBytes`, 5 GiB): ambient stilled, the rest one step down.',
    applies: (c) => c.phone === '4GB',
    fields: CLASS_FIELDS,
  },
  {
    id: 'eight-gb-phones-are-mid',
    status: 'intended',
    why:
      'Decided 2026-10-24: 8 GB is the middle. The old governor (high from 6 GiB) gave the A52 ' +
      'everything; verger classes it mid (`midCapacityBelowBytes`, 9 GiB): it gives up what ' +
      'Gurudevi\'s levers declare for mid phones until it earns it back by measurement.',
    applies: (c) => c.phone === '8GB',
    fields: CLASS_FIELDS,
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
      'On a low phone verger lowers blur one step (reduced radius, "refined"); the old governor ' +
      'named the level "essential". Both allow no full blur.',
    applies: (c) => VERGER_LOW.includes(c.phone) && c.fidelity !== 'high',
    fields: ['experience.visualEffects'],
  },
  {
    id: 'weak-links-wait',
    status: 'intended',
    why:
      'Decided 2026-10-24: be resilient, intermittent and slow links are normal. Optional ' +
      'prefetch waits on any slow link (below `slowNetworkKbps`, so 3G-class "fair" too), and ' +
      'for a minute after the network returns; the old governor still prefetched on "fair".',
    applies: (c) => c.network === 'fair',
    fields: ['experience.allowAssetPrefetch', 'shouldPrefetchAssets'],
  },
  {
    id: 'image-cache-is-memory-not-data',
    status: 'intended',
    why:
      'The old governor inferred "data saver" from a poor or absent network and then also dropped ' +
      'the memory image cache. The cache is memory, not data: verger sets it by memory alone.',
    applies: (c) => c.network === 'poor' || c.network === 'offline',
    fields: ['imageCachePolicy'],
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
    expect(total).toBe(6 * 3 * 2 * 2 * 5 * 2 * 2 * 2 * 2);
  });

  it('every difference has a named cause', () => {
    const report = [...unexplained].map(([key, g]) => `${key} (${g.count}) e.g. ${JSON.stringify(g.example)}`);
    expect(report).toEqual([]);
  });

  it('every named cause still explains something (no stale entries)', () => {
    expect(DIFFERENCES.map((d) => d.id).filter((id) => !used.has(id))).toEqual([]);
  });
});
