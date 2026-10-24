import type { CreateVergerStateOptions } from './reducer';
import { VERGER_POLICY, type VergerPolicy } from './policy';
import type { VergerEvent, VergerSnapshot } from './types';

/**
 * Replays a recorded or synthetic event stream through a policy (verger's own by default). Used
 * by tests and by the diagnostics tooling to answer "what would this policy have done" for a
 * captured session, and so to compare two policies on the same session.
 */
export function replayVerger(
  options: CreateVergerStateOptions,
  events: readonly VergerEvent[],
  policy: VergerPolicy = VERGER_POLICY,
): { readonly snapshots: VergerSnapshot[]; readonly final: VergerSnapshot } {
  let state = policy.create(options);
  const snapshots: VergerSnapshot[] = [];
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
