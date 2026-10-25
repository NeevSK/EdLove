import { type ActivationPatch, parseActivationPatch, type VergerActivation } from './activation';
import { validateConfig } from './config';
import { type AccountReading, estimateAccounts, type ResourceAccount } from './demand';
import { type OutcomeSummary, outcomeAttributes } from './outcomes';
import { qualityCost } from './quality';
import { UNKNOWN_CAPACITY } from './reducer';
import type { LaunchPlan } from './recovery';
import type { SelfCost } from './selfCost';
import type { CapacityFacts, LeverSpec, LeverTarget, VergerConfig, VergerSnapshot } from './types';
import type { Verger } from './verger';

/** One lever as the lab shows it: where it is, what it proposes, and its envelope. */
export interface LabLever {
  readonly id: string;
  readonly level: number;
  readonly proposed: number;
  readonly maxLevel: number;
  /** Its envelope (a higher level is less quality): limit ≤ ceiling ≤ home ≤ floor. */
  readonly limit: number;
  readonly ceiling: number;
  readonly home: number;
  readonly floor: number;
  /** Steps owned by measured pressure, not by limits. */
  readonly pressure: number;
  /** Targets loop 2 proved it does not relieve this session (p5). */
  readonly ineffective: readonly LeverTarget[];
}

/**
 * Everything the dev lab shows (D2), in one plain value: what may run, what verger reads and
 * decides, how its moves turned out, and what it costs. Built from the public `Verger`, so the
 * lab sees exactly what the app sees.
 */
export interface LabReport {
  readonly running: boolean;
  readonly plan: LaunchPlan | null;
  readonly activation: VergerActivation | null;
  readonly snapshot: VergerSnapshot | null;
  readonly levers: readonly LabLever[];
  readonly accounts: Readonly<Record<ResourceAccount, AccountReading>> | null;
  /** Quality given up now (0 full, 1 every lever at its cheapest), applied and proposed. */
  readonly qualityCost: { readonly applied: number; readonly proposed: number } | null;
  readonly outcomes: OutcomeSummary | null;
  readonly outcomeTotals: Readonly<Record<string, string | number>> | null;
  readonly selfCost: SelfCost | null;
  /** Events held by the session recording, or null when not recording. */
  readonly recorded: number | null;
}

export function labReport(
  verger: Verger,
  levers: readonly LeverSpec[],
  capacity: CapacityFacts = UNKNOWN_CAPACITY,
): LabReport {
  const snapshot = verger.getSnapshot();
  const outcomes = verger.outcomes();
  const recording = verger.recording();
  return {
    running: verger.activation !== null,
    plan: verger.plan,
    activation: verger.activation,
    snapshot,
    levers: snapshot
      ? levers.map((lever) => {
          const envelope = snapshot.envelope[lever.id];
          return {
            id: lever.id,
            level: snapshot.levels[lever.id] ?? 0,
            proposed: snapshot.proposedLevels[lever.id] ?? 0,
            maxLevel: lever.maxLevel,
            limit: envelope?.limit ?? 0,
            ceiling: envelope?.ceiling ?? 0,
            home: envelope?.home ?? 0,
            floor: envelope?.floor ?? lever.maxLevel,
            pressure: snapshot.pressure[lever.id] ?? 0,
            ineffective: snapshot.ineffective[lever.id] ?? [],
          };
        })
      : [],
    accounts: snapshot ? estimateAccounts(snapshot, capacity) : null,
    qualityCost: snapshot
      ? {
          applied: qualityCost(snapshot.levels, levers),
          proposed: qualityCost(snapshot.proposedLevels, levers),
        }
      : null,
    outcomes: outcomes?.summary ?? null,
    outcomeTotals: outcomes ? outcomeAttributes(outcomes.summary) : null,
    selfCost: verger.selfCost(),
    recorded: recording ? recording.events.length : null,
  };
}

/** What a lab control did: applied, or the reason it was refused (shown, never swallowed). */
export type LabResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

/**
 * Applies an activation patch typed in the lab (JSON text), live. The same strict parser as
 * remote config: a malformed patch is refused whole. `null` text (empty) returns to the launch's.
 */
export function labConfigure(
  verger: Verger,
  levers: readonly LeverSpec[],
  text: string,
): LabResult & { readonly patch?: ActivationPatch | null } {
  if (verger.activation === null) return { ok: false, error: 'verger is not running' };
  if (text.trim() === '') {
    verger.configure(null);
    return { ok: true, patch: null };
  }
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: `not JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
  const parsed = parseActivationPatch(input, levers);
  if ('error' in parsed) return { ok: false, error: parsed.error };
  verger.configure(parsed.patch);
  return { ok: true, patch: parsed.patch };
}

/**
 * Applies a threshold patch typed in the lab (JSON object of numbers) over the host's config,
 * validated first. Empty text returns to the host's config.
 */
export function labTune(verger: Verger, base: VergerConfig, text: string): LabResult {
  if (verger.activation === null) return { ok: false, error: 'verger is not running' };
  if (text.trim() === '') {
    verger.tune(null);
    return { ok: true };
  }
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: `not JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    return { ok: false, error: 'a config patch is an object of thresholds' };
  const isThreshold = (key: string): key is keyof VergerConfig => key in base;
  const patch: Partial<Record<keyof VergerConfig, number>> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!isThreshold(key)) return { ok: false, error: `unknown threshold "${key}"` };
    if (typeof value !== 'number') return { ok: false, error: `"${key}" must be a number` };
    patch[key] = value;
  }
  try {
    validateConfig({ ...base, ...patch });
    verger.tune(patch);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
