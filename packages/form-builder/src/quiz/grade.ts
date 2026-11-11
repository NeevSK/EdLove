import {
  type ProctoringEvent,
  type QuestionRubric,
  RubricEvaluator,
} from '@intuitui-labs/form-builder-engine/assessment';
import { evaluateCondition } from '@intuitui-labs/form-builder-engine/core';
import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { type GradedField, withQuizMode } from './authoring';
import { isBlankAnswer, normalizeAnswerText, parseNumberAnswer } from './normalize';

/**
 * Marks one quiz attempt. Pure: same schema and answers, same result.
 *
 * Each question is judged by the engine's `RubricEvaluator` (choice, partial
 * credit, number ranges, text match, negative marking). Totals are added up
 * here instead of by `AssessmentEngine.gradeAll`, because `gradeAll` also
 * judges blank answers, which applies negative marking to questions a student
 * skipped, and it counts questions a student never saw.
 */

export type QuestionStatus = 'correct' | 'partly-correct' | 'wrong' | 'unanswered';

export interface QuizQuestionResult {
  fieldId: string;
  name: string;
  status: QuestionStatus;
  score: number;
  maxPoints: number;
  explanation?: string;
  tags: string[];
}

export interface QuizTagResult {
  tag: string;
  score: number;
  maxPoints: number;
  percent: number;
  questionsCount: number;
  correctCount: number;
}

/** One finished attempt, ready to store as a classroom submission. */
export interface QuizAttempt {
  /** Created once when the student starts; makes resending safe. */
  attemptId: string;
  formId: string;
  /** The schema version the attempt was marked against, for re-marking. */
  formVersion?: string;
  responderId?: string;
  startedAt?: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  percent: number;
  /** `undefined` when the quiz has no pass mark: no pass mark, no verdict. */
  isPassing?: boolean;
  questions: QuizQuestionResult[];
  tags: QuizTagResult[];
  answeredCount: number;
  unansweredCount: number;
  /** Graded questions that were hidden or on pages the student never reached. */
  notShown: string[];
  /** Answers as marked (normalised), kept so a teacher can re-mark later. */
  answers: Record<string, unknown>;
  timerExpired: boolean;
  /** Times the student left the app during the attempt. Shown, never penalised. */
  leftAppCount: number;
}

