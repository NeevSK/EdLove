import { qualityCost } from './quality';
import type { CreateVergerStateOptions } from './reducer';
import { replayVerger } from './replay';
import type { VergerPolicy } from './policy';
import type { VergerEvent, VergerSnapshot } from './types';

export interface PolicyReport {
  /** Time the snapshot showed strain: frames stressed, heat hot or critical, or memory low. */
  readonly strainMs: number;
  /** Time-weighted mean quality given up (0 to 1, `qualityCost`) over the whole span. */
  readonly qualityGivenUp: number;
  /** Quality given up while nothing was strained: the waste a better policy returns. */
  readonly qualityGivenUpCalm: number;
  /** The most quality given up at any point. */
  readonly worstQuality: number;
  /** Lever level changes: fewer is steadier for the user. */
  readonly moves: number;
  readonly spanMs: number;
}

function strained(snapshot: VergerSnapshot): boolean {
  return (
    snapshot.frameState === 'stressed' ||
    snapshot.thermal === 'hot' ||
    snapshot.thermal === 'critical' ||
    snapshot.memory === 'low'
  );
}

function movesBetween(a: VergerSnapshot, b: VergerSnapshot): number {
  let moves = 0;
  for (const id of Object.keys(b.levels)) if ((a.levels[id] ?? 0) !== b.levels[id]) moves += 1;
  return moves;
}

/**
 * Replays one event stream through each policy and reports strain, quality given up and moves
 * side by side: loop 3's evidence for choosing a default policy. Replay is open loop: every
 * policy sees the same disturbances, so this compares decisions, not their effects (a policy
 * that lowered a lever would, on a phone, have seen fewer stressed frames). Strain is therefore
 * mostly the same across policies; the telling figures are quality given up while calm and moves.
 * The span runs from the first event to `until` (default: the last event).
 */
export function comparePolicies(
  options: CreateVergerStateOptions,
  events: readonly VergerEvent[],
  policies: Readonly<Record<string, VergerPolicy>>,
  until?: number,
): Record<string, PolicyReport> {
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const end = until ?? sorted[sorted.length - 1]?.at ?? options.at;
  const reports: Record<string, PolicyReport> = {};
  for (const [name, policy] of Object.entries(policies)) {
    const { snapshots } = replayVerger(options, sorted, policy);
    let strainMs = 0;
    let lost = 0;
    let lostCalm = 0;
    let calmMs = 0;
    let worst = 0;
    let moves = 0;
    const start = snapshots[0]?.at ?? end;
    snapshots.forEach((snapshot, index) => {
      const next = snapshots[index + 1];
      const dt = Math.max(0, Math.min(next?.at ?? end, end) - snapshot.at);
      const cost = qualityCost(snapshot.levels, options.levers);
      worst = Math.max(worst, cost);
      lost += cost * dt;
      if (strained(snapshot)) strainMs += dt;
      else {
        calmMs += dt;
        lostCalm += cost * dt;
      }
      if (next) moves += movesBetween(snapshot, next);
    });
    const spanMs = Math.max(0, end - start);
    reports[name] = {
      strainMs,
      qualityGivenUp: spanMs > 0 ? lost / spanMs : 0,
      qualityGivenUpCalm: calmMs > 0 ? lostCalm / calmMs : 0,
      worstQuality: worst,
      moves,
      spanMs,
    };
  }
  return reports;
}
