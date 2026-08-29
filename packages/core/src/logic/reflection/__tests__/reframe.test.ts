import { describe, expect, it } from 'vitest';
import { deriveReframeOutcome, isFollowUpDue } from '../reframe';
import type { ThoughtRecord } from '../types';

const baseRecord: ThoughtRecord = {
  id: 'r1',
  userId: 'u1',
  preMood: 2,
  automaticThought: 'I always fail exams',
  emotion: 'anxious',
  intensity: 8,
  trapIds: ['catastrophizing'],
  evidence: { forThought: 'one bad mark', againstThought: 'I passed last term' },
  reframedThought: 'One result does not define me',
  postMood: 4,
  postOutcome: 'better',
  createdAt: '2026-08-27T10:00:00.000Z',
  completedAt: '2026-08-27T10:15:00.000Z',
};

describe('deriveReframeOutcome', () => {
  it('returns better when post exceeds pre', () => {
    expect(deriveReframeOutcome(2, 4)).toBe('better');
  });

  it('returns worse when post is below pre', () => {
    expect(deriveReframeOutcome(4, 2)).toBe('worse');
  });

  it('returns same when equal', () => {
    expect(deriveReframeOutcome(3, 3)).toBe('same');
  });
});

describe('isFollowUpDue', () => {
  it('is due when the due date has passed', () => {
    const record: ThoughtRecord = {
      ...baseRecord,
      followUp: { dueAt: '2026-08-20T00:00:00.000Z' },
    };
    expect(isFollowUpDue(record, new Date('2026-08-27T00:00:00.000Z').getTime())).toBe(true);
  });

  it('is not due before the due date', () => {
    const record: ThoughtRecord = {
      ...baseRecord,
      followUp: { dueAt: '2026-09-01T00:00:00.000Z' },
    };
    expect(isFollowUpDue(record, new Date('2026-08-27T00:00:00.000Z').getTime())).toBe(false);
  });

  it('is not due once completed', () => {
    const record: ThoughtRecord = {
      ...baseRecord,
      followUp: {
        dueAt: '2026-08-20T00:00:00.000Z',
        completedAt: '2026-08-21T00:00:00.000Z',
      },
    };
    expect(isFollowUpDue(record)).toBe(false);
  });

  it('is never due without a scheduled follow-up', () => {
    expect(isFollowUpDue(baseRecord)).toBe(false);
  });

  it('treats an unparseable due date as not due', () => {
    const record: ThoughtRecord = { ...baseRecord, followUp: { dueAt: 'not-a-date' } };
    expect(isFollowUpDue(record)).toBe(false);
  });
});
