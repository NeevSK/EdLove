import { describe, expect, it } from 'vitest';
import {
  PROVISIONAL_MAX_OPTIONAL_CONCURRENCY,
  reduceWorkAdmission,
  resolveWorkAdmission,
  type WorkAdmissionObservation,
  type WorkAdmissionPolicy,
  type WorkAdmissionState,
} from './workAdmission';

const policy: WorkAdmissionPolicy = { recoveryWindowMs: 100 };
const observation = (
  overrides: Partial<WorkAdmissionObservation> = {},
): WorkAdmissionObservation => ({
  capacityKnown: false,
  phase: 'settled',
  appState: 'active',
  pressure: 'unknown',
  observedAt: 1,
  ...overrides,
});

const initialState = (overrides: Partial<WorkAdmissionObservation> = {}): WorkAdmissionState => ({
  ...observation(overrides),
  recoveryCandidateSince: null,
});

describe('work admission reducer', () => {
  it('holds optional work until the explicit settled phase and gates background or severe pressure', () => {
    expect(resolveWorkAdmission(initialState({ phase: 'protected-ready' }))).toEqual({
      optionalWorkAllowed: false,
      maxOptionalConcurrency: 0,
      reason: 'journey-not-settled',
    });
    expect(resolveWorkAdmission(initialState({ appState: 'background' })).reason).toBe(
      'background',
    );
    expect(resolveWorkAdmission(initialState({ pressure: 'severe' })).reason).toBe(
      'severe-pressure',
    );
  });

  it('keeps settled unknown, constrained, and unknown-capacity work at the provisional cap of one', () => {
    expect(PROVISIONAL_MAX_OPTIONAL_CONCURRENCY).toBe(1);
    for (const state of [
      initialState({ pressure: 'unknown' }),
      initialState({ pressure: 'constrained' }),
      initialState({ capacityKnown: false, pressure: 'normal' }),
    ]) {
      expect(resolveWorkAdmission(state)).toMatchObject({
        optionalWorkAllowed: true,
        maxOptionalConcurrency: 1,
        reason: 'eligible',
      });
    }
  });

  it('enters constrained and severe pressure immediately, then recovers only after the configured normal window', () => {
    let state = reduceWorkAdmission(
      null,
      observation({ pressure: 'constrained', observedAt: 10 }),
      policy,
    );
    expect(state.pressure).toBe('constrained');
    expect(resolveWorkAdmission(state).maxOptionalConcurrency).toBe(1);

    state = reduceWorkAdmission(state, observation({ pressure: 'severe', observedAt: 20 }), policy);
    expect(resolveWorkAdmission(state).reason).toBe('severe-pressure');
    state = reduceWorkAdmission(state, observation({ pressure: 'normal', observedAt: 30 }), policy);
    expect(state).toMatchObject({ pressure: 'severe', recoveryCandidateSince: 30 });
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'normal', observedAt: 129 }),
      policy,
    );
    expect(state.pressure).toBe('severe');
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'normal', observedAt: 130 }),
      policy,
    );
    expect(state).toMatchObject({ pressure: 'normal', recoveryCandidateSince: null });
  });

  it('does not let unknown pressure clear the worst latched pressure or preserve recovery time', () => {
    let state = reduceWorkAdmission(
      null,
      observation({ pressure: 'severe', observedAt: 10 }),
      policy,
    );
    state = reduceWorkAdmission(state, observation({ pressure: 'normal', observedAt: 20 }), policy);
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'unknown', observedAt: 70 }),
      policy,
    );
    expect(state).toMatchObject({ pressure: 'severe', recoveryCandidateSince: null });
    state = reduceWorkAdmission(state, observation({ pressure: 'normal', observedAt: 80 }), policy);
    expect(state).toMatchObject({ pressure: 'severe', recoveryCandidateSince: 80 });
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'normal', observedAt: 179 }),
      policy,
    );
    expect(state.pressure).toBe('severe');
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'normal', observedAt: 180 }),
      policy,
    );
    expect(state.pressure).toBe('normal');
  });

  it('ignores stale timestamps without applying their phase or pressure', () => {
    const state = initialState({ observedAt: 50, pressure: 'normal' });
    const result = reduceWorkAdmission(
      state,
      observation({ observedAt: 49, phase: 'boot', pressure: 'severe' }),
      policy,
    );
    expect(result).toBe(state);
  });

  it.each(['public-ready', 'boot'] as const)(
    'closes admission on explicit phase regression to %s',
    (phase) => {
      const state = reduceWorkAdmission(
        initialState({ phase: 'settled', observedAt: 50, pressure: 'normal' }),
        observation({ phase, observedAt: 51, pressure: 'normal' }),
        policy,
      );
      expect(state.phase).toBe(phase);
      expect(resolveWorkAdmission(state)).toMatchObject({
        optionalWorkAllowed: false,
        maxOptionalConcurrency: 0,
        reason: 'journey-not-settled',
      });
    },
  );

  it('requires a fresh normal window after backgrounding', () => {
    let state = initialState({ pressure: 'normal', observedAt: 10 });
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'normal', appState: 'background', observedAt: 20 }),
      policy,
    );
    expect(state).toMatchObject({ pressure: 'unknown', recoveryCandidateSince: null });
    state = reduceWorkAdmission(state, observation({ pressure: 'normal', observedAt: 30 }), policy);
    expect(state).toMatchObject({ pressure: 'unknown', recoveryCandidateSince: 30 });
    state = reduceWorkAdmission(
      state,
      observation({ pressure: 'normal', observedAt: 130 }),
      policy,
    );
    expect(state.pressure).toBe('normal');
  });
});
