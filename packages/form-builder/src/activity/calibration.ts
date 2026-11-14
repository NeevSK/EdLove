import type { Confidence, Journal, ReflectionStage } from './journal';

/**
 * Calibration: how well a person's confidence matched how their answers turned out. Knowing
 * what you know is the monitoring half of self-regulated learning, and seeing it is what
 * sharpens it. This is reflected back to the person for one attempt; it is never stored as a
 * judgment of them, and never compared with anyone else.
 */

export type Sureness = 'sure' | 'unsure';

const sureness = (c: Confidence): Sureness =>
  c === 'sure' || c === 'fairly_sure' ? 'sure' : 'unsure';

export interface Calibration {
  /** Sure and right: knowledge to trust. */
  readonly sureRight: readonly string[];
  /** Sure and wrong: the most useful to look at again, a likely misconception. */
  readonly sureWrong: readonly string[];
  /** Unsure but right: knows more than they think; worth practising until it feels solid. */
  readonly unsureRight: readonly string[];
  /** Unsure and wrong: honest about a gap. */
  readonly unsureWrong: readonly string[];
  /** Answered parts with no confidence given. */
  readonly notRated: readonly string[];
}

/**
 * `correct` holds the marking of each answered part (from `gradeQuiz`). The confidence that
 * counts is the last one given before or with the last answer to that part.
 */
export function calibrationOf(
  journal: Journal,
  correct: ReadonlyMap<string, boolean>,
): Calibration {
  const lastConfidence = new Map<string, Confidence>();
  for (const step of journal) {
    if (step.kind === 'confidence') lastConfidence.set(step.part, step.level);
  }
  const groups = {
    sureRight: [] as string[],
    sureWrong: [] as string[],
    unsureRight: [] as string[],
    unsureWrong: [] as string[],
    notRated: [] as string[],
  };
  for (const [part, right] of correct) {
    const level = lastConfidence.get(part);
    if (level === undefined) groups.notRated.push(part);
    else if (sureness(level) === 'sure') (right ? groups.sureRight : groups.sureWrong).push(part);
    else (right ? groups.unsureRight : groups.unsureWrong).push(part);
  }
  return groups;
}

/** The person's own notes around an attempt, by stage, in the order written. */
export function reflectionsOf(
  journal: Journal,
): Readonly<Record<ReflectionStage, readonly string[]>> {
  const out: Record<ReflectionStage, string[]> = { plan: [], monitor: [], evaluate: [] };
  for (const step of journal) {
    if (step.kind === 'reflected' && step.text.trim().length > 0) out[step.stage].push(step.text);
  }
  return out;
}
