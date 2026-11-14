import { DEFAULT_VERGER_CONFIG } from './config';
import type { MoveRecord } from './outcomes';
import type { LeverTarget } from './types';

/** The default of config `ineffectiveAfterMoves` (one source: the config). */
export const INEFFECTIVE_AFTER_MOVES = DEFAULT_VERGER_CONFIG.ineffectiveAfterMoves;

const TARGETS: ReadonlySet<string> = new Set<LeverTarget>(['gpu', 'cpu', 'memory', 'energy', 'network']);
const isTarget = (account: string): account is LeverTarget => TARGETS.has(account);

export interface IneffectiveFinding {
  readonly lever: string;
  readonly target: LeverTarget;
  /** For the reasons and the lab: the judged moves the finding rests on. */
  readonly notRelieved: number;
}

/**
 * Reads the ledger's judged compressions by pressure and returns each (lever, target) that has
 * failed `after` times without a single relief. Attribution is joint (two levers lowered for one
 * strain share its verdict), so one relief clears a lever: the rule only acts on a lever that
 * never helped. Thermal and storage are not lever targets and are never learned from: heat
 * moves too slowly for a judge window to be fair to a lever.
 */
export function ineffectiveFindings(
  records: readonly MoveRecord[],
  after: number = INEFFECTIVE_AFTER_MOVES,
): IneffectiveFinding[] {
  const tally = new Map<string, { lever: string; target: LeverTarget; failed: number; relieved: number }>();
  for (const record of records) {
    if (record.direction !== 'compress' || record.cause !== 'pressure') continue;
    if (record.verdict !== 'not-relieved' && record.verdict !== 'relieved') continue;
    for (const account of Object.keys(record.accounts)) {
      if (!isTarget(account)) continue;
      const key = `${record.lever}\u0000${account}`;
      const entry = tally.get(key) ?? { lever: record.lever, target: account, failed: 0, relieved: 0 };
      if (record.verdict === 'relieved') entry.relieved += 1;
      else entry.failed += 1;
      tally.set(key, entry);
    }
  }
  return [...tally.values()]
    .filter((entry) => entry.relieved === 0 && entry.failed >= after)
    .map(({ lever, target, failed }) => ({ lever, target, notRelieved: failed }))
    .sort((a, b) => (a.lever + a.target < b.lever + b.target ? -1 : 1));
}
