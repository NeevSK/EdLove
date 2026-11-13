// How an activity runs (its mode), what happened in an attempt (its journal), and where it
// can sit (on a video's timeline). Pure: no React, storage or network, and nothing named after
// an app. boundary.test.ts holds that, so these can be published with the form builder.
export {
  type AssistanceKind,
  type AttemptStep,
  appendStep,
  assistanceByPart,
  gradeInputFromJournal,
  type Journal,
  type PartAssistance,
} from './journal';
export {
  type ActivityMode,
  assessmentConfigFor,
  isRevealed,
  MODE_DEFAULTS,
  type ModeOverrides,
  type ModePolicy,
  type Reveal,
  resolveMode,
  rubricForPolicy,
  schemaForMode,
} from './mode';
export {
  advanceCues,
  answerCue,
  type CuePolicy,
  type CueProblem,
  type CueState,
  type CueStep,
  canResume,
  DEFAULT_CUE_POLICY,
  dismissCue,
  initialCueState,
  prepareCues,
  type VideoCue,
} from './videoCues';
