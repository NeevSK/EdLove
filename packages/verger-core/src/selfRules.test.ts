import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from './activation';
import type { MoveRecord, Verdict } from './outcomes';
import { VERGER_POLICY, VERGER_POLICY_P5, type VergerPolicy } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import { ineffectiveFindings } from './selfRules';
import type { VergerEvent, VergerSnapshot } from './types';

const move = (lever: string, verdict: Verdict, accounts: MoveRecord['accounts'], over: Partial<MoveRecord> = {}): MoveRecord => ({
  lever,
  direction: 'compress',
  from: 0,
  to: 1,
  at: 0,
  cause: 'pressure',
  accounts,
  reason: 'test',
  verdict,
  judgedAt: 1,
  agilityMs: null,
  qualityDelta: 0.1,
  ...over,
});

describe('ineffective findings (loop 2, D4)', () => {
  it('finds a lever that failed a target three times and never relieved it', () => {
    const records = [1, 2, 3].map(() => move('blur', 'not-relieved', { gpu: 'tight', thermal: 'tight' }));
    expect(ineffectiveFindings(records)).toEqual([{ lever: 'blur', target: 'gpu', notRelieved: 3 }]);
  });

  it('one relief clears the lever; fewer failures than the bound find nothing', () => {
    const failed = [1, 2, 3].map(() => move('blur', 'not-relieved', { gpu: 'tight' }));
    expect(ineffectiveFindings([...failed, move('blur', 'relieved', { gpu: 'tight' })])).toEqual([]);
    expect(ineffectiveFindings(failed.slice(0, 2))).toEqual([]);
  });

  it('learns nothing from heat, floors, expansions or moves still pending', () => {
    const records = [
      ...[1, 2, 3].map(() => move('blur', 'not-relieved', { thermal: 'overdrawn' })),
      ...[1, 2, 3].map(() => move('particles', 'not-relieved', { gpu: 'tight' }, { cause: 'floor' })),
      ...[1, 2, 3].map(() => move('photo-cache', 'held', { memory: 'tight' }, { direction: 'expand' })),
      ...[1, 2, 3].map(() => move('transitions', 'pending', { cpu: 'tight' })),
    ];
    expect(ineffectiveFindings(records)).toEqual([]);
  });
});

const frames = (at: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs: 40, targetMs: 16.67, worstMs: 80, droppedRatio: 0.5 },
});

const capacity = { ...UNKNOWN_CAPACITY, totalMemoryBytes: 12 * 1024 ** 3, sdkInt: 34, supportsRenderEffect: true, supportsRuntimeShader: true, refreshRatesHz: [60, 120] };

function stress(policy: VergerPolicy, before: readonly VergerEvent[]): VergerSnapshot[] {
  let state = policy.create({ at: 0, levers: SAMPLE_LEVERS, capacity, memorySensing: true, activation: ACTIVATION_PRESETS.active });
  for (const event of before) state = policy.reduce(state, event);
  const out: VergerSnapshot[] = [];
  for (let at = 600; at <= 6100; at += 500) {
    state = policy.reduce(state, { type: 'interaction', at: at - 1 });
    state = policy.reduce(state, frames(at));
    out.push(policy.snapshot(state));
  }
  return out;
}

const firstLowered = (snapshots: VergerSnapshot[]) => {
  for (const s of snapshots) {
    const id = Object.keys(s.pressure).find((k) => (s.pressure[k] ?? 0) > 0);
    if (id) return id;
  }
  return null;
};

describe('the ineffective-lever rule in the policy', () => {
  it('p5 stops lowering a lever for a target it proved not to relieve', () => {
    const baseline = stress(VERGER_POLICY_P5, []);
    const lever = firstLowered(baseline);
    if (!lever) throw new Error('stress lowered nothing');
    const learned = stress(VERGER_POLICY_P5, [
      { type: 'lever-ineffective', at: 1, lever, target: 'gpu' },
      { type: 'lever-ineffective', at: 1, lever, target: 'cpu' },
      { type: 'lever-ineffective', at: 1, lever, target: 'energy' },
      { type: 'lever-ineffective', at: 1, lever, target: 'memory' },
      { type: 'lever-ineffective', at: 1, lever, target: 'network' },
    ]);
    for (const s of learned) expect(s.pressure[lever] ?? 0).toBe(0);
    expect(firstLowered(learned)).not.toBeNull();
    expect(learned.at(-1)?.ineffective[lever]?.length).toBeGreaterThan(0);
  });

  it('p4 ignores the finding: its decisions are unchanged', () => {
    const lever = firstLowered(stress(VERGER_POLICY, []));
    if (!lever) throw new Error('stress lowered nothing');
    const finding: VergerEvent = { type: 'lever-ineffective', at: 1, lever, target: 'gpu' };
    expect(stress(VERGER_POLICY, [finding])).toEqual(stress(VERGER_POLICY, []));
  });

  it('a finding for an unknown lever, or a target the lever does not relieve, changes nothing', () => {
    const plain = stress(VERGER_POLICY_P5, []);
    expect(stress(VERGER_POLICY_P5, [{ type: 'lever-ineffective', at: 1, lever: 'no-such', target: 'gpu' }])).toEqual(plain);
    const memoryOnly = SAMPLE_LEVERS.find((l) => l.target === 'memory' && !(l.alsoRelieves ?? []).includes('gpu'));
    if (!memoryOnly) throw new Error('fixture has no memory-only lever');
    expect(stress(VERGER_POLICY_P5, [{ type: 'lever-ineffective', at: 1, lever: memoryOnly.id, target: 'gpu' }])).toEqual(plain);
  });
});
