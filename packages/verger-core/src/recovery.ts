import type { SessionReport } from './session';
import type { GovernorMode, MemoryLevel, ThermalLevel } from './types';

/**
 * Recovery, healing and growth across launches.
 *
 * Everything here is pure and runs once per launch: read what the last session left behind,
 * judge how it ended, fold that into the record, and decide how much of verger this launch may
 * run. State changes only at boot, from a record written before anything risky starts
 * (crash-only design): there is no shutdown path to get right, because there may be none.
 *
 * Three things are learned, each with its own evidence and its own way back:
 * - The ladder (safety): failures attributed to verger step it down rung by rung; clean
 *   sessions step it back up one rung at a time, more slowly after each relapse.
 * - Trust (in the learned profile): halves on a failure, grows a little per clean session.
 * - The profile (per device build): a starting point for the closed loop, and a grant that
 *   relaxes capacity floors after sessions that proved the device can carry more.
 */

/** Why the platform says the process ended (Android `ApplicationExitInfo`, API 30+). */
export type ExitReason =
  | 'crash'
  | 'native-crash'
  | 'anr'
  | 'excessive-resource'
  | 'low-memory'
  | 'user'
  | 'self'
  | 'signaled'
  | 'other';

export interface ExitRecord {
  readonly reason: ExitReason;
  /** Wall-clock milliseconds when the process ended. */
  readonly atWallMs: number;
  /** The process was visible to the user when it ended. */
  readonly foreground: boolean;
}

/** Exits that are the app failing, as opposed to the system or the user ending it. */
const FAILURES: ReadonlySet<ExitReason> = new Set([
  'crash',
  'native-crash',
  'anr',
  'excessive-resource',
]);

/**
 * How much of verger runs. Each rung removes one more thing that could be the cause.
 * 0: everything. 1: no learned profile (it starts from scratch). 2: no hardware levers.
 * 3: shadow only (senses and decides, applies nothing). 4: off, native code included; left
 * only by a new policy version or a new app release, never by waiting.
 */
export type Rung = 0 | 1 | 2 | 3 | 4;

export type RuntimeLevel = 'off' | GovernorMode;

export interface RecoveryConfig {
  /** Failures within `failureWindowMs` that step the ladder down one rung (restart intensity). */
  readonly failuresToEscalate: number;
  readonly failureWindowMs: number;
  /** Clean sessions needed to step back up one rung, doubled after each relapse. */
  readonly cleanToRecover: number;
  readonly maxRelapseDoublings: number;
  /** A session shorter than this in the foreground is evidence of nothing. */
  readonly minEvidenceForegroundMs: number;
  readonly trustInitial: number;
  readonly trustPerCleanSession: number;
  /** Below this trust the learned starting point is not used. */
  readonly trustForPriors: number;
  /** Below this trust the device earns no growth. */
  readonly trustForGrowth: number;
  /** Proving sessions in a row that earn one step of growth. */
  readonly provingSessionsToGrow: number;
  readonly maxGrant: number;
  readonly provingForegroundMs: number;
  /** Stressed share of foreground time at or below which a session proves capacity. */
  readonly provingStressedShare: number;
  /** Stressed share at or above which a session shows strain and gives a step back. */
  readonly strainStressedShare: number;
  /** Weight of the newest session in the learned starting point. */
  readonly priorWeight: number;
  /** Share of eligible launches deliberately run on a lower rung, so degraded paths stay exercised. */
  readonly exercisePercent: number;
}

export const DEFAULT_RECOVERY_CONFIG: RecoveryConfig = {
  failuresToEscalate: 2,
  failureWindowMs: 24 * 60 * 60 * 1000,
  cleanToRecover: 3,
  maxRelapseDoublings: 3,
  minEvidenceForegroundMs: 30_000,
  trustInitial: 0.5,
  trustPerCleanSession: 0.1,
  trustForPriors: 0.6,
  trustForGrowth: 0.8,
  provingSessionsToGrow: 3,
  maxGrant: 2,
  provingForegroundMs: 120_000,
  provingStressedShare: 0.05,
  strainStressedShare: 0.2,
  priorWeight: 0.5,
  exercisePercent: 0,
};

