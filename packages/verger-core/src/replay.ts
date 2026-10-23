import { type CreateGovernorOptions, createGovernor, reduceGovernor, snapshotOf } from './governor';
import type { GovernorEvent, GovernorSnapshot } from './types';

/**
 * Replays a recorded or synthetic event stream through the governor. Used by tests and by the
 * diagnostics tooling to answer "what would the governor have done" for a captured session.
 */
export function replayGovernor(
  options: CreateGovernorOptions,
  events: readonly GovernorEvent[],
): { readonly snapshots: GovernorSnapshot[]; readonly final: GovernorSnapshot } {
  let state = createGovernor(options);
  const snapshots: GovernorSnapshot[] = [];
  let lastVersion = -1;
  for (const event of [...events].sort((a, b) => a.at - b.at)) {
    state = reduceGovernor(state, event);
    if (state.version !== lastVersion) {
      lastVersion = state.version;
      snapshots.push(snapshotOf(state));
    }
  }
  return { snapshots, final: snapshotOf(state) };
}
