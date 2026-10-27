import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from './activation';
import { DEFAULT_VERGER_CONFIG } from './config';
import { checkSnapshot } from './invariants';
import { createVergerState, reduceVerger, snapshotOf, UNKNOWN_CAPACITY, type VergerState } from './reducer';
import type { VergerEvent } from './types';

const capacity = { ...UNKNOWN_CAPACITY, totalMemoryBytes: 12 * 1024 ** 3, sdkInt: 34, supportsRenderEffect: true, supportsRuntimeShader: true, refreshRatesHz: [60, 120] };
const frames = (at: number, stressed: boolean): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs: stressed ? 40 : 8, targetMs: 16.67, worstMs: stressed ? 80 : 16, droppedRatio: stressed ? 0.5 : 0 },
});
const lowered = (state: VergerState, at = state.at) =>
  Object.values(snapshotOf(state, at).levels).reduce((sum, level) => sum + level, 0);

function run(events: readonly VergerEvent[]) {
  let state = createVergerState({ at: 0, levers: SAMPLE_LEVERS, capacity, memorySensing: true, activation: ACTIVATION_PRESETS.active });
  const trace: { at: number; total: number }[] = [];
  for (const event of events) {
    state = reduceVerger(state, event);
    expect(checkSnapshot(snapshotOf(state), SAMPLE_LEVERS)).toEqual([]);
    trace.push({ at: event.at, total: lowered(state) });
  }
  return { state, trace };
}

/** Stress frames every 500 ms from `from` to `to`, with `extra` events merged in time order. */
const stress = (from: number, to: number, extra: VergerEvent[] = []) => {
  const events: VergerEvent[] = [...extra];
  for (let at = from; at <= to; at += 500) events.push(frames(at, true));
  return events.sort((a, b) => a.at - b.at);
};

describe('invariant 7: no lowering while a gesture or scroll is under way', () => {
  it('a lowering decided mid-scroll waits for the scroll to end, then applies', () => {
    const quiet = run(stress(500, 1500)).trace.find((t) => t.total > 0)?.at;
    if (quiet === undefined) throw new Error('stress lowered nothing');
    const { trace } = run(
      stress(500, 3000, [{ type: 'scroll', at: 400, active: true }, { type: 'scroll', at: 1800, active: false }]),
    );
    expect(trace.filter((t) => t.at < 1800).every((t) => t.total === 0)).toBe(true);
    expect(trace.find((t) => t.total > 0)?.at).toBeGreaterThanOrEqual(1800);
    expect(quiet).toBeLessThan(1800);
  });

  it('a finger that never lifts holds a lowering at most gestureFreezeMaxMs', () => {
    const touches: VergerEvent[] = [];
    for (let at = 0; at <= 8000; at += 250) touches.push({ type: 'interaction', at });
    const { trace } = run(stress(500, 8000, touches));
    const first = trace.find((t) => t.total > 0);
    expect(first).toBeDefined();
    const unfrozen = run(stress(500, 8000)).trace.find((t) => t.total > 0)?.at ?? 0;
    expect((first?.at ?? 0) - unfrozen).toBeLessThanOrEqual(DEFAULT_VERGER_CONFIG.gestureFreezeMaxMs + 500);
  });

  it('limits apply at once during a gesture (battery saver), and heat at hot overrides the freeze', () => {
    const scrolling: VergerEvent[] = [{ type: 'scroll', at: 100, active: true }];
    const saver = run([...scrolling, { type: 'power', at: 200, saver: true }]);
    expect(lowered(saver.state)).toBeGreaterThan(0);
    const hot = run([...scrolling, { type: 'thermal', at: 200, status: 'severe', headroom: 1 }]);
    expect(lowered(hot.state)).toBeGreaterThan(0);
  });

  it('a scroll whose end is never reported is over after scrollQuietMs', () => {
    const { state } = run(stress(500, 1500, [{ type: 'scroll', at: 400, active: true }]));
    expect(lowered(state, 1500)).toBe(0);
    const later = reduceVerger(state, { type: 'tick', at: 400 + DEFAULT_VERGER_CONFIG.scrollQuietMs + 1 });
    expect(lowered(later)).toBeGreaterThan(0);
  });

  it('raising quality is never held back by a gesture', () => {
    const events = stress(500, 3000);
    for (let at = 3500; at <= 40_000; at += 500) events.push(frames(at, false));
    for (let at = 3200; at <= 40_000; at += 1000) events.push({ type: 'scroll', at, active: true });
    events.sort((a, b) => a.at - b.at);
    const { trace } = run(events);
    const peak = Math.max(...trace.map((t) => t.total));
    expect(peak).toBeGreaterThan(0);
    expect(trace.at(-1)?.total).toBeLessThan(peak);
  });
});