/** Written during a session, read at the next launch. */
export interface SessionMarker {
  readonly v: 1;
  readonly startedAtWall: number;
  /** `starting` until the native side is up: dying then points at verger itself. */
  readonly phase: 'starting' | 'running' | 'stopped';
  readonly foreground: boolean;
  readonly runtime: RuntimeLevel;
  readonly rung: Rung;
  readonly exercise: boolean;
  readonly report: SessionReport | null;
}

export interface VergerRecord {
  readonly v: 1;
  /** Policy version and release the ladder belongs to; a new one starts the ladder over. */
  readonly key: string;
  readonly ladder: {
    readonly rung: Rung;
    /** Wall times of recent failures, inside the failure window. */
    readonly failures: readonly number[];
    readonly clean: number;
    readonly relapses: number;
  };
  readonly profile: {
    /** Hash of the build fingerprint the profile was learned on, or null if unknown. */
    readonly device: string | null;
    readonly trust: number;
    readonly grant: number;
    readonly proving: number;
    readonly prior: Readonly<Record<string, number>>;
  };
}

export type SessionOutcome =
  | { readonly kind: 'none' }
  | {
      readonly kind: 'clean';
      readonly marker: SessionMarker;
      readonly exit: ExitReason | null;
    }
  | {
      readonly kind: 'failure';
      readonly marker: SessionMarker;
      /** The platform's exit reason, or `unclean` when the process died visible with no record. */
      readonly cause: ExitReason | 'unclean';
      /** Died before verger's native side was up: the strongest evidence against verger. */
      readonly boot: boolean;
    };

export interface LaunchPlan {
  readonly runtime: RuntimeLevel;
  readonly rung: Rung;
  /** A deliberately degraded launch (exercise share); its results feed no growth. */
  readonly exercise: boolean;
  /** Whether verger may drive hardware (refresh rate, CPU hints, global motion). */
  readonly hardware: boolean;
  /** Starting pressure per lever; the closed loop raises it back as soon as it is comfortable. */
  readonly prior: Readonly<Record<string, number>>;
  /** Steps of capacity floor relaxed on this device. */
  readonly grant: number;
  readonly reason: string;
}

export interface Transition {
  readonly from: Rung;
  readonly to: Rung;
  readonly trustFrom: number;
  readonly trustTo: number;
  readonly grantFrom: number;
  readonly grantTo: number;
}

export function freshRecord(
  key: string,
  device: string | null,
  config: RecoveryConfig,
): VergerRecord {
  return {
    v: 1,
    key,
    ladder: { rung: 0, failures: [], clean: 0, relapses: 0 },
    profile: freshProfile(device, config),
  };
}

const freshProfile = (device: string | null, config: RecoveryConfig): VergerRecord['profile'] => ({
  device,
  trust: config.trustInitial,
  grant: 0,
  proving: 0,
  prior: {},
});

/**
 * How the last session ended. The exit that ended it is the first one after it started (the
 * process that wrote the marker is the first to die after writing it). Without an exit
 * record, a process that died while visible is counted as a failure: on Android a user
 * closing the app sends it to the background first, so visible deaths are rarely benign.
 */
