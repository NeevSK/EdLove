import { type CreateGovernorOptions } from './governor';
import type { GovernorEvent, GovernorSnapshot } from './types';
/**
 * Replays a recorded or synthetic event stream through the governor. Used by tests and by the
 * diagnostics tooling to answer "what would the governor have done" for a captured session.
 */
export declare function replayGovernor(options: CreateGovernorOptions, events: readonly GovernorEvent[]): {
    readonly snapshots: GovernorSnapshot[];
    readonly final: GovernorSnapshot;
};
//# sourceMappingURL=replay.d.ts.map