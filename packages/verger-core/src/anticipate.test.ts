import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { isValidEvent } from './controller';
import { checkSnapshot } from './invariants';
import { VERGER_POLICY, VERGER_POLICY_P5, type VergerPolicy } from './policy';
import {
  createVergerState,
  isOrnamentalOrDeferrable,
  reduceVerger,
  snapshotOf,
  type VergerState,
} from './reducer';
import type { AnticipateIntent, LeverSpec, VergerEvent } from './types';
import {
  evaluateEvsi,
  shouldTransmitTelemetry,
  type OutcomeSummary,
  type LeverOutcomes,
} from './outcomes';

const TARGET = 16.67;

const frame = (at: number, averageMs: number, droppedRatio: number = 0): VergerEvent => ({
  type: 'frame-window',
  at,
  window: {
    startMs: at - 500,
    endMs: at,
    frames: 30,
    averageMs,
    targetMs: TARGET,
    worstMs: averageMs * 2,
    droppedRatio,
  },
});

const anticipate = (
  at: number,
  intent: AnticipateIntent,
  durationMs: number,
): VergerEvent => ({
  type: 'anticipate',
  at,
  intent,
  durationMs,
});

function run(state: VergerState, events: readonly VergerEvent[]): VergerState {
  let next = state;
  for (const event of events) next = reduceVerger(next, event);
  return next;
}

describe('Feedforward Intent & Anticipation', () => {
  it('event validation: isValidEvent checks intent and non-negative finite duration', () => {
    expect(isValidEvent(anticipate(100, 'heavy-navigation', 1000))).toBe(true);
    expect(isValidEvent(anticipate(100, 'burst-sync', 500))).toBe(true);
    expect(isValidEvent(anticipate(100, 'canvas-mount', 0))).toBe(true);

    expect(isValidEvent({ type: 'anticipate', at: 100, intent: 'random-work' as any, durationMs: 500 })).toBe(false);
    expect(isValidEvent({ type: 'anticipate', at: 100, intent: 'heavy-navigation', durationMs: -10 })).toBe(false);
    expect(isValidEvent({ type: 'anticipate', at: 100, intent: 'heavy-navigation', durationMs: Number.NaN })).toBe(false);
  });

  it('anticipation proactively lowers ornamental pressure before frames arrive', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      const initial = policy.create({ at: 0, levers: SAMPLE_LEVERS });
      expect(snapshotOf(initial).pressure).toEqual({});

      // Proactively signal heavy navigation for 2000ms before any frames are drawn
      const after = policy.reduce(initial, anticipate(1000, 'heavy-navigation', 2000));
      const snap = policy.snapshot(after);

      // Ornamental levers (sparkle, frosting) are stepped down without waiting for 750ms of sustained jank
      expect(snap.pressure['sparkle']).toBe(1);
      expect(snap.pressure['frosting']).toBe(1);

      // Non-ornamental / drastic containment levers (refresh-rate, global-motion) are not touched
      expect(snap.pressure['refresh-rate']).toBeUndefined();
      expect(snap.pressure['global-motion']).toBeUndefined();

      expect(snap.lastAction).toBe('decrease');
      expect(snap.lastReason).toMatch(/feedforward anticipation/);
    }
  });

  it('does not induce flapping or break invariant snapshot bounds', () => {
    let state = VERGER_POLICY_P5.create({ at: 0, levers: SAMPLE_LEVERS, expansion: true });

    // Step through multiple anticipation events and verify snapshot invariants at every stage
    const events: VergerEvent[] = [
      anticipate(100, 'heavy-navigation', 1000),
      { type: 'tick', at: 500 },
      anticipate(800, 'canvas-mount', 1500),
      { type: 'tick', at: 1200 },
    ];

    for (const event of events) {
      state = VERGER_POLICY_P5.reduce(state, event);
      const snap = VERGER_POLICY_P5.snapshot(state);
      expect(checkSnapshot(snap, SAMPLE_LEVERS)).toEqual([]);
    }

    // In P5, anticipation does not register as a failed expansion, so leverFlaps is untouched
    expect(state.leverFlaps['sparkle']).toBeUndefined();
    expect(state.leverFlaps['frosting']).toBeUndefined();
  });

  it('suppresses premature recovery during durationMs and returns gracefully after durationMs passes', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      let state = policy.create({
        at: 0,
        levers: SAMPLE_LEVERS,
        config: { upgradeAfterMs: 500 },
      });

      // Proactively anticipate heavy navigation from t=1000 for 1500ms (until t=2500)
      state = policy.reduce(state, anticipate(1000, 'heavy-navigation', 1500));
      expect(policy.snapshot(state).pressure['sparkle']).toBe(1);

      // While at < 2500, calm frames arrive, but anticipation holds quality down (no premature expansion)
      state = policy.reduce(state, frame(1500, 8, 0));
      state = policy.reduce(state, frame(2000, 8, 0));
      expect(policy.snapshot(state).pressure['sparkle']).toBe(1);

      // Once durationMs passes (at >= 2500), normal recovery ladder dynamics resume
      // Calm frames past upgradeAfterMs gracefully restore the levers
      let at = 2500;
      while (Object.values(policy.snapshot(state).pressure).some((p) => p > 0) && at < 10000) {
        at += 500;
        state = policy.reduce(state, frame(at, 8, 0));
      }

      // Proves it returned gracefully to baseline
      expect(policy.snapshot(state).pressure).toEqual({});
      expect(checkSnapshot(policy.snapshot(state), SAMPLE_LEVERS)).toEqual([]);
    }
  });

  it('intent-specific lever targeting: burst-sync vs canvas-mount', () => {
    const burstStart = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS });
    const burstAfter = VERGER_POLICY.reduce(burstStart, anticipate(100, 'burst-sync', 1000));
    const burstSnap = VERGER_POLICY.snapshot(burstAfter);

    // burst-sync targets deferrable background workload (rows-ahead) and ambient
    expect(burstSnap.pressure['rows-ahead']).toBe(1);
    expect(burstSnap.pressure['sparkle']).toBe(1);

    const canvasStart = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS });
    const canvasAfter = VERGER_POLICY.reduce(canvasStart, anticipate(100, 'canvas-mount', 1000));
    const canvasSnap = VERGER_POLICY.snapshot(canvasAfter);

    // canvas-mount targets GPU rendering & shaders (frosting, sparkle), not CPU rows-ahead
    expect(canvasSnap.pressure['frosting']).toBe(1);
    expect(canvasSnap.pressure['sparkle']).toBe(1);
    expect(canvasSnap.pressure['rows-ahead']).toBeUndefined();
  });
});

