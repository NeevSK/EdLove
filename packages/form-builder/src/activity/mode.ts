import type {
  AssessmentSchemaConfig,
  QuestionRubric,
} from '@intuitui-labs/form-builder-engine/assessment';
import type { FormField, FormSchema } from '@intuitui-labs/form-builder-engine/schema';

/**
 * How an activity is run. The same set of questions can be a practice round, a class check,
 * an exam or a poll; the mode decides feedback, help, retries, timing and who sees results.
 * Every mode is a policy with defaults, and any field can be overridden per activity.
 *
 * The mode is separate from the form's `kind` (what it is) and from its placement (where it
 * appears: on its own, inside a video, in a post or in a relation's thread).
 */
export type ActivityMode = 'practice' | 'check' | 'exam' | 'poll';

/** When something is shown: after each question, on submitting, when the activity closes, or never. */
export type Reveal = 'per-question' | 'on-submit' | 'after-close' | 'never';

export interface ModePolicy {
  readonly mode: ActivityMode;
  /** Whether answers are marked at all. A poll has no right answer. */
  readonly marked: boolean;
  /** When the person is told whether an answer was right. */
  readonly feedback: Reveal;
  /** When the correct answers and explanations are shown. */
  readonly revealAnswers: Reveal;
  readonly hints: boolean;
  /** Tries per question; `null` means as many as the person wants. */
  readonly triesPerQuestion: number | null;
  /** Whether a person may change an answer already given (a vote, or before submitting). */
  readonly changeAnswer: boolean;
  /** Whether the activity's time limit, when it has one, ends the attempt. */
  readonly enforceTimeLimit: boolean;
  /** Keep the screen to the activity and note when the person leaves the app. */
  readonly lockdown: boolean;
  /** When participants see everyone's results (poll counts, class spread). */
  readonly resultsToParticipants: Reveal;
  /** Whether results are shown without names. */
  readonly anonymous: boolean;
  /**
   * Whether hints and retries lower the marks. Off by default: help is recorded as a fact
   * about the step, and what someone can do with help is part of what they can do.
   */
  readonly assistanceAffectsMarks: boolean;
  /** Bonus points for speed or answer streaks. Off by default (no points, badges or streaks). */
  readonly speedAndStreakBonus: boolean;
  readonly shuffle: boolean;
}

export const MODE_DEFAULTS: Readonly<Record<ActivityMode, ModePolicy>> = {
  practice: {
    mode: 'practice',
    marked: true,
    feedback: 'per-question',
    revealAnswers: 'per-question',
    hints: true,
    triesPerQuestion: null,
    changeAnswer: true,
    enforceTimeLimit: false,
    lockdown: false,
    resultsToParticipants: 'never',
    anonymous: false,
    assistanceAffectsMarks: false,
    speedAndStreakBonus: false,
    shuffle: false,
  },
  check: {
    mode: 'check',
    marked: true,
    feedback: 'on-submit',
    revealAnswers: 'on-submit',
    hints: true,
    triesPerQuestion: 1,
    changeAnswer: true,
    enforceTimeLimit: false,
    lockdown: false,
    resultsToParticipants: 'never',
    anonymous: false,
    assistanceAffectsMarks: false,
    speedAndStreakBonus: false,
    shuffle: false,
  },
  exam: {
    mode: 'exam',
    marked: true,
    feedback: 'after-close',
    revealAnswers: 'after-close',
    hints: false,
    triesPerQuestion: 1,
    changeAnswer: true,
    enforceTimeLimit: true,
    lockdown: true,
    resultsToParticipants: 'never',
    anonymous: false,
    assistanceAffectsMarks: false,
    speedAndStreakBonus: false,
    shuffle: true,
  },
  poll: {
    mode: 'poll',
    marked: false,
    feedback: 'never',
    revealAnswers: 'never',
    hints: false,
    triesPerQuestion: 1,
    changeAnswer: true,
    enforceTimeLimit: false,
    lockdown: false,
    resultsToParticipants: 'per-question',
    anonymous: false,
    assistanceAffectsMarks: false,
    speedAndStreakBonus: false,
    shuffle: false,
  },
};

export type ModeOverrides = Partial<Omit<ModePolicy, 'mode'>>;

export function resolveMode(mode: ActivityMode, overrides: ModeOverrides = {}): ModePolicy {
  return { ...MODE_DEFAULTS[mode], ...overrides, mode };
}

/**
 * The engine settings a policy implies, layered over what the author already set (pass mark,
 * time limits, tags, seed). The policy wins on anything it decides.
 */
export function assessmentConfigFor(
  policy: ModePolicy,
  authored: AssessmentSchemaConfig | undefined,
): AssessmentSchemaConfig {
  const base: AssessmentSchemaConfig = { ...authored, timing: authored?.timing ?? 'deferred' };
  const { speedBonusWindowSeconds, speedBonusMaxPercent, streakBonusEnabled, ...rest } = base;
  return {
    ...rest,
    ...(policy.speedAndStreakBonus
      ? { speedBonusWindowSeconds, speedBonusMaxPercent, streakBonusEnabled }
      : {}),
    timing: policy.feedback === 'per-question' ? 'instant' : 'deferred',
    maxAttemptsPerQuestion: policy.triesPerQuestion ?? undefined,
    shuffleOptions: policy.shuffle,
    shuffleQuestions: policy.shuffle,
    floorScoreToZero: rest.floorScoreToZero ?? true,
  };
}

/** A rubric as the policy marks it: without help penalties unless the policy asks for them. */
export function rubricForPolicy(rubric: QuestionRubric, policy: ModePolicy): QuestionRubric {
  if (policy.assistanceAffectsMarks) return rubric;
  const { penaltyPerRetryPercent: _retry, ...rest } = rubric;
  return rest.hint ? { ...rest, hint: { ...rest.hint, penaltyPercent: 0 } } : rest;
}

/**
 * The schema as this mode runs it. Pure: the authored schema is never changed, so the same
 * questions can run in another mode. A poll keeps its questions and drops every rubric.
 */
export function schemaForMode(schema: FormSchema, policy: ModePolicy): FormSchema {
  const fieldFor = (field: FormField): FormField => {
    const rubric = (field as FormField & { rubric?: QuestionRubric }).rubric;
    if (rubric === undefined) return field;
    if (!policy.marked) {
      const { rubric: _dropped, ...rest } = field as FormField & { rubric?: QuestionRubric };
      return rest;
    }
    return { ...field, rubric: rubricForPolicy(rubric, policy) } as FormField;
  };
  const { assessment, ...rest } = schema;
  return {
    ...rest,
    pages: schema.pages.map((page) => ({ ...page, fields: page.fields.map(fieldFor) })),
    ...(policy.marked ? { assessment: assessmentConfigFor(policy, assessment) } : {}),
  };
}

/** Whether to show something now, given when it is revealed and where the activity stands. */
export function isRevealed(
  reveal: Reveal,
  stage: 'answering' | 'answered' | 'submitted' | 'closed',
): boolean {
  switch (reveal) {
    case 'per-question':
      return stage !== 'answering';
    case 'on-submit':
      return stage === 'submitted' || stage === 'closed';
    case 'after-close':
      return stage === 'closed';
    case 'never':
      return false;
  }
}
