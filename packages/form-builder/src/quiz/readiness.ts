import type { QuestionRubric, SaltedHash } from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField, FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { type GradedField, gradableKindsFor, gradedFields } from './authoring';
import { normalizeAnswerText } from './normalize';

/**
 * Checks a quiz before it reaches students. Every check here is a way a real
 * quiz went wrong or could go wrong: a missing key, a key that no longer
 * matches an option after the teacher edited it, two questions that share a
 * name, a pattern that never matches. A blocker stops publishing; a warning
 * is shown to the teacher and publishing may go ahead.
 */

export type QuizProblemCode =
  | 'no-graded-questions'
  | 'duplicate-field-name'
  | 'not-gradable'
  | 'kind-mismatch'
  | 'too-few-options'
  | 'duplicate-option'
  | 'missing-answer-key'
  | 'answer-key-not-an-option'
  | 'no-acceptable-answers'
  | 'invalid-pattern'
  | 'unanchored-pattern'
  | 'invalid-target'
  | 'invalid-tolerance'
  | 'invalid-points'
  | 'hashed-key-unchecked'
  | 'conditional-question';

export interface QuizProblem {
  code: QuizProblemCode;
  severity: 'blocker' | 'warning';
  /** The field the problem is on; absent for whole-quiz problems. */
  fieldId?: string;
  /** Plain English for logs and as the translation fallback. */
  message: string;
}

export interface QuizReadiness {
  /** True when nothing blocks publishing. */
  ready: boolean;
  problems: QuizProblem[];
  gradedCount: number;
  totalPoints: number;
}

const isHash = (value: unknown): value is SaltedHash =>
  typeof value === 'object' && value !== null && 'hash' in value && 'salt' in value;

function optionValues(field: FormField): string[] {
  return (field.options ?? []).map((o) => normalizeAnswerText(String(o.value)));
}

function label(field: FormField): string {
  const text = normalizeAnswerText(field.label ?? '');
  return text ? `"${text}"` : `question ${field.name}`;
}

export function checkQuizReadiness(schema: FormSchema): QuizReadiness {
  const problems: QuizProblem[] = [];
  const graded = gradedFields(schema);

  if (graded.length === 0) {
    problems.push({
      code: 'no-graded-questions',
      severity: 'blocker',
      message: 'This quiz has no marked questions yet.',
    });
  }

  // The engine stores answers and rubrics by field name, so a shared name
  // silently makes two questions one.
  const seen = new Map<string, FormField>();
  const isGraded = (f: FormField) => Boolean((f as Partial<GradedField>).rubric);
  for (const page of schema.pages) {
    for (const field of page.fields) {
      const first = seen.get(field.name);
      if (first && first.id !== field.id && (isGraded(field) || isGraded(first))) {
        problems.push({
          code: 'duplicate-field-name',
          severity: 'blocker',
          fieldId: field.id,
          message: `${label(field)} shares its internal name with another question, so their answers would mix.`,
        });
      }
      if (!first) seen.set(field.name, field);
    }
  }

  let totalPoints = 0;
  for (const field of graded) {
    const rubric = field.rubric;
    checkPoints(field, rubric, problems);
    if (Number.isFinite(rubric.points) && rubric.points > 0) totalPoints += rubric.points;

    const allowed = gradableKindsFor(field);
    if (allowed.length === 0) {
      problems.push({
        code: 'not-gradable',
        severity: 'blocker',
        fieldId: field.id,
        message: `${label(field)} cannot be marked automatically. Remove its marking or change the question type.`,
      });
      continue;
    }
    if (!allowed.includes(rubric.kind)) {
      problems.push({
        code: 'kind-mismatch',
        severity: 'blocker',
        fieldId: field.id,
        message: `${label(field)} has marking for a different kind of question. Set its answer again.`,
      });
      continue;
    }

    if (field.visibleIf) {
      problems.push({
        code: 'conditional-question',
        severity: 'warning',
        fieldId: field.id,
        message: `${label(field)} only shows for some answers. Students who never see it are not marked on it.`,
      });
    }

    switch (rubric.kind) {
      case 'single-choice':
      case 'multiple-choice':
        checkChoice(field, rubric, problems);
        break;
      case 'numeric-range':
        checkNumeric(field, rubric, problems);
        break;
      case 'text-match':
        checkText(field, rubric, problems);
        break;
      default:
        break;
    }
  }

  return {
    ready: !problems.some((p) => p.severity === 'blocker'),
    problems,
    gradedCount: graded.length,
    totalPoints,
  };
}

