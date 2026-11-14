import { DefaultScheduler, type Grade as FsrsGrade, Rating } from 'ts-fsrs';
import type { Grade, ReviewScheduler } from './review';

/**
 * FSRS for the review queue, through ts-fsrs 6 (FSRS-7 by default). Checked against the
 * installed package on 14 Nov 2026: `DefaultScheduler()` is async; `newCard({ now })` and
 * `review({ card, grade, now })` return new plain objects without changing their input, with
 * `dueAt` on the card.
 */

// Pinning the model version narrows the card to one shape, so `review` takes back what it returns.
const schedulerFor = (options: FsrsOptions) =>
  DefaultScheduler({
    version: 'FSRS-7',
    desiredRetention: options.desiredRetention ?? 0.9,
    maximumInterval: options.maximumIntervalDays ?? 365,
    enableFuzz: options.fuzz ?? true,
  });

type Scheduler = Awaited<ReturnType<typeof schedulerFor>>;
/** The card shape `review` takes; `newCard` and `review` both return one. */
export type FsrsCard = ReturnType<Scheduler['review']>['card'];

const RATING: Readonly<Record<Grade, FsrsGrade>> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export interface FsrsOptions {
  /** Target chance of remembering at review time; higher means more reviews. */
  readonly desiredRetention?: number;
  /** Longest gap between reviews, in days. */
  readonly maximumIntervalDays?: number;
  /** Random spread on long intervals, so reviews learned together don't all fall on one day. */
  readonly fuzz?: boolean;
}

export async function createFsrsScheduler(
  options: FsrsOptions = {},
): Promise<ReviewScheduler<FsrsCard>> {
  const scheduler = await schedulerFor(options);
  return {
    newCard: (now) => scheduler.newCard({ now }),
    review: (card, grade, now) => scheduler.review({ card, grade: RATING[grade], now }).card,
    dueAt: (card) => new Date(card.dueAt),
  };
}
