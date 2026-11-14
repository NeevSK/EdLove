import { describe, expect, it } from 'vitest';
import { LEARNING_MOMENT_RULES } from './learningMoments';
import {
  decideMoment,
  emptyMomentsState,
  type LocalNow,
  type MomentRule,
  type MomentsState,
  recordMoment,
  setRuleOff,
} from './moments';

const rules: readonly MomentRule[] = LEARNING_MOMENT_RULES;
const at = (iso: string, minutes: number, day = '2026-11-14'): LocalNow => ({
  at: iso,
  localDay: day,
  localMinutes: minutes,
});
const morning = at('2026-11-14T03:00:00.000Z', 8 * 60 + 30);
const faded = {
  kind: 'help.faded',
  at: morning.at,
  subject: 'fractions.q7',
  params: { part: 'q7' },
};

const shownThenDismissed = (state: MomentsState, ruleId: string, now: LocalNow, subject?: string) =>
  recordMoment(
    recordMoment(state, { ruleId }, 'shown', now, subject),
    { ruleId },
    'dismissed',
    now,
    subject,
  );

describe('moments', () => {
  it('offers a flow step for a matching signal, passing its parameters', () => {
    expect(decideMoment(faded, rules, emptyMomentsState(), morning).offer).toEqual({
      ruleId: 'moment:help_faded',
      flowId: 'flow:self:claim_growth',
      stepId: 'step:self.claim_growth.offer',
      params: { part: 'q7' },
      audience: 'self',
    });
    expect(
      decideMoment({ kind: 'nothing.known', at: morning.at }, rules, emptyMomentsState(), morning),
    ).toEqual({
      offer: null,
      skipped: [{ ruleId: 'nothing.known', reason: 'no_rule' }],
    });
  });

  it('keeps quiet at night unless the person started it', () => {
    const night = at('2026-11-14T17:00:00.000Z', 22 * 60 + 30);
    expect(decideMoment(faded, rules, emptyMomentsState(), night).skipped).toEqual([
      { ruleId: 'moment:help_faded', reason: 'quiet_hours' },
    ]);
    expect(
      decideMoment({ kind: 'activity.opening', at: night.at }, rules, emptyMomentsState(), night)
        .offer?.ruleId,
    ).toBe('moment:plan_before_activity');
  });

  it('respects the daily limit, the gap between offers and the cooldown per subject', () => {
    let state = recordMoment(
      emptyMomentsState(),
      { ruleId: 'moment:review_due' },
      'shown',
      morning,
    );
    const fiveLater = at('2026-11-14T03:05:00.000Z', 8 * 60 + 35);
    expect(decideMoment(faded, rules, state, fiveLater).skipped[0]?.reason).toBe('too_soon');

    state = recordMoment(
      emptyMomentsState(),
      { ruleId: 'moment:help_faded' },
      'shown',
      morning,
      'fractions.q7',
    );
    const nextDay = at('2026-11-15T03:00:00.000Z', 8 * 60 + 30, '2026-11-15');
    expect(decideMoment(faded, rules, state, nextDay).skipped[0]?.reason).toBe('subject_cooldown');
    expect(
      decideMoment({ ...faded, subject: 'verbs.q2' }, rules, state, nextDay).offer?.ruleId,
    ).toBe('moment:help_faded');

    let busy = emptyMomentsState();
    for (let i = 0; i < 4; i += 1)
      busy = recordMoment(
        busy,
        { ruleId: `moment:other_${i}` },
        'shown',
        at(`2026-11-14T0${i}:00:00.000Z`, i * 60),
      );
    expect(
      decideMoment(faded, rules, busy, at('2026-11-14T05:00:00.000Z', 10 * 60)).skipped[0]?.reason,
    ).toBe('daily_limit');
  });

  it('asks less after repeated dismissals, and again once taken', () => {
    let state = emptyMomentsState();
    for (let day = 1; day <= 3; day += 1) {
      state = shownThenDismissed(
        state,
        'moment:review_due',
        at(`2026-11-0${day}T03:00:00.000Z`, 510, `2026-11-0${day}`),
      );
    }
    const due = { kind: 'review.due', at: morning.at };
    expect(decideMoment(due, rules, state, morning).skipped[0]?.reason).toBe('dismissed_often');
    state = recordMoment(
      state,
      { ruleId: 'moment:review_due' },
      'taken',
      at('2026-11-10T03:00:00.000Z', 510, '2026-11-10'),
    );
    expect(decideMoment(due, rules, state, morning).offer?.ruleId).toBe('moment:review_due');
  });

  it('never offers what the person turned off, or what needs consent they have not given', () => {
    const off = setRuleOff(emptyMomentsState(), 'moment:help_faded', true);
    expect(decideMoment(faded, rules, off, morning).skipped[0]?.reason).toBe('turned_off');
    const shared = { kind: 'growth.shared_with_guardian', at: morning.at };
    expect(decideMoment(shared, rules, emptyMomentsState(), morning).skipped[0]?.reason).toBe(
      'no_consent',
    );
    const consented = { ...emptyMomentsState(), consents: new Set(['share.guardian']) };
    expect(decideMoment(shared, rules, consented, morning).offer?.audience).toBe('guardian');
  });

  it('gives every learning rule a unique moment id', () => {
    const ids = LEARNING_MOMENT_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.startsWith('moment:'))).toBe(true);
  });
});
