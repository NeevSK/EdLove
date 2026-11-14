// How an activity runs (its mode), what happened in an attempt (its journal), and where it
// can sit (on a video's timeline). Pure: no React, storage or network, and nothing named after
// an app. boundary.test.ts holds that, so these can be published with the form builder.

export { type Calibration, calibrationOf, reflectionsOf, type Sureness } from './calibration';
export { type FromH5P, fromH5PEvent, type H5PEventLike } from './fromH5P';
export {
  type AssistanceKind,
  type AttemptStep,
  appendStep,
  assistanceByPart,
  type Confidence,
  gradeInputFromJournal,
  type Journal,
  type PartAssistance,
  type ReflectionStage,
} from './journal';
export {
  answerLive,
  createHost,
  createParticipant,
  DEFAULT_LIVE_HOST_POLICY,
  type HostCommand,
  HostMessage,
  type HostOutput,
  type HostState,
  hostCommand,
  hostReceive,
  joinMessage,
  LIVE_VERSION,
  type LiveHostPolicy,
  type LiveResponse,
  ParticipantMessage,
  type ParticipantOutput,
  type ParticipantState,
  participantReceive,
  reconnect,
  snapshotOf,
  tallyFor,
} from './live';
export {
  createFrameReader,
  DEFAULT_TRANSPORT_POLICY,
  encodeFrame,
  type LiveTransport,
  MAX_FRAME_CHARS,
  onLinkStatus,
  type TransportAvailability,
  type TransportKind,
  type TransportPolicy,
  type TransportStatus,
  transportsToTry,
} from './liveTransport';
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
