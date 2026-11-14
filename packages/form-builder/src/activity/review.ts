import { lastConfidence, sureness } from './calibration';
import { assistanceByPart, type Journal } from './journal';

/**
 * The review queue: practice that comes back over days and weeks, which with testing yourself
 * is one of the two best-evidenced study techniques. Each item someone has met (a question, a
 * word, a formula) has a schedule; answering it moves the schedule; the queue offers what is due,
 * mixed across topics rather than in blocks.
 *
 * The scheduling algorithm is a port (`ReviewScheduler`), so this core stays pure and works with
 * any model. `fsrsReview.adapter.ts` provides FSRS through `ts-fsrs`.
 *
 * Schedules belong to the person and are used only to plan their own practice. They are never a
 * score, and never shown to anyone as a measure of the person.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewScheduler<Card> {
  newCard(now: Date): Card;
  review(card: Card, grade: Grade, now: Date): Card;
  dueAt(card: Card): Date;
}

/**
 * How an answer becomes a grade. Defaults: wrong is `again`; right with help, or right while
 * unsure, is `hard` (it may not hold yet); right alone and sure is `good`. `easy` is never
 * inferred; only the person can say something was easy.
 */
export interface GradePolicy {
  readonly wrong: Grade;
  readonly rightWithHelp: Grade;
  readonly rightUnsure: Grade;
  readonly rightAlone: Grade;
}

export const DEFAULT_GRADE_POLICY: GradePolicy = {
  wrong: 'again',
  rightWithHelp: 'hard',
  rightUnsure: 'hard',
  rightAlone: 'good',
};

export interface ReviewItem<Card> {
  readonly itemId: string;
  /** What the item is about, for mixing topics in a session. */
  readonly topic: string;
  readonly card: Card;
}

export type ReviewQueue<Card> = ReadonlyMap<string, ReviewItem<Card>>;

/** Which item each answered part practises, and its topic. Parts with no item are not scheduled. */
export type ItemOf = (
  part: string,
) => { readonly itemId: string; readonly topic: string } | undefined;

/** The grade each answered part earns in this attempt. */
export function gradesFromAttempt(
  journal: Journal,
  correct: ReadonlyMap<string, boolean>,
  policy: GradePolicy = DEFAULT_GRADE_POLICY,
): ReadonlyMap<string, Grade> {
  const assistance = assistanceByPart(journal);
  const confidence = lastConfidence(journal);
  const grades = new Map<string, Grade>();
  for (const [part, right] of correct) {
    const level = confidence.get(part);
    if (!right) grades.set(part, policy.wrong);
    else if (assistance.get(part)?.independent === false) grades.set(part, policy.rightWithHelp);
    else if (level !== undefined && sureness(level) === 'unsure')
      grades.set(part, policy.rightUnsure);
    else grades.set(part, policy.rightAlone);
  }
  return grades;
}

/** Moves each practised item's schedule. Items met for the first time get a new card first. */
export function recordReviews<Card>(
  queue: ReviewQueue<Card>,
  grades: ReadonlyMap<string, Grade>,
  itemOf: ItemOf,
  scheduler: ReviewScheduler<Card>,
  now: Date,
): ReviewQueue<Card> {
  const next = new Map(queue);
  for (const [part, grade] of grades) {
    const item = itemOf(part);
    if (item === undefined) continue;
    const current = next.get(item.itemId)?.card ?? scheduler.newCard(now);
    next.set(item.itemId, {
      itemId: item.itemId,
      topic: item.topic,
      card: scheduler.review(current, grade, now),
    });
  }
  return next;
}

/**
 * What is due now, most overdue first, then mixed so that two items from the same topic don't
 * sit next to each other while another topic is waiting (interleaving).
 */
export function dueItems<Card>(
  queue: ReviewQueue<Card>,
  scheduler: ReviewScheduler<Card>,
  now: Date,
  limit: number,
): readonly ReviewItem<Card>[] {
  const due = [...queue.values()]
    .filter((item) => scheduler.dueAt(item.card).getTime() <= now.getTime())
    .sort(
      (a, b) =>
        scheduler.dueAt(a.card).getTime() - scheduler.dueAt(b.card).getTime() ||
        a.itemId.localeCompare(b.itemId),
    );

  const byTopic = new Map<string, ReviewItem<Card>[]>();
  for (const item of due) byTopic.set(item.topic, [...(byTopic.get(item.topic) ?? []), item]);

  const mixed: ReviewItem<Card>[] = [];
  const lanes = [...byTopic.values()];
  while (mixed.length < limit && lanes.some((lane) => lane.length > 0)) {
    for (const lane of lanes) {
      const item = lane.shift();
      if (item !== undefined && mixed.length < limit) mixed.push(item);
    }
  }
  return mixed;
}
