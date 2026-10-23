/**
 * Verger: an app-level resource supervisor, subordinate to the operating system.
 *
 * This package is host-neutral. It knows resources, signals, levers and rules, never a
 * particular app: a host supplies its levers (with their declared rules), configuration
 * overrides, telemetry sink and experiment assignment. The platform packages (verger-android,
 * verger-react) supply sensing and the app-wide actuators.
 */
export { VERGER_BUILTIN_LEVERS, VERGER_GLOBAL_MOTION, VERGER_REFRESH_CAP } from './builtins';
export { DEFAULT_GOVERNOR_CONFIG } from './config';
export { createRuntimeController, isValidEvent, type RuntimeController, type RuntimeControllerOptions, type RuntimePort, type RuntimeScheduler, } from './controller';
export { assignExperiment, type ExperimentArm, type ExperimentAssignment, fnv1a32, } from './experiment';
export { aggregateFrames, bottleneckTargets, classifyFrameWindow, type FrameSample, frameBottleneck, frameRate, gpuMeasured, missedVsyncs, shouldForwardWindow, } from './frames';
export { type CreateGovernorOptions, createGovernor, type GovernorState, nextTimedChangeAt, reduceGovernor, snapshotOf, staticFloors, UNKNOWN_CAPACITY, } from './governor';
export { defineHost, type VergerHost } from './host';
export { chooseLeverToLower, relieves, validateLevers } from './levers';
export { createFlightRecorder, FLIGHT_RECORDER_SIZE, type FlightRecorder, flightLine, } from './flightRecorder';
export { createQualityMeter, type QualityMeter, qualityCost } from './quality';
export { classifySession, DEFAULT_RECOVERY_CONFIG, type ExitReason, type ExitRecord, foldSession, freshRecord, type LaunchPlan, parseMarker, parseRecord, planLaunch, type RecoveryConfig, type Rung, type RuntimeLevel, type SessionMarker, type SessionOutcome, type Transition, validateRecoveryConfig, type VergerRecord, } from './recovery';
export { replayGovernor } from './replay';
export { createSessionLedger, type SessionLedger, type SessionReport } from './session';
export { createVerger, type FrameTotals, type Verger, type VergerOptions, type VergerPlatform, type VergerStore, } from './verger';
export { thermalLevelOf } from './signals';
export { bucketMs, configHash, createGovernorTelemetry, GOVERNOR_POLICY_VERSION, type GovernorTelemetry, type GovernorTelemetryOptions, type GovernorTelemetrySink, reasonCode, type TelemetryValue, } from './telemetry';
export type * from './types';
//# sourceMappingURL=index.d.ts.map