describe('EVSI Telemetry Filtering', () => {
  const blankOutcomes: LeverOutcomes = {
    relieved: 0,
    notRelieved: 0,
    unjudged: 0,
    held: 0,
    withdrawn: 0,
    floorMoves: 0,
    agilityCount: 0,
    agilityTotalMs: 0,
    agilityWorstMs: 0,
  };

  it('marks nominal session with 0 dropped rungs, 0 flapping, 0 failed relief as low-evsi', () => {
    const evsi = evaluateEvsi({
      droppedRungs: 0,
      flappingIncidents: 0,
      failedReliefSteps: 0,
      unexpectedJank: false,
      worstThermal: 'nominal',
      worstMemory: 'normal',
    });
    expect(evsi).toBe('low-evsi');

    // Suppressible on metered networks to save data/battery, transmitted on unmetered
    expect(shouldTransmitTelemetry(evsi, true)).toBe(false);
    expect(shouldTransmitTelemetry(evsi, false)).toBe(true);
  });

  it('marks session with unexpected jank as high-evsi (must transmit)', () => {
    const evsi = evaluateEvsi({
      droppedRungs: 0,
      flappingIncidents: 0,
      failedReliefSteps: 0,
      unexpectedJank: true,
    });
    expect(evsi).toBe('high-evsi');
    expect(shouldTransmitTelemetry(evsi, true)).toBe(true);
    expect(shouldTransmitTelemetry(evsi, false)).toBe(true);
  });

  it('marks session with failed relief steps as high-evsi', () => {
    const evsi = evaluateEvsi({ failedReliefSteps: 1 });
    expect(evsi).toBe('high-evsi');
    expect(shouldTransmitTelemetry(evsi, true)).toBe(true);
  });

  it('marks session with flapping incidents as high-evsi', () => {
    const evsi = evaluateEvsi({ flappingIncidents: 1 });
    expect(evsi).toBe('high-evsi');
    expect(shouldTransmitTelemetry(evsi, true)).toBe(true);
  });

  it('marks session with recovery ladder activations or dropped rungs as high-evsi', () => {
    expect(evaluateEvsi({ droppedRungs: 1 })).toBe('high-evsi');
    expect(evaluateEvsi({ recoveryLadderActivations: 1 })).toBe('high-evsi');
  });

  it('marks session with thermal or memory stress as high-evsi', () => {
    expect(evaluateEvsi({ worstThermal: 'warm' })).toBe('high-evsi');
    expect(evaluateEvsi({ worstThermal: 'hot' })).toBe('high-evsi');
    expect(evaluateEvsi({ worstThermal: 'critical' })).toBe('high-evsi');
    expect(evaluateEvsi({ worstMemory: 'trimmed' })).toBe('high-evsi');
    expect(evaluateEvsi({ worstMemory: 'low' })).toBe('high-evsi');
    expect(evaluateEvsi({ contentionExhausted: true })).toBe('high-evsi');
  });

  it('evaluates EVSI directly from OutcomeSummary', () => {
    const nominalSummary: OutcomeSummary = {
      pending: 0,
      levers: {
        sparkle: { ...blankOutcomes, relieved: 2, held: 1 },
      },
    };
    expect(evaluateEvsi(nominalSummary)).toBe('low-evsi');

    const failedReliefSummary: OutcomeSummary = {
      pending: 0,
      levers: {
        sparkle: { ...blankOutcomes, notRelieved: 1 },
      },
    };
    expect(evaluateEvsi(failedReliefSummary)).toBe('high-evsi');

    const flappingSummary: OutcomeSummary = {
      pending: 0,
      levers: {
        sparkle: { ...blankOutcomes, withdrawn: 1 },
      },
    };
    expect(evaluateEvsi(flappingSummary)).toBe('high-evsi');
  });

  it('evaluates EVSI from SessionReport facts', () => {
    const cleanSession = {
      foregroundMs: 10000,
      evidenceMs: 8000,
      stressedMs: 0,
      worstThermal: 'nominal' as const,
      worstMemory: 'normal' as const,
      contentionExhausted: false,
    };
    expect(evaluateEvsi(cleanSession)).toBe('low-evsi');

    const jankySession = {
      ...cleanSession,
      stressedMs: 1500,
    };
    expect(evaluateEvsi(jankySession)).toBe('high-evsi');
  });
});
