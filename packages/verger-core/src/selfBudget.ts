import type { ActivationPatch } from './activation';
import type { SelfCost } from './selfCost';

/**
 * Verger's budget for itself (D4, the doctrine's "reduce itself"): the share of time it may
 * spend deciding, judged over a window. A host chair, unset by default: measure on a phone
 * first (D3). Over budget, verger first stops its costliest optional sensing, the contention
 * sensors (per-thread CPU and long tasks: the native sampler and the event stream it feeds),
 * then, still over, hands the session to the floors. It never escalates back within a session.
 */
export interface SelfBudget {
  /** Reducer time over the window, e.g. 0.002 for 0.2%. */
  readonly maxDutyRatio: number;
  /** How long a window lasts; each window over budget takes one step. */
  readonly windowMs: number;
}

export type SelfBudgetStage = 'within' | 'shed' | 'floors';

/** What the `shed` stage switches off. */
export const SELF_BUDGET_SHED: ActivationPatch = { sense: { threads: false, longTasks: false } };

export interface SelfBudgetGuard {
  /** Reads the meter; returns the stage, which only ever rises. */
  check(cost: SelfCost, at: number): SelfBudgetStage;
  readonly stage: SelfBudgetStage;
  /** The last finished window's duty ratio, for reports. */
  readonly lastDutyRatio: number | null;
}

const NEXT: Readonly<Record<SelfBudgetStage, SelfBudgetStage>> = {
  within: 'shed',
  shed: 'floors',
  floors: 'floors',
};

export function createSelfBudgetGuard(budget: SelfBudget, startAt: number): SelfBudgetGuard {
  if (!(budget.maxDutyRatio > 0) || !(budget.windowMs > 0))
    throw new Error('A self budget needs a positive duty ratio and window');
  let stage: SelfBudgetStage = 'within';
  let windowStart = startAt;
  let windowTotal = 0;
  let lastDutyRatio: number | null = null;
  return {
    check(cost, at) {
      const span = at - windowStart;
      if (span < budget.windowMs || stage === 'floors') return stage;
      const duty = Math.max(0, cost.reduceTotalMs - windowTotal) / span;
      lastDutyRatio = duty;
      if (duty > budget.maxDutyRatio) stage = NEXT[stage];
      windowStart = at;
      windowTotal = cost.reduceTotalMs;
      return stage;
    },
    get stage() {
      return stage;
    },
    get lastDutyRatio() {
      return lastDutyRatio;
    },
  };
}