function checkPoints(field: FormField, rubric: QuestionRubric, problems: QuizProblem[]) {
  if (!Number.isFinite(rubric.points) || rubric.points <= 0) {
    problems.push({
      code: 'invalid-points',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} needs marks above zero.`,
    });
  }
}

function checkChoice(
  field: FormField,
  rubric: Extract<QuestionRubric, { kind: 'single-choice' | 'multiple-choice' }>,
  problems: QuizProblem[],
) {
  const values = optionValues(field);
  if (values.filter(Boolean).length < 2) {
    problems.push({
      code: 'too-few-options',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} needs at least two choices.`,
    });
  }
  if (new Set(values).size !== values.length) {
    problems.push({
      code: 'duplicate-option',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} has two choices with the same value, so the answer is ambiguous.`,
    });
  }

  const keys = rubric.kind === 'single-choice' ? [rubric.correctValue] : rubric.correctValues;
  const plainKeys = keys.filter((k): k is string => typeof k === 'string').map(normalizeAnswerText);
  const hashedCount = keys.filter(isHash).length;

  if (plainKeys.filter(Boolean).length === 0 && hashedCount === 0) {
    problems.push({
      code: 'missing-answer-key',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} has no correct answer chosen.`,
    });
    return;
  }
  const known = new Set(values);
  if (plainKeys.some((k) => k !== '' && !known.has(k))) {
    problems.push({
      code: 'answer-key-not-an-option',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)}'s correct answer is no longer one of its choices. Choose it again.`,
    });
  }
  if (hashedCount > 0) {
    problems.push({
      code: 'hashed-key-unchecked',
      severity: 'warning',
      fieldId: field.id,
      message: `${label(field)} has a hidden answer key that cannot be checked against its choices here.`,
    });
  }
}

function checkNumeric(
  field: FormField,
  rubric: Extract<QuestionRubric, { kind: 'numeric-range' }>,
  problems: QuizProblem[],
) {
  // Saved JSON turns NaN into null, so check the type as well as the value.
  if (typeof rubric.targetValue !== 'number' || !Number.isFinite(rubric.targetValue)) {
    problems.push({
      code: 'invalid-target',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} has no correct number set.`,
    });
  }
  if (typeof rubric.tolerance !== 'number' || !Number.isFinite(rubric.tolerance) || rubric.tolerance < 0) {
    problems.push({
      code: 'invalid-tolerance',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} needs an allowed difference of zero or more.`,
    });
  }
}

function checkText(
  field: FormField,
  rubric: Extract<QuestionRubric, { kind: 'text-match' }>,
  problems: QuizProblem[],
) {
  const answers = (rubric.acceptableAnswers ?? []).map(normalizeAnswerText).filter(Boolean);
  if (answers.length === 0 && !rubric.regexPattern) {
    problems.push({
      code: 'no-acceptable-answers',
      severity: 'blocker',
      fieldId: field.id,
      message: `${label(field)} has no accepted answers.`,
    });
  }
  if (rubric.regexPattern) {
    // The engine swallows a broken pattern and marks every answer wrong.
    try {
      new RegExp(rubric.regexPattern);
    } catch {
      problems.push({
        code: 'invalid-pattern',
        severity: 'blocker',
        fieldId: field.id,
        message: `${label(field)}'s answer pattern is not valid.`,
      });
      return;
    }
    if (!rubric.regexPattern.startsWith('^') || !rubric.regexPattern.endsWith('$')) {
      problems.push({
        code: 'unanchored-pattern',
        severity: 'warning',
        fieldId: field.id,
        message: `${label(field)}'s pattern also matches longer answers that contain it (for example "15" for "5").`,
      });
    }
  }
}
