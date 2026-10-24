import { reasonCode } from './telemetry';
import type { VergerSnapshot } from './types';

/**
 * The last decisions before a failure (Mars Pathfinder's lesson: you can only fix what you can
 * see). A fixed-size ring of compact lines, one per published change, persisted by the
 * launcher and sent home once, after a failed session. Lines carry codes, never user data.
 */
export interface FlightRecorder {
  record(snapshot: VergerSnapshot): void;
  /** Oldest first. */
  lines(): readonly string[];
}

export const FLIGHT_RECORDER_SIZE = 48;

export function createFlightRecorder(
  sessionStartAt: number,
  size: number = FLIGHT_RECORDER_SIZE,
): FlightRecorder {
  const ring: string[] = [];
  return {
    record(snapshot) {
      ring.push(flightLine(snapshot, sessionStartAt));
      if (ring.length > size) ring.splice(0, ring.length - size);
    },
    lines: () => [...ring],
  };
}

/**
 * `seconds|action|frame|thermal|memory|visibility|contention|cap|boost|motion|reason|levels`.
 * Levels list only levers away from full quality, as `id=level`, sorted, so a line reads at a
 * glance and two lines diff cleanly.
 */
export function flightLine(snapshot: VergerSnapshot, sessionStartAt: number): string {
  const seconds = Math.max(0, Math.round((snapshot.at - sessionStartAt) / 100) / 10);
  const lowered = Object.entries(snapshot.proposedLevels)
    .filter(([, level]) => level > 0)
    .map(([id, level]) => `${id}=${level}`)
    .sort()
    .join(',');
  return [
    seconds,
    snapshot.lastAction,
    snapshot.frameState,
    snapshot.thermal,
    snapshot.memory,
    snapshot.visibility,
    snapshot.contention + (snapshot.contentionExhausted ? '!' : ''),
    snapshot.refreshCapHz ?? '-',
    snapshot.cpuBoost ? 'B' : '-',
    snapshot.globalReducedMotion ? 'M' : '-',
    reasonCode(snapshot.lastReason).replace(/\|/g, '/'),
    lowered,
  ].join('|');
}
