import type { QueuedMutation } from '@repo/core/lib/sync/types';
import {
  isQueuedMutationAcknowledged,
  useMutationQueue,
} from '@repo/core/lib/sync/useMutationQueue';
import {
  CHAT_SEND_COMMAND,
  ChatSendCommandSchema,
} from '@repo/core/logic/schemas/chat-command.schema';
import { type TemporalReadPolicy, useTemporalStore } from '@repo/core/store/useTemporalStore';

/** A pending message cannot overtake an unresolved predecessor in the same account/channel. */
export function isMutationReplayDeferred(
  item: QueuedMutation,
  readPolicy: TemporalReadPolicy = useTemporalStore.getState().readPolicy,
  queue: readonly QueuedMutation[] = useMutationQueue.getState().queue,
): boolean {
  if (item.name !== CHAT_SEND_COMMAND) return false;
  if (readPolicy === 'cached-only') return true;
  const command = ChatSendCommandSchema.safeParse(item.variables);
  if (!command.success) return false;
  const order = item.logicalClock ?? item.timestamp;
  return queue.some((other) => {
    if (
      other.id === item.id ||
      other.userId !== item.userId ||
      other.name !== CHAT_SEND_COMMAND ||
      (other.logicalClock ?? other.timestamp) >= order
    )
      return false;
    const earlier = ChatSendCommandSchema.safeParse(other.variables);
    return (
      earlier.success &&
      earlier.data.channel.kind === command.data.channel.kind &&
      earlier.data.channel.id === command.data.channel.id
    );
  });
}

/** Selects ready work and one real wake-up deadline, without changing command state. */
export function planMutationReplay(
  queue: readonly QueuedMutation[],
  principalId: string | undefined,
  readPolicy: TemporalReadPolicy,
  now = Date.now(),
): { ready: QueuedMutation[]; nextWakeAt: number | null } {
  const ready: QueuedMutation[] = [];
  let nextWakeAt: number | null = null;
  if (!principalId) return { ready, nextWakeAt };
  for (const item of queue) {
    if (
      item.userId !== principalId ||
      !isQueuedMutationAcknowledged(item.id) ||
      ['auth_paused', 'conflict', 'rejected', 'reconciled', 'discarded'].includes(
        item.commandState ?? '',
      ) ||
      isMutationReplayDeferred(item, readPolicy, queue)
    )
      continue;
    const wakeAt = Math.max(item.backoffUntil ?? 0, item.lockLeaseExpiresAt ?? 0);
    if (wakeAt > now) nextWakeAt = Math.min(nextWakeAt ?? wakeAt, wakeAt);
    else ready.push(item);
  }
  return { ready, nextWakeAt };
}
