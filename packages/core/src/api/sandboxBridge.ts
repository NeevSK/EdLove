import { type DemoIntent, useExperienceState } from '@repo/core/lib/experienceState';

/**
 * Whitelist of supported mutation actions eligible for graduation/replay.
 * Enforces the Hostile Critic Invariant: explicit call sites, no dynamic string-dispatch.
 */
export const WHITELISTED_REPLAY_ACTIONS = [
  'classrooms.create',
  'school.create',
  'school.update',
  'assignments.create',
  'profile.update',
] as const;

export type WhitelistedReplayAction = (typeof WHITELISTED_REPLAY_ACTIONS)[number];

export function isReplayableAction(actionKey: string): actionKey is WhitelistedReplayAction {
  return (WHITELISTED_REPLAY_ACTIONS as readonly string[]).includes(actionKey);
}

export interface ReplayOptions {
  /** Optional custom dispatch map (e.g. for testing, mocks, or headless invocation) */
  customDispatchers?: Partial<
    Record<WhitelistedReplayAction, (payload: unknown) => Promise<unknown>>
  >;
  /** Clear successfully replayed intents from demoLogs upon completion (default: true) */
  clearOnComplete?: boolean;
}

export interface ReplayReport {
  total: number;
  replayed: number;
  skipped: number;
  failed: Array<{
    intent: DemoIntent;
    error: string;
  }>;
}

/**
 * Replays captured demo write intents against the real backend during account graduation.
 *
 * Temporarily sets `isBridging = true` in ExperienceState so that `createResonantProxy`
 * and `interceptApiCall` do not intercept these writes as demo no-ops.
 */
export async function replayDemoLogs(options: ReplayOptions = {}): Promise<ReplayReport> {
  const { customDispatchers = {}, clearOnComplete = true } = options;
  const state = useExperienceState.getState();
  const logs = [...state.demoLogs];

  if (logs.length === 0) {
    return { total: 0, replayed: 0, skipped: 0, failed: [] };
  }

  const report: ReplayReport = {
    total: logs.length,
    replayed: 0,
    skipped: 0,
    failed: [],
  };

  // Turn on bridging mode to prevent proxy interception
  state.setBridging(true);

  try {
    for (const log of logs) {
      const actionKey = `${log.module}.${log.method}`;

      if (!isReplayableAction(actionKey)) {
        report.skipped++;
        continue;
      }

      try {
        const customFn = customDispatchers[actionKey];
        if (customFn) {
          await customFn(log.payload);
        } else {
          await executeDefaultReplay(actionKey, log.payload);
        }
        report.replayed++;
      } catch (err: unknown) {
        report.failed.push({
          intent: log,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } finally {
    state.setBridging(false);
  }

  if (clearOnComplete && report.failed.length === 0 && report.replayed > 0) {
    state.clearDemoLogs();
  }

  return report;
}

async function executeDefaultReplay(action: WhitelistedReplayAction, payload: unknown): Promise<unknown> {
  switch (action) {
    case 'classrooms.create': {
      const { classroomsAPI } = await import('@repo/core/api/orchestration/educational');
      return classroomsAPI.create(payload as any);
    }
    case 'school.create': {
      const { schoolAPI } = await import('@repo/core/api/orchestration/operations');
      return schoolAPI.create(payload as any);
    }
    case 'school.update': {
      const { schoolAPI } = await import('@repo/core/api/orchestration/operations');
      const p = payload as { id: string; [key: string]: unknown };
      return schoolAPI.update(p.id, p);
    }
    case 'assignments.create': {
      const { assignmentsAPI } = await import('@repo/core/api/orchestration/educational');
      return assignmentsAPI.create(payload as any);
    }
    case 'profile.update': {
      const { profileAPI } = await import('@repo/core/api/orchestration/identity');
      const p = payload as { id: string; [key: string]: unknown };
      return profileAPI.updateProfile(p.id, p);
    }
  }
}

/**
 * Inspect pending demo intents and inspect readiness for bridging.
 */
export function getPendingReplaySummary(): {
  total: number;
  replayable: number;
  unsupported: number;
  replayableActions: WhitelistedReplayAction[];
} {
  const logs = useExperienceState.getState().demoLogs;
  let replayable = 0;
  let unsupported = 0;
  const actions: WhitelistedReplayAction[] = [];

  for (const log of logs) {
    const key = `${log.module}.${log.method}`;
    if (isReplayableAction(key)) {
      replayable++;
      actions.push(key);
    } else {
      unsupported++;
    }
  }

  return {
    total: logs.length,
    replayable,
    unsupported,
    replayableActions: actions,
  };
}
