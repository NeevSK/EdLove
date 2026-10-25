import {
  type AccountReading,
  accountsRelievedBy,
  type AccountState,
  estimateAccounts,
  RESOURCE_ACCOUNTS,
  type ResourceAccount,
} from './demand';
import { DEFAULT_VERGER_CONFIG } from './config';
import { qualityCost } from './quality';
import type { CapacityFacts, VergerConfig, VergerSnapshot, LeverSpec } from './types';

/**
 * The outcome ledger: loop 2's eyes on loop 1. It watches published snapshots, of any policy,
 * and judges every move a lever makes: did a compress relieve the account it was for, did an
 * expand hold, how fast was relief (Odyssey's agility), and what quality it cost (joint
 * evaluation). It decides nothing; rules and reports read it.
 *
 * Exactness: snapshots are published whenever any output changes, and accounts derive only
 * from outputs, so the state is constant between snapshots, and judging at the next snapshot
 * (or at `settle`) gives the verdict as of each deadline.
 *
 * Strain is read from the snapshot that carries the move: heat arriving and a lever dropping
 * are one reduction, so the previous snapshot would not yet show the strain.
 *
 * Attribution is joint: when two levers were lowered for one strain, both are credited when it
 * eases. The ledger cannot separate them without an experiment, and does not pretend to.
 */

export type MoveDirection = 'compress' | 'expand';
/** `pressure`: the policy's own response to strain. `floor`: a setting, visibility or idleness. */
export type MoveCause = 'pressure' | 'floor';
export type Verdict = 'pending' | 'relieved' | 'not-relieved' | 'held' | 'withdrawn' | 'unjudged';

export interface MoveRecord {
  readonly lever: string;
  readonly direction: MoveDirection;
  readonly from: number;
  readonly to: number;
  readonly at: number;
  readonly cause: MoveCause;
  /** For a compress, the strained accounts this lever relieves, and how strained each was. */
  readonly accounts: Readonly<Partial<Record<ResourceAccount, AccountState>>>;
  readonly reason: string;
  readonly verdict: Verdict;
  readonly judgedAt: number | null;
  /** From the strain's onset to relief, for a relieved compress. */
  readonly agilityMs: number | null;
  /** Change in quality given up, as a share of the whole app: positive for a compress. */
  readonly qualityDelta: number;
}

export interface LeverOutcomes {
  readonly relieved: number;
  readonly notRelieved: number;
  /** Compresses by pressure with no strained account this lever relieves: nothing to judge. */
  readonly unjudged: number;
  readonly held: number;
  readonly withdrawn: number;
  /** Moves caused by floors (settings, visibility, idleness): counted, not judged. */
  readonly floorMoves: number;
  readonly agilityCount: number;
  readonly agilityTotalMs: number;
  readonly agilityWorstMs: number;
}

export interface OutcomeSummary {
  readonly levers: Readonly<Record<string, LeverOutcomes>>;
  readonly pending: number;
}

export interface OutcomeLedger {
  observe(snapshot: VergerSnapshot): void;
  /** Judges every move whose window has closed by `at`. */
  settle(at: number): void;
  /** The most recent moves by pressure, judged and pending, oldest first. */
  records(): readonly MoveRecord[];
  summary(): OutcomeSummary;
}

export interface OutcomeLedgerOptions {
  readonly levers: readonly LeverSpec[];
  readonly capacity: CapacityFacts;
  /** How long a compress has to relieve its account; config `outcomeJudgeWindowMs` by default. */
  readonly judgeWindowMs?: number;
  /** How long an expand must last without being pushed back; config `outcomeHoldWindowMs`. */
  readonly holdWindowMs?: number;
  readonly maxRecords?: number;
  /** The host's thresholds, so accounts are read as the policy reads them. */
  readonly config?: Partial<
    Pick<
      VergerConfig,
      'batteryLowPercent' | 'outcomeJudgeWindowMs' | 'outcomeHoldWindowMs' | 'thermalDwellMs'
    >
  >;
  /** Called once per move as its verdict is reached (the flight recorder's evidence). */
  readonly onJudged?: (record: MoveRecord) => void;
}

// One source for each window: the config's defaults.
export const DEFAULT_JUDGE_WINDOW_MS = DEFAULT_VERGER_CONFIG.outcomeJudgeWindowMs;
export const DEFAULT_HOLD_WINDOW_MS = DEFAULT_VERGER_CONFIG.outcomeHoldWindowMs;
const DEFAULT_MAX_RECORDS = 64;

const RANK: Record<AccountState, number> = { unknown: -1, ample: 0, tight: 1, overdrawn: 2 };
const strained = (state: AccountState) => state === 'tight' || state === 'overdrawn';

