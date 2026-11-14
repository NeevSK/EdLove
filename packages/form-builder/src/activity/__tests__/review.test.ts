import { describe, expect, it } from 'vitest';
import { createFsrsScheduler } from '../fsrsReview.adapter';
import { type AttemptStep, appendStep, type Journal } from '../journal';
import {
  dueItems,
  gradesFromAttempt,
  type ReviewQueue,
  type ReviewScheduler,
  recordReviews,
} from '../review';

const at = '2026-11-14T03:00:00.000Z';
const journalOf = (steps: AttemptStep[]): Journal =>
  steps.reduce<Journal>((j, s) => appendStep(j, s), []);

describe('grades from an attempt', () => {
  it('grades by correctness, help and confidence, and never infers easy', () => {
    const journal = journalOf([
      { id: '1', at, kind: 'answered', part: 'alone', response: 'a' },
      { id: '2', at, kind: 'helped', part: 'helped', assistance: 'hint', level: 1 },
      { id: '3', at, kind: 'answered', part: 'helped', response: 'b' },
      { id: '4', at, kind: 'confidence', part: 'unsure', level: 'guessing' },
      { id: '5', at, kind: 'answered', part: 'unsure', response: 'c' },
      { id: '6', at, kind: 'answered', part: 'wrong', response: 'd' },
    ]);
    const correct = new Map([
      ['alone', true],
      ['helped', true],
      ['unsure', true],
      ['wrong', false],
    ]);
    expect(Object.fromEntries(gradesFromAttempt(journal, correct))).toEqual({
      alone: 'good',
      helped: 'hard',
      unsure: 'hard',
      wrong: 'again',
    });
  });
});

// A tiny scheduler for the queue's own rules: again → 1 day, hard → 2, good → 4, easy → 8.
type FakeCard = { readonly dueAt: number; readonly reps: number };
const DAY = 86_400_000;
const fake: ReviewScheduler<FakeCard> = {
  newCard: (now) => ({ dueAt: now.getTime(), reps: 0 }),
  review: (card, grade, now) => ({
    dueAt: now.getTime() + { again: 1, hard: 2, good: 4, easy: 8 }[grade] * DAY,
    reps: card.reps + 1,
  }),
  dueAt: (card) => new Date(card.dueAt),
};

describe('review queue', () => {
  const now = new Date('2026-11-14T00:00:00.000Z');
  const topics: Record<string, string> = {
    a1: 'fractions',
    a2: 'fractions',
    a3: 'fractions',
    b1: 'verbs',
    c1: 'planets',
  };
  const itemOf = (part: string) =>
    topics[part] === undefined ? undefined : { itemId: part, topic: topics[part] ?? '' };

  it('schedules what was practised and skips parts with no item', () => {
    const queue = recordReviews(
      new Map(),
      new Map([
        ['a1', 'good'],
        ['unknown', 'again'],
      ] as const),
      itemOf,
      fake,
      now,
    );
    expect([...queue.keys()]).toEqual(['a1']);
    expect(queue.get('a1')?.card).toEqual({ dueAt: now.getTime() + 4 * DAY, reps: 1 });
  });

  it('offers only what is due, mixing topics instead of blocks', () => {
    let queue: ReviewQueue<FakeCard> = new Map();
    queue = recordReviews(
      queue,
      new Map([
        ['a1', 'again'],
        ['a2', 'again'],
        ['a3', 'again'],
        ['b1', 'again'],
        ['c1', 'good'],
      ] as const),
      itemOf,
      fake,
      now,
    );
    const tomorrow = new Date(now.getTime() + DAY);
    const due = dueItems(queue, fake, tomorrow, 10).map((i) => i.itemId);
    expect(due).toEqual(['a1', 'b1', 'a2', 'a3']);
    expect(dueItems(queue, fake, tomorrow, 2).map((i) => i.itemId)).toEqual(['a1', 'b1']);
    expect(dueItems(queue, fake, now, 10)).toEqual([]);
  });
});

describe('FSRS adapter', () => {
  it('spaces a remembered item further out than a forgotten one', async () => {
    const scheduler = await createFsrsScheduler({ fuzz: false });
    const now = new Date('2026-11-14T00:00:00.000Z');
    const forgot = scheduler.review(scheduler.newCard(now), 'again', now);
    const knew = scheduler.review(scheduler.newCard(now), 'good', now);
    expect(scheduler.dueAt(knew).getTime()).toBeGreaterThan(scheduler.dueAt(forgot).getTime());
    expect(scheduler.dueAt(forgot).getTime()).toBeGreaterThan(now.getTime());
  });
});