export function classifySession(
  marker: SessionMarker | null,
  exits: readonly ExitRecord[] | null,
): SessionOutcome {
  if (!marker) return { kind: 'none' };
  if (marker.phase === 'stopped') return { kind: 'clean', marker, exit: null };
  const exit = exits
    ?.filter((e) => e.atWallMs >= marker.startedAtWall)
    .reduce<ExitRecord | null>(
      (first, e) => (first && first.atWallMs <= e.atWallMs ? first : e),
      null,
    );
  const boot = marker.phase === 'starting';
  if (exit) {
    return FAILURES.has(exit.reason)
      ? { kind: 'failure', marker, cause: exit.reason, boot }
      : { kind: 'clean', marker, exit: exit.reason };
  }
  return marker.foreground
    ? { kind: 'failure', marker, cause: 'unclean', boot }
    : { kind: 'clean', marker, exit: null };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

const COOL: ReadonlySet<ThermalLevel> = new Set(['unknown', 'nominal']);
const ROOMY: ReadonlySet<MemoryLevel> = new Set(['unknown', 'normal']);

/**
 * Folds the last session into the record. Order matters and is fixed: a changed policy or
 * release restarts the ladder; a changed device build restarts the profile; then the outcome
 * moves the ladder, trust and growth. A session in which verger was off moves nothing: its
 * failures are not verger's, and its clean runs prove nothing about verger.
 */
export function foldSession(
  record: VergerRecord,
  outcome: SessionOutcome,
  context: { readonly key: string; readonly device: string | null; readonly nowWall: number },
  config: RecoveryConfig,
): { readonly record: VergerRecord; readonly transition: Transition } {
  let ladder =
    record.key === context.key ? record.ladder : freshRecord(context.key, null, config).ladder;
  let profile =
    record.profile.device === context.device
      ? record.profile
      : freshProfile(context.device, config);
  const from = { rung: ladder.rung, trust: profile.trust, grant: profile.grant };

  if (outcome.kind !== 'none' && outcome.marker.runtime !== 'off') {
    const report = outcome.marker.report;
    if (outcome.kind === 'failure') {
      const failures = [
        ...ladder.failures.filter(
          (t) => context.nowWall - t < config.failureWindowMs && t <= context.nowWall,
        ),
        context.nowWall,
      ];
      // A boot failure removes the suspect outright (Spirit: boot without it); otherwise
      // step down one rung once failures reach the restart intensity.
      const escalate = outcome.boot || failures.length >= config.failuresToEscalate;
      const rung = outcome.boot
        ? 4
        : escalate
          ? (Math.min(4, ladder.rung + 1) as Rung)
          : ladder.rung;
      ladder = {
        rung,
        failures: escalate ? [] : failures,
        clean: 0,
        relapses: escalate ? ladder.relapses + 1 : ladder.relapses,
      };
      profile = { ...profile, trust: round2(profile.trust / 2), grant: 0, proving: 0 };
      if (rung >= 1) profile = { ...profile, prior: {} };
    } else if (
      outcome.kind === 'clean' &&
      report &&
      report.foregroundMs >= config.minEvidenceForegroundMs
    ) {
      const needed =
        config.cleanToRecover *
        2 ** Math.min(Math.max(0, ladder.relapses - 1), config.maxRelapseDoublings);
      const clean = ladder.clean + 1;
      const recovers = ladder.rung > 0 && ladder.rung < 4 && clean >= needed;
      ladder = {
        ...ladder,
        rung: recovers ? ((ladder.rung - 1) as Rung) : ladder.rung,
        clean: recovers ? 0 : clean,
      };
      profile = { ...profile, trust: round2(clamp01(profile.trust + config.trustPerCleanSession)) };
      const learns =
        outcome.marker.rung === 0 &&
        !outcome.marker.exercise &&
        outcome.marker.runtime === 'active';
      if (learns) profile = learn(profile, report, config);
    }
  }

  return {
    record: { v: 1, key: context.key, ladder, profile },
    transition: {
      from: from.rung,
      to: ladder.rung,
      trustFrom: from.trust,
      trustTo: profile.trust,
      grantFrom: from.grant,
      grantTo: profile.grant,
    },
  };
}

/**
 * Healing and growth from one clean, fully governed session. Growth is additive and earned
 * (several proving sessions, at high trust); giving it back is immediate on strain (AIMD).
 * The starting point is a moving average of where the closed loop held each lever.
 */
function learn(
  profile: VergerRecord['profile'],
  report: SessionReport,
  config: RecoveryConfig,
): VergerRecord['profile'] {
  const share = report.foregroundMs > 0 ? report.stressedMs / report.foregroundMs : 0;
  const strain =
    share >= config.strainStressedShare ||
    report.worstThermal === 'hot' ||
    report.worstThermal === 'critical' ||
    report.worstMemory === 'low';
  const proving =
    report.foregroundMs >= config.provingForegroundMs &&
    share <= config.provingStressedShare &&
    COOL.has(report.worstThermal) &&
    ROOMY.has(report.worstMemory) &&
    !report.contentionExhausted;

  let { grant, proving: streak } = profile;
  if (strain) {
    grant = Math.max(0, grant - 1);
    streak = 0;
  } else if (proving) {
    streak += 1;
    if (
      streak >= config.provingSessionsToGrow &&
      profile.trust >= config.trustForGrowth &&
      grant < config.maxGrant
    ) {
      grant += 1;
      streak = 0;
    }
  }

  const prior: Record<string, number> = {};
  const ids = new Set([...Object.keys(profile.prior), ...Object.keys(report.pressure)]);
  for (const id of ids) {
    const value = round2(
      (1 - config.priorWeight) * (profile.prior[id] ?? 0) +
        config.priorWeight * (report.pressure[id] ?? 0),
    );
    if (value >= 0.05) prior[id] = value;
  }
  return { ...profile, grant, proving: streak, prior };
}

/**
 * What this launch may run. The requested level (from the host and the experiment) is a
 * ceiling the ladder can only lower. A learned starting point is used only at full trust in
 * the ladder (rung 0) and enough trust in the profile, and only as whole levels the loop held
 * for most of the time (rounded down: start at higher quality when unsure).
 */
export function planLaunch(
  record: VergerRecord,
  requested: GovernorMode,
  random: number,
  config: RecoveryConfig,
): LaunchPlan {
  const { rung } = record.ladder;
  const { trust, grant } = record.profile;
  if (rung === 4) {
    return {
      runtime: 'off',
      rung,
      exercise: false,
      hardware: false,
      prior: {},
      grant: 0,
      reason: 'rung-4-off',
    };
  }
  if (rung === 3) {
    return {
      runtime: 'shadow',
      rung,
      exercise: false,
      hardware: false,
      prior: {},
      grant: 0,
      reason: 'rung-3-shadow',
    };
  }
  const exercise = rung === 0 && requested === 'active' && random * 100 < config.exercisePercent;
  if (exercise) {
    return {
      runtime: requested,
      rung,
      exercise,
      hardware: false,
      prior: {},
      grant: 0,
      reason: 'exercise',
    };
  }
  const prior: Record<string, number> = {};
  if (rung === 0 && trust >= config.trustForPriors) {
    for (const [id, value] of Object.entries(record.profile.prior)) {
      const level = Math.floor(value);
      if (level > 0) prior[id] = level;
    }
  }
  return {
    runtime: requested,
    rung,
    exercise: false,
    hardware: rung < 2,
    prior,
    grant: rung === 0 ? grant : 0,
    reason: `rung-${rung}`,
  };
}

// ---------------------------------------------------------------------------------------------
// Persistence: strict parsing. Anything malformed is treated as absent, never half-trusted.
// ---------------------------------------------------------------------------------------------

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isRung = (v: unknown): v is Rung => v === 0 || v === 1 || v === 2 || v === 3 || v === 4;
const isLevelMap = (v: unknown): v is Record<string, number> =>
  isObject(v) && Object.values(v).every((x) => isFiniteNumber(x) && x >= 0 && x <= 16);
const THERMALS: readonly unknown[] = ['unknown', 'nominal', 'warm', 'hot', 'critical'];
const MEMORIES: readonly unknown[] = ['unknown', 'normal', 'trimmed', 'low'];

function parseJson(text: string | null | undefined): unknown {
  if (typeof text !== 'string' || text.length === 0 || text.length > 64_000) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseReport(v: unknown): SessionReport | null | undefined {
  if (v === null) return null;
  if (!isObject(v)) return undefined;
  const ok =
    isFiniteNumber(v.foregroundMs) &&
    v.foregroundMs >= 0 &&
    isFiniteNumber(v.stressedMs) &&
    v.stressedMs >= 0 &&
    THERMALS.includes(v.worstThermal) &&
    MEMORIES.includes(v.worstMemory) &&
    typeof v.contentionExhausted === 'boolean' &&
    isFiniteNumber(v.qualityCost) &&
    isLevelMap(v.pressure);
  return ok ? (v as unknown as SessionReport) : undefined;
}

export function parseMarker(text: string | null | undefined): SessionMarker | null {
  const v = parseJson(text);
  if (!isObject(v) || v.v !== 1) return null;
  const report = parseReport(v.report);
  const ok =
    isFiniteNumber(v.startedAtWall) &&
    (v.phase === 'starting' || v.phase === 'running' || v.phase === 'stopped') &&
    typeof v.foreground === 'boolean' &&
    (v.runtime === 'off' || v.runtime === 'shadow' || v.runtime === 'active') &&
    isRung(v.rung) &&
    typeof v.exercise === 'boolean' &&
    report !== undefined;
  return ok ? (v as unknown as SessionMarker) : null;
}

export function parseRecord(text: string | null | undefined): VergerRecord | null {
  const v = parseJson(text);
  if (!isObject(v) || v.v !== 1 || typeof v.key !== 'string') return null;
  const { ladder, profile } = v;
  if (!isObject(ladder) || !isObject(profile)) return null;
  const ladderOk =
    isRung(ladder.rung) &&
    Array.isArray(ladder.failures) &&
    ladder.failures.length <= 64 &&
    ladder.failures.every(isFiniteNumber) &&
    isFiniteNumber(ladder.clean) &&
    ladder.clean >= 0 &&
    isFiniteNumber(ladder.relapses) &&
    ladder.relapses >= 0;
  const profileOk =
    (profile.device === null || typeof profile.device === 'string') &&
    isFiniteNumber(profile.trust) &&
    profile.trust >= 0 &&
    profile.trust <= 1 &&
    isFiniteNumber(profile.grant) &&
    profile.grant >= 0 &&
    profile.grant <= 8 &&
    isFiniteNumber(profile.proving) &&
    profile.proving >= 0 &&
    isLevelMap(profile.prior);
  return ladderOk && profileOk ? (v as unknown as VergerRecord) : null;
}

/** Validates a recovery configuration. Throws at startup, never at decision time. */
export function validateRecoveryConfig(config: RecoveryConfig): void {
  for (const [key, value] of Object.entries(config)) {
    if (!isFiniteNumber(value) || value < 0)
      throw new Error(`Recovery "${key}" must be a finite non-negative number`);
  }
  const unit = [
    'trustInitial',
    'trustPerCleanSession',
    'trustForPriors',
    'trustForGrowth',
    'provingStressedShare',
    'strainStressedShare',
    'priorWeight',
  ] as const;
  for (const key of unit)
    if (config[key] > 1) throw new Error(`Recovery "${key}" must be at most 1`);
  if (config.exercisePercent > 100)
    throw new Error('Recovery "exercisePercent" must be at most 100');
  if (config.failuresToEscalate < 1 || config.cleanToRecover < 1)
    throw new Error('Recovery "failuresToEscalate" and "cleanToRecover" must be at least 1');
  if (!(config.provingStressedShare < config.strainStressedShare))
    throw new Error('Recovery "provingStressedShare" must be below "strainStressedShare"');
}
