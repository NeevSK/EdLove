import type { CreateVergerStateOptions } from './reducer';
import type { VergerPolicy } from './policy';
import type { VergerEvent, VergerSnapshot } from './types';

/**
 * One session's inputs (D1): what the policy was created from and every event it reduced, in
 * the order it reduced them. Replaying it through the same policy reproduces every snapshot
 * exactly, so a phone's session can be judged, and other policies compared, on a laptop. It
 * holds device facts and sensor readings, never personal data, and leaves the device only
 * through a sink the host configures.
 */
export interface VergerRecording {
  readonly policyVersion: number;
  readonly options: CreateVergerStateOptions;
  /** Reduction order, not timestamp order: a late-stamped signal is replayed where it landed. */
  readonly events: readonly VergerEvent[];
  /**
   * Events past the bound, not kept. Replay needs the start, so the head is kept and the tail
   * dropped; a recording with drops reproduces the session only up to its last kept event.
   */
  readonly dropped: number;
}

export interface SessionRecorder {
  record(event: VergerEvent): void;
  recording(): VergerRecording;
}

export const DEFAULT_RECORDING_EVENTS = 4000;

export function createSessionRecorder(
  policyVersion: number,
  options: CreateVergerStateOptions,
  maxEvents: number = DEFAULT_RECORDING_EVENTS,
): SessionRecorder {
  const events: VergerEvent[] = [];
  let dropped = 0;
  const limit = Math.max(0, Math.floor(maxEvents));
  return {
    record(event) {
      if (events.length < limit) events.push(event);
      else dropped += 1;
    },
    recording: () => ({ policyVersion, options, events: [...events], dropped }),
  };
}

/**
 * Replays a recording in its own order (unlike `replayVerger`, which sorts by time) and returns
 * every snapshot published. Refuses a policy of another version: its snapshots would not be the
 * session's.
 */
export function replayRecording(
  recording: VergerRecording,
  policy: VergerPolicy,
): { readonly snapshots: VergerSnapshot[]; readonly final: VergerSnapshot } {
  if (policy.version !== recording.policyVersion)
    throw new Error(
      `recording is of policy ${recording.policyVersion}, not ${policy.version}; compare with replayVerger instead`,
    );
  let state = policy.create(recording.options);
  const snapshots: VergerSnapshot[] = [policy.snapshot(state)];
  let lastVersion = policy.outputVersion(state);
  for (const event of recording.events) {
    state = policy.reduce(state, event);
    const version = policy.outputVersion(state);
    if (version !== lastVersion) {
      lastVersion = version;
      snapshots.push(policy.snapshot(state));
    }
  }
  return { snapshots, final: policy.snapshot(state) };
}
