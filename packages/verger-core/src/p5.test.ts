import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import {
  ACTIVATION_PRESETS,
  resolveActivation,
  SENSORS,
  type SensorId,
  type VergerActivation,
} from './activation';
import { VERGER_POLICY, VERGER_POLICY_P5, type VergerPolicy } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { CapacityFacts, VergerEvent, VergerSnapshot } from './types';

const HIGH: CapacityFacts = {
  ...UNKNOWN_CAPACITY,
  totalMemoryBytes: 12 * 1024 ** 3,
  sdkInt: 34,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 120],
};

const frames = (at: number, averageMs: number, droppedRatio: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs, targetMs: 16.67, worstMs: averageMs * 2, droppedRatio },
});

/** A memory trim, then a GPU-bound stretch, then calm frames while memory stays strained. */
function story(): VergerEvent[] {
  const events: VergerEvent[] = [{ type: 'memory-trim', at: 100, severity: 'critical' }];
  for (let at = 600; at <= 2600; at += 500) events.push(frames(at, 40, 0.5));
  for (let at = 3100; at <= 25_000; at += 500) events.push(frames(at, 8, 0));
  // Someone is using the screen, so ambient sleep does not hide what expansion does.
  for (let at = 1000; at <= 25_000; at += 2000) events.push({ type: 'interaction', at: at + 1 });
  return events.sort((x, y) => x.at - y.at);
}

function run(
  policy: VergerPolicy,
  events: readonly VergerEvent[],
  sense: VergerActivation = ACTIVATION_PRESETS.active,
) {
  let state = policy.create({ at: 0, levers: SAMPLE_LEVERS, capacity: HIGH, memorySensing: true, activation: sense });
  const snapshots: VergerSnapshot[] = [];
  for (const event of events) {
    state = policy.reduce(state, event);
    snapshots.push(policy.snapshot(state));
  }
  return snapshots;
}

describe('verger-p5: expansion on each lever’s own evidence', () => {
  it('gives frame-bound levers back while memory stays trimmed; p4 holds everything', () => {
    const p4 = run(VERGER_POLICY, story());
    const p5 = run(VERGER_POLICY_P5, story());
    const afterStress = p5[6];
    if (!afterStress) throw new Error('story too short');
    const lowered = Object.entries(afterStress.levels).filter(([id, level]) => level > 0 && id !== 'photo-cache');
    expect(lowered.length).toBeGreaterThan(0);
    const end5 = p5[p5.length - 1];
    const end4 = p4[p4.length - 1];
    if (!end5 || !end4) throw new Error('no snapshots');
    expect(['trimmed', 'low']).toContain(end5.memory);
    // The memory lever stays lowered under both policies: its account is still strained.
    expect(end5.levels['photo-cache']).toBeGreaterThan(0);
    expect(end4.levels['photo-cache']).toBeGreaterThan(0);
    for (const [id] of lowered) {
      expect([id, end5.levels[id]]).toEqual([id, 0]);
      expect(end4.levels[id]).toBeGreaterThan(0);
    }
  });

  it('with every sensor deaf, p5 publishes exactly what p4 does', () => {
    const deaf = resolveActivation(ACTIVATION_PRESETS.active, {
      sense: Object.fromEntries(SENSORS.map((id) => [id, false])) as Record<SensorId, boolean>,
    });
    const levels = (snapshots: VergerSnapshot[]) => snapshots.map((s) => s.levels);
    expect(levels(run(VERGER_POLICY_P5, story(), deaf))).toEqual(levels(run(VERGER_POLICY, story(), deaf)));
  });

  it('every snapshot keeps its envelope ordered, and every applied level inside it', () => {
    for (const snapshot of run(VERGER_POLICY_P5, story())) {
      for (const [id, e] of Object.entries(snapshot.envelope)) {
        expect(e.limit).toBeLessThanOrEqual(e.ceiling);
        expect(e.ceiling).toBeLessThanOrEqual(e.home);
        expect(e.home).toBeLessThanOrEqual(e.floor);
        const level = snapshot.levels[id] ?? 0;
        expect(level).toBeGreaterThanOrEqual(e.ceiling);
        expect(level).toBeLessThanOrEqual(e.floor);
      }
    }
  });
});

describe('verger-p5: a lever that cannot hold its expansion backs off alone', () => {
  it('doubles only that lever’s wait; p4’s global wait is untouched', () => {
    let state = VERGER_POLICY_P5.create({
      at: 0,
      levers: SAMPLE_LEVERS,
      capacity: HIGH,
      memorySensing: true,
      activation: ACTIVATION_PRESETS.active,
    });
    let expanded: string | null = null;
    let at = 0;
    for (const event of story()) {
      const before = VERGER_POLICY_P5.snapshot(state).levels;
      state = VERGER_POLICY_P5.reduce(state, event);
      at = event.at;
      const after = VERGER_POLICY_P5.snapshot(state).levels;
      expanded = Object.keys(after).find((id) => (after[id] ?? 0) < (before[id] ?? 0)) ?? null;
      if (expanded) break;
    }
    if (!expanded) throw new Error('nothing expanded in the story');
    // Strain returns at once: the frames go over budget again.
    for (let t = at + 100; t <= at + 1600; t += 500) state = VERGER_POLICY_P5.reduce(state, frames(t, 40, 0.5));
    const base = state.config.upgradeAfterMs;
    const lowered = Object.keys(state.leverWait);
    expect(lowered.length).toBeGreaterThan(0);
    for (const id of lowered) expect(state.leverWait[id]).toBe(base * 2);
    expect(state.upgradeAfterMs).toBe(base);
  });
});
