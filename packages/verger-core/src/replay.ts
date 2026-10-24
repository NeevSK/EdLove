import type { CreateGovernorOptions } from './governor';
import { VERGER_POLICY, type VergerPolicy } from './policy';
import type { GovernorEvent, GovernorSnapshot } from './types';

/**
 * Replays a recorded or synthetic event stream through a policy (verger's own by default). Used
 * by tests and by the diagnostics tooling to answer "what would this policy have done" for a
 * captured session, and so to compare two policies on the same session.
 */
export function replayGovernor(
  options: CreateGovernorOptions,
  events: readonly GovernorEvent[],
  policy: VergerPolicy = VERGER_POLICY,
): { readonly snapshots: GovernorSnapshot[]; readonly final: GovernorSnapshot } {
  let state = policy.create(options);
  const snapshots: GovernorSnapshot[] = [];
  let lastVersion = -1;
  for (const event of [...events].sort((a, b) => a.at - b.at)) {
    state = policy.reduce(state, event);
    const version = policy.outputVersion(state);
    if (version !== lastVersion) {
      lastVersion = version;
      snapshots.push(policy.snapshot(state));
    }
  }
  return { snapshots, final: policy.snapshot(state) };
}