export interface GradeQuizInput {
  attemptId: string;
  submittedAt: string;
  startedAt?: string;
  responderId?: string;
  /** Pages the student actually reached. Omit to count every page. */
  visitedPageIds?: readonly string[];
  /** Field names where the student opened a hint. */
  hintsUsed?: readonly string[];
  /** Tries per field name (instant practice mode). */
  attemptsByField?: Readonly<Record<string, number>>;
  proctoringEvents?: readonly ProctoringEvent[];
  timerExpired?: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function prepareRubric(rubric: QuestionRubric): QuestionRubric {
  const norm = (v: unknown) => (typeof v === 'string' ? normalizeAnswerText(v) : v);
  switch (rubric.kind) {
    case 'single-choice':
      return { ...rubric, correctValue: norm(rubric.correctValue) as typeof rubric.correctValue };
    case 'multiple-choice':
      return {
        ...rubric,
        correctValues: rubric.correctValues.map(norm) as typeof rubric.correctValues,
      };
    case 'text-match':
      return { ...rubric, acceptableAnswers: rubric.acceptableAnswers.map(normalizeAnswerText) };
    default:
      return rubric;
  }
}

function prepareAnswer(rubric: QuestionRubric, value: unknown): unknown {
  if (isBlankAnswer(value)) return undefined;
  switch (rubric.kind) {
    case 'single-choice':
      return normalizeAnswerText(String(value));
    case 'multiple-choice': {
      const list = Array.isArray(value) ? value : [value];
      const picked = list.map((v) => normalizeAnswerText(String(v))).filter(Boolean);
      return picked.length > 0 ? picked : undefined;
    }
    case 'numeric-range':
      return parseNumberAnswer(value);
    case 'text-match':
      return normalizeAnswerText(String(value));
    default:
      return value;
  }
}

function statusOf(ratio: number, answered: boolean): QuestionStatus {
  if (!answered) return 'unanswered';
  if (ratio >= 1) return 'correct';
  if (ratio > 0) return 'partly-correct';
  return 'wrong';
}

export function gradeQuiz(
  inputSchema: FormSchema,
  values: Readonly<Record<string, unknown>>,
  input: GradeQuizInput,
): QuizAttempt {
  const schema = withQuizMode(inputSchema);
  const config = schema.assessment ?? { timing: 'deferred' as const };
  const visited = input.visitedPageIds ? new Set(input.visitedPageIds) : null;
  const hints = new Set(input.hintsUsed ?? []);

  const questions: QuizQuestionResult[] = [];
  const notShown: string[] = [];
  const answers: Record<string, unknown> = {};
  const tagTotals = new Map<string, QuizTagResult>();
  const counted = new Set<string>();

  for (const page of schema.pages) {
    const pageReached = !visited || visited.has(page.id);
    const ordered = [...page.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const raw of ordered) {
      const field = raw as Partial<GradedField> & typeof raw;
      if (!field.rubric) continue;
      // A repeated name would be marked twice; the readiness check blocks it,
      // and this keeps an old quiz from double-counting.
      if (counted.has(field.name)) continue;
      if (!pageReached || !evaluateCondition(field.visibleIf, values as Record<string, unknown>)) {
        notShown.push(field.name);
        continue;
      }
      counted.add(field.name);

      const rubric = prepareRubric(field.rubric);
      const answer = prepareAnswer(rubric, values[field.name]);
      const answered = answer !== undefined;
      const maxPoints = Number.isFinite(rubric.points) && rubric.points > 0 ? rubric.points : 0;

      let score = 0;
      let ratio = 0;
      if (answered && maxPoints > 0) {
        const evaluation = RubricEvaluator.evaluate(field.name, rubric, answer, {
          attemptsUsed: input.attemptsByField?.[field.name],
          hintUsed: hints.has(field.name),
        });
        score = evaluation.score;
        ratio = evaluation.partialCreditRatio;
        answers[field.name] = answer;
      } else if (answered) {
        answers[field.name] = answer;
      }

      const tags = rubric.tags ?? config.tags ?? ['general'];
      questions.push({
        fieldId: field.id,
        name: field.name,
        status: statusOf(ratio, answered),
        score: round2(score),
        maxPoints,
        explanation: rubric.explanation,
        tags,
      });

      for (const tag of tags) {
        const t = tagTotals.get(tag) ?? {
          tag,
          score: 0,
          maxPoints: 0,
          percent: 0,
          questionsCount: 0,
          correctCount: 0,
        };
        t.score += score;
        t.maxPoints += maxPoints;
        t.questionsCount += 1;
        if (ratio >= 1) t.correctCount += 1;
        tagTotals.set(tag, t);
      }
    }
  }

  const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);
  let score = round2(questions.reduce((sum, q) => sum + q.score, 0));
  if (config.floorScoreToZero !== false && score < 0) score = 0;
  const percent = maxScore > 0 ? round2((Math.max(0, score) / maxScore) * 100) : 0;

  let isPassing: boolean | undefined;
  if (config.passingScore !== undefined || config.passingPercent !== undefined) {
    isPassing =
      (config.passingScore === undefined || score >= config.passingScore) &&
      (config.passingPercent === undefined || percent >= config.passingPercent);
  }

  const tags = [...tagTotals.values()].map((t) => ({
    ...t,
    score: round2(t.score),
    percent: t.maxPoints > 0 ? round2((Math.max(0, t.score) / t.maxPoints) * 100) : 0,
  }));

  const leftAppCount = (input.proctoringEvents ?? []).filter(
    (e) => e.type === 'app-blur' || e.type === 'tab-change',
  ).length;
  const answeredCount = questions.filter((q) => q.status !== 'unanswered').length;

  return {
    attemptId: input.attemptId,
    formId: schema.id,
    formVersion: schema.version ?? schema.updatedAt,
    responderId: input.responderId,
    startedAt: input.startedAt,
    submittedAt: input.submittedAt,
    score,
    maxScore,
    percent,
    isPassing,
    questions,
    tags,
    answeredCount,
    unansweredCount: questions.length - answeredCount,
    notShown,
    answers,
    timerExpired: Boolean(input.timerExpired),
    leftAppCount,
  };
}
