import type { GovernorSnapshot } from './types';
/**
 * The last decisions before a failure (Mars Pathfinder's lesson: you can only fix what you can
 * see). A fixed-size ring of compact lines, one per published change, persisted by the
 * launcher and sent home once, after a failed session. Lines carry codes, never user data.
 */
export interface FlightRecorder {
    record(snapshot: GovernorSnapshot): void;
    /** Oldest first. */
    lines(): readonly string[];
}
export declare const FLIGHT_RECORDER_SIZE = 48;
export declare function createFlightRecorder(sessionStartAt: number, size?: number): FlightRecorder;
/**
 * `seconds|action|frame|thermal|memory|visibility|contention|cap|boost|motion|reason|levels`.
 * Levels list only levers away from full quality, as `id=level`, sorted, so a line reads at a
 * glance and two lines diff cleanly.
 */
export declare function flightLine(snapshot: GovernorSnapshot, sessionStartAt: number): string;
//# sourceMappingURL=flightRecorder.d.ts.map