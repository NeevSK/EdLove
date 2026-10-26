import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { resolveActivation } from './activation';
import { admitWork, estimateAccounts } from './demand';
import { checkSnapshot } from './invariants';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { LeverSpec, VergerEvent } from './types';
import { FLOORS_ACTIVATION } from './verger';

const PREFETCH: LeverSpec = {
  id: 'prefetch',
  maxLevel: 2,
  visualImpact: 'low',
  target: 'energy',
  alsoRelieves: ['network'],
  ambient: false,
  motion: false,
  levels: ['prefetch', 'on idle', 'none'],
  whenDataBudgetSpent: 2,
};
const LEVERS = [...SAMPLE_LEVERS, PREFETCH];

function after(events: readonly VergerEvent[], policy = VERGER_POLICY, activation = FLOORS_ACTIVATION) {
  let state = policy.create({ at: 0, levers: LEVERS, activation });
  for (const event of events) state = policy.reduce(state, event);
  return policy.snapshot(state);
}

const budget = (at: number, state: 'within' | 'spent' | 'unknown'): VergerEvent => ({ type: 'data-budget', at, state });

describe('the data budget as a limit (B3.2)', () => {
  it('a spent budget holds the lever that declares it, with only the floors running, and is published', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      const spent = after([budget(10, 'spent')], policy);
      expect(spent.dataBudget).toBe('spent');
      expect(spent.levels.prefetch).toBe(2);
      expect(spent.envelope.prefetch?.limit).toBe(2);
      expect(checkSnapshot(spent, LEVERS)).toEqual([]);
    }
  });

  it('unknown is never a limit, and a new reading lifts the hold (a new day is the host reporting within)', () => {
    expect(after([]).levels.prefetch).toBe(0);
    expect(after([budget(10, 'unknown')]).levels.prefetch).toBe(0);
    expect(after([budget(10, 'spent'), budget(20, 'within')]).levels.prefetch).toBe(0);
  });

  it('a deaf network sensor hears no budget, and switching it off forgets the last one', () => {
    const deaf = resolveActivation(FLOORS_ACTIVATION, { sense: { network: false } });
    const unheard = after([budget(10, 'spent')], VERGER_POLICY, deaf);
    expect(unheard.dataBudget).toBe('unknown');
    expect(unheard.levels.prefetch).toBe(0);
    const forgotten = after([budget(10, 'spent'), { type: 'activation', at: 20, activation: deaf }]);
    expect(forgotten.dataBudget).toBe('unknown');
    expect(checkSnapshot(forgotten, LEVERS)).toEqual([]);
  });

  it('a spent budget holds deferrable network work from the snapshot alone, never critical work; the network account reads it', () => {
    const spent = after([
      { type: 'network', at: 5, transport: 'cellular', validated: true, metered: true, downKbps: 5000, dataSaver: 'disabled' },
      budget(10, 'spent'),
    ]);
    expect(admitWork(spent, { class: 'deferrable', spends: ['network'] })).toEqual({ admit: false, reason: 'data-budget-spent' });
    expect(admitWork(spent, { class: 'critical', spends: ['network'] }).admit).toBe(true);
    expect(admitWork(spent, { class: 'deferrable', spends: ['cpu'] }).admit).toBe(true);
    expect(estimateAccounts(spent, UNKNOWN_CAPACITY).network).toMatchObject({ state: 'overdrawn' });
  });
});
