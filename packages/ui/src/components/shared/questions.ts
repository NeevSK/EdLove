import type { AnswerLabels, AnswerMark } from '../../theme/contracts';

/** Platform-neutral rules for question components; drawing stays per platform. */

export const ANSWER_ENGLISH: AnswerLabels = {
  correct: 'Correct',
  incorrect: 'Not this one',
  missed: 'This was right',
  resultRight: 'That is right.',
  resultWrong: 'Not quite.',
  explanationHeading: 'Why',
};

export const PRIVACY_ENGLISH = {
  named: 'Your name is shown with your answers.',
  anonymous: 'Your answers are anonymous: your name is not stored with them.',
  pseudonymous: 'Your answers are kept under a code, not your name.',
} as const;

/** How one option reads after a reveal. Chosen-and-right is correct; right-but-not-chosen is missed. */
export function markOf<V extends string>(
  option: V,
  chosen: readonly V[],
  correct: readonly V[] | undefined,
): AnswerMark {
  if (!correct) return 'none';
  const isChosen = chosen.includes(option);
  const isRight = correct.includes(option);
  if (isChosen && isRight) return 'correct';
  if (isChosen) return 'incorrect';
  if (isRight) return 'missed';
  return 'none';
}

/** Whether the chosen set is exactly the right one. */
export function isAllRight<V extends string>(chosen: readonly V[], correct: readonly V[]): boolean {
  return chosen.length === correct.length && correct.every((c) => chosen.includes(c));
}

/** The points of a scale, inclusive, clamped to 3–11 points. */
export function scalePoints(min = 1, max = 5): number[] {
  const hi = Math.max(min + 2, Math.min(max, min + 10));
  return Array.from({ length: hi - min + 1 }, (_, i) => min + i);
}

/** Next selection for a choice question. */
export function toggleChoice<V extends string>(
  value: readonly V[],
  option: V,
  multiple: boolean,
): V[] {
  if (!multiple) return [option];
  return value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
}
