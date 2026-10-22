export type WorkAdmissionPhase = 'boot' | 'public-ready' | 'protected-ready' | 'settled';
export type WorkPressure = 'unknown' | 'normal' | 'constrained' | 'severe';
export type WorkAppState = 'active' | 'background';

export interface WorkAdmissionObservation {
  capacityKnown: boolean;
  phase: WorkAdmissionPhase;
  appState: WorkAppState;
  pressure: WorkPressure;
  observedAt: number;
}

export interface WorkAdmissionState extends WorkAdmissionObservation {
  recoveryCandidateSince: number | null;
}

export interface WorkAdmissionPolicy {
  /** Caller supplies an uncalibrated recovery window; the reducer never starts a timer. */
  recoveryWindowMs: number;
}

export type WorkAdmissionReason =
  | 'journey-not-ready'
  | 'background'
  | 'constrained-pressure'
  | 'severe-pressure'
  | 'eligible';

export interface WorkAdmissionDecision {
  optionalWorkAllowed: boolean;
  maxOptionalConcurrency: number;
  reason: WorkAdmissionReason;
}

/** Provisional ceiling; keep at one until trace evidence supports changing policy. */
export const PROVISIONAL_MAX_OPTIONAL_CONCURRENCY = 1;

function validatePolicy(policy: WorkAdmissionPolicy): void {
  if (!Number.isFinite(policy.recoveryWindowMs) || policy.recoveryWindowMs < 0) {
    throw new Error('recoveryWindowMs must be a finite non-negative number.');
  }
}

function validateObservation(observation: WorkAdmissionObservation): void {
  if (!Number.isFinite(observation.observedAt) || observation.observedAt < 0) {
    throw new Error('observedAt must be a finite non-negative timestamp.');
  }
  if (typeof observation.capacityKnown !== 'boolean')
    throw new Error('capacityKnown must be boolean.');
  if (!['boot', 'public-ready', 'protected-ready', 'settled'].includes(observation.phase)) {
    throw new Error('Unsupported work-admission phase.');
  }
  if (!['active', 'background'].includes(observation.appState)) {
    throw new Error('Unsupported app state.');
  }
  if (!['unknown', 'normal', 'constrained', 'severe'].includes(observation.pressure)) {
    throw new Error('Unsupported pressure bucket.');
  }
}

function retainPressure(previous: WorkPressure, incoming: WorkPressure): WorkPressure {
  if (incoming === 'severe' || previous === 'severe') return 'severe';
  if (incoming === 'constrained' || previous === 'constrained') return 'constrained';
  return incoming;
}

/**
 * Reduces a timestamped observation into a stable admission snapshot.
 * Stale observations are ignored; explicit owner phase changes may regress.
 */
export function reduceWorkAdmission(
  previous: WorkAdmissionState | null,
  observation: WorkAdmissionObservation,
  policy: WorkAdmissionPolicy,
): WorkAdmissionState {
  validateObservation(observation);
  validatePolicy(policy);
  if (previous && observation.observedAt <= previous.observedAt) return previous;

  if (!previous) return { ...observation, recoveryCandidateSince: null };

  const next: WorkAdmissionState = { ...observation, recoveryCandidateSince: null };
  if (observation.pressure === 'severe' || observation.pressure === 'constrained') {
    next.pressure = retainPressure(previous.pressure, observation.pressure);
    return next;
  }

  if (observation.pressure === 'unknown') {
    const pressureHasBeenQuiet =
      observation.observedAt - previous.observedAt >= policy.recoveryWindowMs;
    next.pressure = pressureHasBeenQuiet ? 'unknown' : previous.pressure;
    return next;
  }

  if (observation.appState !== 'active') {
    next.pressure =
      previous.pressure === 'severe' || previous.pressure === 'constrained'
        ? previous.pressure
        : 'unknown';
    return next;
  }
  if (
    previous.pressure === 'normal' &&
    previous.appState === 'active' &&
    previous.recoveryCandidateSince === null
  )
    return next;

  const recoveryCandidateSince = previous.recoveryCandidateSince ?? observation.observedAt;
  if (
    observation.appState === 'active' &&
    observation.observedAt - recoveryCandidateSince >= policy.recoveryWindowMs
  ) {
    return next;
  }

  next.pressure = previous.pressure === 'normal' ? 'unknown' : previous.pressure;
  next.recoveryCandidateSince = recoveryCandidateSince;
  return next;
}

/** Resolves the optional-work gate only; user actions and required work bypass this policy. */
export function resolveWorkAdmission(state: WorkAdmissionState): WorkAdmissionDecision {
  if (state.appState !== 'active') {
    return { optionalWorkAllowed: false, maxOptionalConcurrency: 0, reason: 'background' };
  }
  if (state.phase === 'boot') {
    return { optionalWorkAllowed: false, maxOptionalConcurrency: 0, reason: 'journey-not-ready' };
  }
  if (state.pressure === 'severe') {
    return { optionalWorkAllowed: false, maxOptionalConcurrency: 0, reason: 'severe-pressure' };
  }
  if (state.pressure === 'constrained') {
    return {
      optionalWorkAllowed: false,
      maxOptionalConcurrency: 0,
      reason: 'constrained-pressure',
    };
  }

  return {
    optionalWorkAllowed: true,
    maxOptionalConcurrency: PROVISIONAL_MAX_OPTIONAL_CONCURRENCY,
    reason: 'eligible',
  };
}
