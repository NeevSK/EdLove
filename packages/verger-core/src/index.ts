/**
 * Verger: an app-level resource supervisor, subordinate to the operating system.
 *
 * This package is host-neutral. It knows resources, signals, levers and rules, never a
 * particular app: a host supplies its levers (with their declared rules), configuration
 * overrides, telemetry sink and experiment assignment. The platform packages (verger-android,
 * verger-react) supply sensing and the app-wide actuators.
 */
export {
  ACTIVATION_PRESETS,
  type ActivationCap,
  type ActivationPatch,
  type ActivationPresetName,
  activationForMode,
  modeForActivation,
  capActivation,
  type LeverActivation,
  leverActivation,
  type ObserveLevel,
  parseActivationPatch,
  resolveActivation,
  SENSORS,
  type SensorId,
  sensorOf,
  type VergerActivation,
} from './activation';
export { VERGER_BUILTIN_LEVERS, VERGER_GLOBAL_MOTION, VERGER_REFRESH_CAP } from './builtins';
export { DEFAULT_VERGER_CONFIG, validateConfig } from './config';
export {
  createRuntimeController,
  isValidEvent,
  type RuntimeController,
  type RuntimeControllerOptions,
  type RuntimePort,
  type RuntimeScheduler,
} from './controller';
export {
  assignExperiment,
  type ExperimentArm,
  type ExperimentAssignment,
  fnv1a32,
} from './experiment';
export {
  aggregateFrames,
  bottleneckTargets,
  classifyFrameWindow,
  type FrameSample,
  frameBottleneck,
  frameRate,
  gpuMeasured,
  missedVsyncs,
  shouldForwardWindow,
} from './frames';
export {
  capacityClassOf,
  type CreateVergerStateOptions,
  createVergerState,
  type VergerState,
  networkLimitOf,
  nextTimedChangeAt,
  reduceVerger,
  snapshotOf,
  staticFloors,
  UNKNOWN_CAPACITY,
  UNKNOWN_BATTERY,
  UNKNOWN_NETWORK,
} from './reducer';
export {
  type AccountReading,
  type AccountState,
  accountsRelievedBy,
  type Admission,
  admitWork,
  classesOfLever,
  estimateAccounts,
  RESOURCE_ACCOUNTS,
  type ResourceAccount,
  validateWorkloads,
  WORKLOAD_CLASSES,
  type WorkloadClass,
  type WorkloadSpec,
} from './demand';
export { defineHost, type VergerHost } from './host';
export { chooseLeverToLower, relieves, validateLevers } from './levers';
export {
  createFlightRecorder,
  FLIGHT_RECORDER_SIZE,
  type FlightRecorder,
  flightLine,
} from './flightRecorder';
export { createQualityMeter, type QualityMeter, qualityCost } from './quality';
export {
  classifySession,
  DEFAULT_RECOVERY_CONFIG,
  type ExitReason,
  type ExitRecord,
  foldSession,
  freshRecord,
  guardedRecord,
  type LaunchPlan,
  parseMarker,
  parseRecord,
  planLaunch,
  type RecoveryConfig,
  type Rung,
  type RuntimeLevel,
  type SessionMarker,
  type SessionOutcome,
  type Transition,
  validateRecoveryConfig,
  type VergerRecord,
} from './recovery';
export {
  canonicalLadderKey,
  ladderKey,
  policyKey,
  VERGER_POLICY,
  VERGER_POLICY_P5,
  type VergerPolicy,
  validatePolicy,
} from './policy';
export {
  createOutcomeLedger,
  DEFAULT_HOLD_WINDOW_MS,
  DEFAULT_JUDGE_WINDOW_MS,
  type LeverOutcomes,
  type MoveCause,
  type MoveDirection,
  type MoveRecord,
  type OutcomeLedger,
  type OutcomeLedgerOptions,
  type OutcomeSummary,
  type Verdict,
  outcomeAttributes,
  verdictLine,
} from './outcomes';
export { checkRun, checkSnapshot, type InvariantViolation } from './invariants';
export { comparePolicies, type PolicyReport } from './compare';
export {
  createSessionRecorder,
  DEFAULT_RECORDING_EVENTS,
  replayRecording,
  type SessionRecorder,
  type VergerRecording,
} from './recording';
export { replayVerger } from './replay';
export { createSelfCostMeter, type SelfCost, type SelfCostMeter } from './selfCost';
export {
  createSelfBudgetGuard,
  SELF_BUDGET_SHED,
  type SelfBudget,
  type SelfBudgetGuard,
  type SelfBudgetStage,
} from './selfBudget';
export { INEFFECTIVE_AFTER_MOVES, type IneffectiveFinding, ineffectiveFindings } from './selfRules';
export { createSessionLedger, type SessionLedger, type SessionReport } from './session';
export {
  createVerger,
  FLOORS_ACTIVATION,
  vergerFloors,
  type FrameTotals,
  type Verger,
  type VergerOptions,
  type VergerPlatform,
  type VergerStore,
} from './verger';
export { thermalLevelOf } from './signals';
export {
  bucketMs,
  configHash,
  createVergerTelemetry,
  VERGER_POLICY_VERSION,
  type VergerTelemetry,
  type VergerTelemetryOptions,
  type VergerTelemetrySink,
  reasonCode,
  type TelemetryValue,
} from './telemetry';
export type * from './types';
export { isBatteryLow } from './signals';
export {
  type DataBudgetState,
  type DataLedger,
  type DataSample,
  dataBudgetState,
  foldDataSample,
  inDailyWindow,
  localDay,
} from './dataBudget';
