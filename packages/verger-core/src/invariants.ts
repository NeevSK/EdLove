import { leverActivation } from './activation';
import type { GovernorSnapshot, LeverSpec } from './types';

/**
 * Verger's invariants as executable checks over published snapshots. They hold for every event
 * stream, every activation and every policy, so they run in property tests over generated
 * streams, over recordings from phones, and in the development lab. They state what a snapshot
 * may never show; they do not restate how the policy decides.
 */

export interface InvariantViolation {
  readonly invariant: string;
  readonly at: number;
  readonly detail: string;
}

/** Checks one snapshot on its own. */
export function checkSnapshot(
  snapshot: GovernorSnapshot,
  levers: readonly LeverSpec[],
): InvariantViolation[] {
  const out: InvariantViolation[] = [];
  const fail = (invariant: string, detail: string) =>
    out.push({ invariant, at: snapshot.at, detail });
  const { activation } = snapshot;

  for (const lever of levers) {
    const level = snapshot.levels[lever.id];
    const proposed = snapshot.proposedLevels[lever.id];
    const baseline = snapshot.baselineLevels[lever.id];
    const mode = leverActivation(activation, lever.id);
    if (level === undefined || proposed === undefined || baseline === undefined) {
      fail('every-lever-published', `${lever.id} missing`);
      continue;
    }
    for (const [name, value] of [
      ['level', level],
      ['proposed', proposed],
      ['baseline', baseline],
    ] as const) {
      if (!Number.isInteger(value) || value < 0 || value > lever.maxLevel)
        fail('levels-in-range', `${lever.id} ${name}=${value} outside 0..${lever.maxLevel}`);
    }
    if (mode === 'off' && (level !== 0 || proposed !== 0 || baseline !== 0))
      fail('off-lever-ungoverned', `${lever.id} level=${level} proposed=${proposed}`);
    if (mode === 'apply' && level !== proposed)
      fail('apply-publishes-decision', `${lever.id} level=${level} proposed=${proposed}`);
    if (mode === 'shadow' && level !== baseline)
      fail('shadow-publishes-baseline', `${lever.id} level=${level} baseline=${baseline}`);
    // A decision starts from the baseline and only lowers from it; static decides nothing more.
    if (proposed < baseline)
      fail('decision-respects-baseline', `${lever.id} proposed=${proposed} baseline=${baseline}`);
    if (activation.decide === 'static' && proposed !== baseline)
      fail('static-is-baseline', `${lever.id} proposed=${proposed} baseline=${baseline}`);
  }

  if (!activation.hardware) {
    if (snapshot.refreshCapHz !== null) fail('hardware-off', `refresh cap ${snapshot.refreshCapHz}`);
    if (snapshot.cpuBoost) fail('hardware-off', 'cpu boost on');
    if (snapshot.globalReducedMotion) fail('hardware-off', 'global reduced motion on');
  }

  // A switched-off sensor leaves nothing behind: what it would have said reads as unknown.
  const sense = activation.sense;
  if (!sense.thermal && snapshot.thermal !== 'unknown')
    fail('deaf-sensor-silent', `thermal ${snapshot.thermal}`);
  if (!sense.frames && snapshot.frameState !== 'quiet')
    fail('deaf-sensor-silent', `frames ${snapshot.frameState}`);
  if (!sense.power && snapshot.powerSaver) fail('deaf-sensor-silent', 'power saver');
  if (!sense.network && Object.values(snapshot.network).some((v) => v !== null))
    fail('deaf-sensor-silent', 'network');
  if (!sense.memory && snapshot.memory !== 'unknown')
    fail('deaf-sensor-silent', `memory ${snapshot.memory}`);
  if (!sense.threads && !sense.longTasks && snapshot.contention !== 'none')
    fail('deaf-sensor-silent', `contention ${snapshot.contention}`);

  if (!Number.isInteger(snapshot.optionalConcurrency) || snapshot.optionalConcurrency < 0)
    fail('admission-in-range', `optional concurrency ${snapshot.optionalConcurrency}`);
  return out;
}

/** Checks a run of published snapshots, in order: each on its own, and each against the last. */
export function checkRun(
  snapshots: readonly GovernorSnapshot[],
  levers: readonly LeverSpec[],
): InvariantViolation[] {
  const out: InvariantViolation[] = [];
  let previous: GovernorSnapshot | null = null;
  for (const snapshot of snapshots) {
    out.push(...checkSnapshot(snapshot, levers));
    if (previous) {
      if (snapshot.at < previous.at)
        out.push({ invariant: 'time-forward', at: snapshot.at, detail: `after ${previous.at}` });
      if (snapshot.version < previous.version)
        out.push({ invariant: 'version-forward', at: snapshot.at, detail: `${snapshot.version} after ${previous.version}` });
      // Under one activation: with reducing off (or static) the loop's own pressure never
      // rises; with growth off (or static) it never eases. Pressure from before a change remains.
      const same = previous.activation === snapshot.activation;
      const { reduce, grow, decide } = snapshot.activation;
      if (same) {
        for (const lever of levers) {
          const before = previous.pressure[lever.id] ?? 0;
          const after = snapshot.pressure[lever.id] ?? 0;
          if (after > before && (!reduce || decide === 'static'))
            out.push({ invariant: 'no-reduction-when-reduce-off', at: snapshot.at, detail: `${lever.id} ${before}->${after}` });
          if (after < before && (!grow || decide === 'static'))
            out.push({ invariant: 'no-growth-when-grow-off', at: snapshot.at, detail: `${lever.id} ${before}->${after}` });
        }
      }
    }
    previous = snapshot;
  }
  return out;
}
