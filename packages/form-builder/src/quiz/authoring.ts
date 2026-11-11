import type {
  AssessmentSchemaConfig,
  QuestionRubric,
  RubricKind,
} from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField, FormSchema } from '@intuitui-labs/form-builder-engine/schema';

/** A field that carries a rubric. The engine's schema types put `rubric` on fields. */
export type GradedField = FormField & { rubric: QuestionRubric };

/**
 * Which rubric kinds a field type can be marked with automatically.
 * Paragraph answers (`textarea`) are left out on purpose: matching an essay
 * against a list of strings marks good answers wrong. Those need a teacher.
 */
export function gradableKindsFor(field: Pick<FormField, 'type' | 'config'>): RubricKind[] {
  switch (field.type) {
    case 'select':
      return field.config?.multiple === true ? ['multiple-choice'] : ['single-choice'];
    case 'number':
    case 'slider':
      return ['numeric-range'];
    case 'text':
      return ['text-match'];
    default:
      return [];
  }
}

export function isGradableField(field: Pick<FormField, 'type' | 'config'>): boolean {
  return gradableKindsFor(field).length > 0;
}

/**
 * A rubric for a newly graded question, with no answer key yet.
 * The key is deliberately empty: the quiz readiness check blocks publishing
 * until the teacher chooses it. A placeholder key ("Correct Option") would
 * look finished and mark every student wrong.
 */
export function blankRubricFor(
  field: Pick<FormField, 'type' | 'config'>,
  points = 1,
): QuestionRubric | undefined {
  const kind = gradableKindsFor(field)[0];
  switch (kind) {
    case 'single-choice':
      return { kind, points, correctValue: '' };
    case 'multiple-choice':
      return { kind, points, correctValues: [], partialCreditStrategy: 'all-or-nothing' };
    case 'numeric-range':
      return { kind, points, targetValue: Number.NaN, tolerance: 0 };
    case 'text-match':
      return { kind, points, acceptableAnswers: [], trimWhitespace: true };
    default:
      return undefined;
  }
}

/** Every field across all pages that carries a rubric, in page and field order. */
export function gradedFields(schema: FormSchema): GradedField[] {
  const out: GradedField[] = [];
  for (const page of schema.pages) {
    const ordered = [...page.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const field of ordered) {
      if ((field as FormField & { rubric?: QuestionRubric }).rubric) out.push(field as GradedField);
    }
  }
  return out;
}

/**
 * The assessment settings a school quiz starts with. `deferred` marks on
 * submission, like a class test; a teacher can switch to `instant` for
 * practice. Scores never go below zero, and nothing is shuffled until the
 * teacher asks for it.
 */
export const SCHOOL_QUIZ_DEFAULTS: AssessmentSchemaConfig = {
  timing: 'deferred',
  floorScoreToZero: true,
};

/**
 * The assessment config a schema needs to be marked, or `null` when it already
 * has one or has no graded questions. The studio dispatches this; grading also
 * applies it, so a quiz saved before this fix still marks correctly.
 */
export function missingQuizModeConfig(schema: FormSchema): AssessmentSchemaConfig | null {
  if (schema.assessment) return null;
  return gradedFields(schema).length > 0 ? { ...SCHOOL_QUIZ_DEFAULTS } : null;
}

/** The schema with quiz mode switched on when it has graded questions. Pure. */
export function withQuizMode(schema: FormSchema): FormSchema {
  const config = missingQuizModeConfig(schema);
  if (!config) return schema;
  const kind =
    !schema.kind || schema.kind === 'form' || schema.kind === 'survey' ? 'quiz' : schema.kind;
  return { ...schema, kind, assessment: config };
}
