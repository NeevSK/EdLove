import {
  type AssessmentState,
  evaluateScoreCondition,
  type QuestionEvaluation,
} from '@intuitui-labs/form-builder-engine/assessment';
import { evaluateCondition } from '@intuitui-labs/form-builder-engine/core';
import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import type { QuizAttempt } from './grade';

/**
 * Which page comes next. Follows the schema's jump rules in order, then the
 * page's default next page, then the next page in the list. A rule that
 * points back to a page already seen is ignored, so a badly drawn branch can
 * never trap a student in a loop; they move forward instead.
 */
export function nextPageId(
  schema: FormSchema,
  currentPageId: string,
  values: Readonly<Record<string, unknown>>,
  visited: readonly string[],
  /** Marks so far; needed only for score-based jump rules. */
  marksSoFar?: QuizAttempt,
): string | null {
  const pages = schema.pages;
  const index = pages.findIndex((p) => p.id === currentPageId);
  if (index < 0) return null;
  const page = pages[index]!;
  const seen = new Set([...visited, currentPageId]);
  const exists = (id: string | undefined): id is string =>
    Boolean(id) && pages.some((p) => p.id === id) && !seen.has(id as string);

  for (const rule of page.jumpRules ?? []) {
    const byAnswer = rule.condition
      ? evaluateCondition(rule.condition, values as Record<string, unknown>)
      : true;
    const byScore = rule.scoreCondition
      ? marksSoFar
        ? evaluateScoreCondition(rule.scoreCondition, asAssessmentState(marksSoFar))
        : false
      : true;
    if (byAnswer && byScore && exists(rule.targetPageId)) return rule.targetPageId;
  }
  if (exists(page.defaultNextPageId)) return page.defaultNextPageId;
  for (let i = index + 1; i < pages.length; i++) {
    if (!seen.has(pages[i]!.id)) return pages[i]!.id;
  }
  return null;
}

/** The engine's score conditions read an AssessmentState; this builds one from marks. */
export function asAssessmentState(attempt: QuizAttempt): AssessmentState {
  const evaluations: Record<string, QuestionEvaluation> = {};
  for (const q of attempt.questions) {
    const evaluation: QuestionEvaluation = {
      fieldId: q.name,
      isCorrect: q.status === 'correct',
      score: q.score,
      maxPoints: q.maxPoints,
      negativePenalty: q.score < 0 ? -q.score : 0,
      partialCreditRatio:
        q.status === 'correct'
          ? 1
          : q.status === 'partly-correct' && q.maxPoints > 0
            ? q.score / q.maxPoints
            : 0,
      attemptsUsed: 1,
      hintUsed: false,
      answeredAt: attempt.submittedAt,
      userAnswer: attempt.answers[q.name],
    };
    // Rules may name a question by its id or its name.
    evaluations[q.name] = evaluation;
    evaluations[q.fieldId] = evaluation;
  }
  return {
    evaluations,
    totalScore: attempt.score,
    maxPossibleScore: attempt.maxScore,
    scorePercent: attempt.percent,
    isPassing: attempt.isPassing ?? true,
    categoryScores: Object.fromEntries(attempt.tags.map((t) => [t.tag, t])),
    isGlobalExpired: false,
    isStepExpired: false,
    proctoringEvents: [],
    currentStreak: 0,
    maxStreak: 0,
    streakMultiplier: 1,
    tagMastery: {},
  };
}
