/**
 * @repo/form-builder/quiz — marking for quizzes built in the form studio.
 *
 * Pure logic on top of @intuitui-labs/form-builder-engine: no storage, no
 * network, no React. Screens and storage adapters plug in around it.
 */
export {
  blankRubricFor,
  type GradedField,
  gradableKindsFor,
  gradedFields,
  isGradableField,
  missingQuizModeConfig,
  SCHOOL_QUIZ_DEFAULTS,
  withQuizMode,
} from './authoring';
export {
  type AppliedDraft,
  applyDraft,
  type ChoiceDraft,
  draftFromField,
  type MarkingDraft,
  newChoice,
  removeChoice,
  toggleCorrect,
} from './draft';
export {
  type GradeQuizInput,
  gradeQuiz,
  type QuestionStatus,
  type QuizAttempt,
  type QuizQuestionResult,
  type QuizTagResult,
} from './grade';
export { isBlankAnswer, normalizeAnswerText, parseNumberAnswer } from './normalize';
export {
  checkQuizReadiness,
  type QuizProblem,
  type QuizProblemCode,
  type QuizReadiness,
} from './readiness';
