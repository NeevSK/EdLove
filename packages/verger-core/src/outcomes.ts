import {
  type AccountReading,
  type AccountState,
  estimateAccounts,
  RESOURCE_ACCOUNTS,
  type ResourceAccount,
} from './demand';
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
  /** How long a compress has to relieve its account. */
  readonly judgeWindowMs?: number;
  /** How long an expand must last without being pushed back by pressure. */
  readonly holdWindowMs?: number;
  readonly maxRecords?: number;
  /** The host's thresholds, so accounts are read as the policy reads them. */
  readonly config?: Pick<VergerConfig, 'batteryLowPercent'>;
}

export const DEFAULT_JUDGE_WINDOW_MS = 5_000;
export const DEFAULT_HOLD_WINDOW_MS = 10_000;
const DEFAULT_MAX_RECORDS = 64;

const RANK: Record<AccountState, number> = { unknown: -1, ample: 0, tight: 1, overdrawn: 2 };
const strained = (state: AccountState) => state === 'tight' || state === 'overdrawn';

/**
 * The accounts a lever relieves, as the lever declares them (animation levers declare CPU: the
 * UI thread drives every frame). Easing any compute or energy load also eases heat.
 */
export function accountsRelievedBy(lever: LeverSpec): ResourceAccount[] {
  const targets = new Set<ResourceAccount>([lever.target, ...(lever.alsoRelieves ?? [])]);
  if (targets.has('gpu') || targets.has('cpu') || targets.has('energy')) targets.add('thermal');
  return [...targets];
}

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
  const judgeWindowMs = options.judgeWindowMs ?? DEFAULT_JUDGE_WINDOW_MS;
  const holdWindowMs = options.holdWindowMs ?? DEFAULT_HOLD_WINDOW_MS;
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
  };

  /** Closes every window that ended by `at`; the state since the last snapshot held throughout. */
  const settle = (at: number) => {
    for (const record of records) {
      if (record.verdict !== 'pending') continue;
      if (record.direction === 'compress' && at - record.at >= judgeWindowMs) {
        judge(record, 'not-relieved', record.at + judgeWindowMs);
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
      const readings = estimateAccounts(snapshot, capacity, options.config);
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
          const byPressure = direction === 'compress' ? ownAfter > ownBefore : ownAfter < ownBefore;
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
