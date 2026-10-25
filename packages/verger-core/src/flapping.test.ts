import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from './activation';
import { DEFAULT_VERGER_CONFIG } from './config';
import { checkSnapshot } from './invariants';
import { VERGER_POLICY, VERGER_POLICY_P5, type VergerPolicy } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { VergerEvent } from './types';

const capacity = { ...UNKNOWN_CAPACITY, totalMemoryBytes: 12 * 1024 ** 3, sdkInt: 34, supportsRenderEffect: true, supportsRuntimeShader: true, refreshRatesHz: [60, 120] };
const frames = (at: number, averageMs: number, dropped: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs, targetMs: 16.67, worstMs: averageMs * 2, droppedRatio: dropped },
});

/**
 * Stress until something is lowered, then calm until all of it returns, then hold calm for
 * `holdMs` (past the failed-expansion window) and stress again. Returns how long each cycle's
 * return took, from the first calm frame to the last lever back.
 */
function flap(policy: VergerPolicy, cycles: number, holdMs: number): number[] {
  let state = policy.create({ at: 0, levers: SAMPLE_LEVERS, capacity, memorySensing: true, activation: ACTIVATION_PRESETS.active });
  let at = 0;
  const step = (event: VergerEvent) => {
    state = policy.reduce(state, event);
    expect(checkSnapshot(policy.snapshot(state), SAMPLE_LEVERS)).toEqual([]);
  };
  const lowered = () => Object.values(policy.snapshot(state).pressure).some((p) => p > 0);
  const returns: number[] = [];
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    for (let i = 0; i < 6 || !lowered(); i += 1) {
      at += 500;
      step({ type: 'interaction', at: at - 1 });
      step(frames(at, 40, 0.5));
      if (i > 40) throw new Error('stress lowered nothing');
    }
    const calmFrom = at;
    while (lowered()) {
      at += 500;
      step({ type: 'interaction', at: at - 1 });
      step(frames(at, 8, 0));
      if (at - calmFrom > 600_000) throw new Error('never returned');
    }
    returns.push(at - calmFrom);
    const until = at + holdMs;
    while (at < until) {
      at += 500;
      step({ type: 'interaction', at: at - 1 });
      step(frames(at, 8, 0));
    }
  }
  return returns;
}

describe('p5 flapping rule (D4)', () => {
  const hold = DEFAULT_VERGER_CONFIG.failedUpgradeWindowMs + 2_000;

  it('a lever that keeps coming back and being lowered again waits the longest, then the rule lifts', () => {
    const returns = flap(VERGER_POLICY_P5, 6, hold);
    const cycles = DEFAULT_VERGER_CONFIG.flapCycles;
    // Before the rule: the ordinary return. On the cycle that makes it flap: the longest wait.
    for (const r of returns.slice(0, cycles)) expect(r).toBeLessThan(DEFAULT_VERGER_CONFIG.maxUpgradeAfterMs);
    expect(returns[cycles]).toBeGreaterThanOrEqual(DEFAULT_VERGER_CONFIG.maxUpgradeAfterMs);
    // That long calm was a whole window without a flap: the lever starts over.
    expect(returns[cycles + 1]).toBeLessThan(DEFAULT_VERGER_CONFIG.maxUpgradeAfterMs);
  });

  it('flaps spaced wider than the window are not flapping', () => {
    const wide = flap(VERGER_POLICY_P5, 5, DEFAULT_VERGER_CONFIG.flapWindowMs + 1_000);
    for (const r of wide) expect(r).toBeLessThan(DEFAULT_VERGER_CONFIG.maxUpgradeAfterMs);
  });

  it('p4 has no flapping rule: its returns do not lengthen this way', () => {
    const returns = flap(VERGER_POLICY, 5, hold);
    for (const r of returns) expect(r).toBeLessThan(DEFAULT_VERGER_CONFIG.maxUpgradeAfterMs);
  });
});