const EMPTY: LeverOutcomes = {
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

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export function createOutcomeLedger(options: OutcomeLedgerOptions): OutcomeLedger {
  const { levers, capacity } = options;
  const judgeWindowMs =
    options.judgeWindowMs ?? options.config?.outcomeJudgeWindowMs ?? DEFAULT_JUDGE_WINDOW_MS;
  const holdWindowMs =
    options.holdWindowMs ?? options.config?.outcomeHoldWindowMs ?? DEFAULT_HOLD_WINDOW_MS;
  // Heat steps down only after the thermal dwell (P4), so a compress that relieves heat cannot
  // show it sooner: its window is the dwell longer.
  const thermalDwellMs = options.config?.thermalDwellMs ?? DEFAULT_VERGER_CONFIG.thermalDwellMs;
  const windowOf = (record: MoveRecord) =>
    judgeWindowMs + (record.accounts.thermal !== undefined ? thermalDwellMs : 0);
  const readingConfig = { batteryLowPercent: options.config?.batteryLowPercent ?? DEFAULT_VERGER_CONFIG.batteryLowPercent };
  const maxRecords = options.maxRecords ?? DEFAULT_MAX_RECORDS;
  const relieves = new Map(levers.map((lever) => [lever.id, accountsRelievedBy(lever)]));

  let previous: VergerSnapshot | null = null;
  let previousReadings: Readonly<Record<ResourceAccount, AccountReading>> | null = null;
  /** When each account last went from ample or unknown into strain. */
  const onset = new Map<ResourceAccount, number>();
  const records: Mutable<MoveRecord>[] = [];
  const totals = new Map<string, Mutable<LeverOutcomes>>();

  const tally = (lever: string): Mutable<LeverOutcomes> => {
    const existing = totals.get(lever);
    if (existing) return existing;
    const created = { ...EMPTY };
    totals.set(lever, created);
    return created;
  };

  const judge = (record: Mutable<MoveRecord>, verdict: Verdict, at: number) => {
    record.verdict = verdict;
    record.judgedAt = at;
    const t = tally(record.lever);
    switch (verdict) {
      case 'relieved':
        t.relieved += 1;
        if (record.agilityMs !== null) {
          t.agilityCount += 1;
          t.agilityTotalMs += record.agilityMs;
          t.agilityWorstMs = Math.max(t.agilityWorstMs, record.agilityMs);
        }
        break;
      case 'not-relieved':
        t.notRelieved += 1;
        break;
      case 'held':
        t.held += 1;
        break;
      case 'withdrawn':
        t.withdrawn += 1;
        break;
      case 'unjudged':
        t.unjudged += 1;
        break;
      case 'pending':
        break;
    }
    if (verdict !== 'pending' && options.onJudged) {
      const notify = options.onJudged;
      const copy = { ...record };
      try {
        notify(copy);
      } catch (error) {
        console.error('[verger] outcome observer failed', error);
      }
    }
  };

  /** Closes every window that ended by `at`; the state since the last snapshot held throughout. */
  const settle = (at: number) => {
    for (const record of records) {
      if (record.verdict !== 'pending') continue;
      if (record.direction === 'compress' && at - record.at >= windowOf(record)) {
        judge(record, 'not-relieved', record.at + windowOf(record));
      } else if (record.direction === 'expand' && at - record.at >= holdWindowMs) {
        judge(record, 'held', record.at + holdWindowMs);
      }
    }
  };

  const loopOwned = (snapshot: VergerSnapshot, id: string) =>
    (snapshot.pressure[id] ?? 0) + (snapshot.priorHeld[id] ?? 0);

  return {
    observe(snapshot) {
      // Windows that closed before this snapshot are judged on the state that held until now.
      settle(snapshot.at);
      const readings = estimateAccounts(snapshot, capacity, readingConfig);
      const stateOf = (account: ResourceAccount): AccountState => readings[account].state;

      // Relief first, while each strain's onset is still known: a pending compress whose
      // account is less strained than at its move.
      for (const record of records) {
        if (record.verdict !== 'pending' || record.direction !== 'compress') continue;
        const eased = RESOURCE_ACCOUNTS.find((account) => {
          const then = record.accounts[account];
          const now = stateOf(account);
          return then !== undefined && now !== 'unknown' && RANK[now] < RANK[then];
        });
        if (eased !== undefined) {
          record.agilityMs = snapshot.at - (onset.get(eased) ?? record.at);
          judge(record, 'relieved', snapshot.at);
        }
      }

      for (const account of RESOURCE_ACCOUNTS) {
        const now = stateOf(account);
        const was = previousReadings?.[account].state ?? 'unknown';
        if (strained(now) && !strained(was)) onset.set(account, snapshot.at);
        if (!strained(now)) onset.delete(account);
      }

      if (previous) {
        const before = previous;
        for (const lever of levers) {
          const from = before.levels[lever.id] ?? 0;
          const to = snapshot.levels[lever.id] ?? 0;
          if (from === to) continue;
          const direction: MoveDirection = to > from ? 'compress' : 'expand';
          const ownBefore = loopOwned(before, lever.id);
          const ownAfter = loopOwned(snapshot, lever.id);
          // A lowering held back by a gesture (invariant 7) is published after the loop's pressure
          // already rose, so a compress is the loop's whenever the loop owns more than the level it
          // left, not only when its ownership rose in this very snapshot.
          const byPressure =
            direction === 'compress' ? ownAfter > ownBefore || ownAfter > from : ownAfter < ownBefore;
          if (!byPressure) {
            tally(lever.id).floorMoves += 1;
            continue;
          }
          if (direction === 'compress') {
            for (const record of records) {
              if (
                record.lever === lever.id &&
                record.direction === 'expand' &&
                record.verdict === 'pending'
              )
                judge(record, 'withdrawn', snapshot.at);
            }
          }
          const accounts: Partial<Record<ResourceAccount, AccountState>> = {};
          if (direction === 'compress') {
            for (const account of relieves.get(lever.id) ?? []) {
              const state = stateOf(account);
              if (strained(state)) accounts[account] = state;
            }
          }
          const record: Mutable<MoveRecord> = {
            lever: lever.id,
            direction,
            from,
            to,
            at: snapshot.at,
            cause: 'pressure',
            accounts,
            reason: snapshot.lastReason,
            verdict: 'pending',
            judgedAt: null,
            agilityMs: null,
            qualityDelta:
              qualityCost({ ...before.levels, [lever.id]: to }, levers) -
              qualityCost({ ...before.levels, [lever.id]: from }, levers),
          };
          if (direction === 'compress' && Object.keys(accounts).length === 0)
            judge(record, 'unjudged', snapshot.at);
          records.push(record);
        }
      }

      // Bounded: drop the oldest judged record first; pending ones are dropped only if all are.
      while (records.length > maxRecords) {
        const index = records.findIndex((r) => r.verdict !== 'pending');
        records.splice(index === -1 ? 0 : index, 1);
      }
      previous = snapshot;
      previousReadings = readings;
    },
    settle,
    records: () => records.map((record) => ({ ...record })),
    summary() {
      const levelsOut: Record<string, LeverOutcomes> = {};
      for (const [id, t] of totals) levelsOut[id] = { ...t };
      return { levers: levelsOut, pending: records.filter((r) => r.verdict === 'pending').length };
    },
  };
}

/**
 * A session's outcomes as telemetry attributes (stage 5 into stage 8): totals across levers and
 * the lever that most often failed to relieve, so field data shows whether verger's moves help.
 * Codes and counts only.
 */
export function outcomeAttributes(summary: OutcomeSummary): Record<string, string | number> {
  let relieved = 0;
  let notRelieved = 0;
  let unjudged = 0;
  let held = 0;
  let withdrawn = 0;
  let floorMoves = 0;
  let agilityCount = 0;
  let agilityTotalMs = 0;
  let agilityWorstMs = 0;
  let worstLever = '-';
  let worstFailures = 0;
  // In id order, so the worst lever is the first among equals, the same on every phone.
  const entries = Object.entries(summary.levers).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [id, t] of entries) {
    relieved += t.relieved;
    notRelieved += t.notRelieved;
    unjudged += t.unjudged;
    held += t.held;
    withdrawn += t.withdrawn;
    floorMoves += t.floorMoves;
    agilityCount += t.agilityCount;
    agilityTotalMs += t.agilityTotalMs;
    agilityWorstMs = Math.max(agilityWorstMs, t.agilityWorstMs);
    if (t.notRelieved > worstFailures) {
      worstFailures = t.notRelieved;
      worstLever = id;
    }
  }
  return {
    relieved,
    not_relieved: notRelieved,
    unjudged,
    held,
    withdrawn,
    floor_moves: floorMoves,
    pending: summary.pending,
    agility_mean_ms: agilityCount > 0 ? Math.round(agilityTotalMs / agilityCount) : 0,
    agility_worst_ms: Math.round(agilityWorstMs),
    worst_lever: worstLever,
  };
}

/** One judged move as a flight-recorder line: `seconds|judged|lever|verdict|accounts`. */
export function verdictLine(record: MoveRecord, sessionStartAt: number): string {
  const at = record.judgedAt ?? record.at;
  const seconds = Math.max(0, Math.round((at - sessionStartAt) / 100) / 10);
  const accounts = Object.keys(record.accounts).sort().join(',') || '-';
  return [seconds, 'judged', record.lever, record.verdict, accounts].join('|');
}
