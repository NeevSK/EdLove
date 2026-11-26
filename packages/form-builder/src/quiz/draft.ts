import type { QuestionRubric } from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField, FormFieldOption } from '@intuitui-labs/form-builder-engine/schema';
import { gradableKindsFor } from './authoring';
import { normalizeAnswerText, parseNumberAnswer } from './normalize';

/**
 * What the teacher is editing in the marking sheet, as plain text.
 * Inputs stay as strings while typing, so a half-typed "2." is never lost;
 * they become numbers only in `applyDraft`.
 *
 * Choices get a stable internal value when created and keep it when their
 * wording changes, so fixing a typo in a choice never breaks the answer key.
 */
export interface ChoiceDraft {
  value: string;
  label: string;
}

export interface MarkingDraft {
  /** The question as students read it. */
  label: string;
  graded: boolean;
  points: string;
  choices: ChoiceDraft[];
  /** Values of the correct choices. */
  correct: string[];
  target: string;
  tolerance: string;
  /** Accepted answers, one per line. */
  accepted: string;
  explanation: string;
}

type FieldWithRubric = FormField & { rubric?: QuestionRubric };

const str = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? String(n) : '');

export function draftFromField(field: FieldWithRubric): MarkingDraft {
  const r = field.rubric;
  return {
    label: field.label ?? '',
    graded: Boolean(r),
    points: r ? str(r.points) : '1',
    choices: (field.options ?? []).map((o) => ({ value: String(o.value), label: o.label })),
    correct:
      r?.kind === 'single-choice'
        ? typeof r.correctValue === 'string' && r.correctValue
          ? [r.correctValue]
          : []
        : r?.kind === 'multiple-choice'
          ? r.correctValues.filter((v): v is string => typeof v === 'string')
          : [],
    target: r?.kind === 'numeric-range' ? str(r.targetValue) : '',
    tolerance: r?.kind === 'numeric-range' ? str(r.tolerance) || '0' : '0',
    accepted: r?.kind === 'text-match' ? r.acceptableAnswers.join('\n') : '',
    explanation: r?.explanation ?? '',
  };
}

/** A new, empty choice with a value that will not change when it is reworded. */
export function newChoice(existing: readonly ChoiceDraft[], makeId: () => string): ChoiceDraft {
  const taken = new Set(existing.map((c) => c.value));
  let value = `c-${makeId()}`;
  while (taken.has(value)) value = `c-${makeId()}`;
  return { value, label: '' };
}

/** Removing a choice also removes it from the correct answers. */
export function removeChoice(draft: MarkingDraft, value: string): MarkingDraft {
  return {
    ...draft,
    choices: draft.choices.filter((c) => c.value !== value),
    correct: draft.correct.filter((v) => v !== value),
  };
}

/** Single choice replaces the answer; multiple choice toggles it. */
export function toggleCorrect(draft: MarkingDraft, value: string, multiple: boolean): MarkingDraft {
  if (!multiple) return { ...draft, correct: [value] };
  const has = draft.correct.includes(value);
  return {
    ...draft,
    correct: has ? draft.correct.filter((v) => v !== value) : [...draft.correct, value],
  };
}

export interface AppliedDraft {
  /** The question text, tidied. */
  label: string;
  /** New choices for the field, when it is a choice question. */
  options?: FormFieldOption[];
  /** The rubric to store, or `undefined` to stop marking the question. */
  rubric: QuestionRubric | undefined;
}

/**
 * Turns the draft into what the studio stores. Nothing is invented: a missing
 * number stays missing (NaN) so the readiness check names it, instead of
 * quietly becoming 0.
 */
export function applyDraft(
  field: Pick<FormField, 'type' | 'config'>,
  draft: MarkingDraft,
): AppliedDraft {
  const kind = gradableKindsFor(field)[0];
  const isChoice = kind === 'single-choice' || kind === 'multiple-choice';
  const options = isChoice
    ? draft.choices
        .map((c) => ({ value: c.value, label: normalizeAnswerText(c.label) }))
        .filter((c) => c.label !== '')
    : undefined;

  const label = normalizeAnswerText(draft.label);
  if (!draft.graded || !kind) return { label, options, rubric: undefined };

  const points = parseNumberAnswer(draft.points) ?? Number.NaN;
  const explanation = normalizeAnswerText(draft.explanation) || undefined;
  const base = { points, ...(explanation ? { explanation } : {}) };
  const kept = new Set((options ?? []).map((o) => o.value));
  const correct = draft.correct.filter((v) => kept.has(v));

  switch (kind) {
    case 'single-choice':
      return { label, options, rubric: { ...base, kind, correctValue: correct[0] ?? '' } };
    case 'multiple-choice':
      return {
        label,
        options,
        rubric: { ...base, kind, correctValues: correct, partialCreditStrategy: 'all-or-nothing' },
      };
    case 'numeric-range':
      return {
        label,
        options,
        rubric: {
          ...base,
          kind,
          targetValue: parseNumberAnswer(draft.target) ?? Number.NaN,
          tolerance: parseNumberAnswer(draft.tolerance) ?? Number.NaN,
        },
      };
    case 'text-match': {
      const acceptableAnswers = draft.accepted.split('\n').map(normalizeAnswerText).filter(Boolean);
      return { label, options, rubric: { ...base, kind, acceptableAnswers, trimWhitespace: true } };
    }
    default:
      return { label, options, rubric: undefined };
  }
}
