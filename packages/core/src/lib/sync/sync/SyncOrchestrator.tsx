import { type OutboxReplayOptions, useOutboxReplay } from '@repo/core/lib/sync/useOutboxReplay';

export type { SyncOrchestratorTraceEvent } from '@repo/core/lib/sync/useOutboxReplay';

/**
 * Headless mount for the outbox drain. Render it once inside the app's providers; the work is
 * in useOutboxReplay. Not mounted in either app yet: no v1 command handler is registered
 * (lib/sync/registry.ts), so there is nothing it could replay.
 */
export default function SyncOrchestrator(options: OutboxReplayOptions = {}) {
  useOutboxReplay(options);
  return null;
}
