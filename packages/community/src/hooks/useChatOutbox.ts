import { storage } from '@repo/core/lib/storage';
import type { QueuedMutation } from '@repo/core/lib/sync/types';
import {
  isQueuedMutationAcknowledged,
  useMutationQueue,
} from '@repo/core/lib/sync/useMutationQueue';
import {
  CHAT_SEND_COMMAND,
  type ChatChannel,
  type ChatSendCommand,
  ChatSendCommandSchema,
} from '@repo/core/logic/schemas/chat-command.schema';
import { uuidv7 } from '@repo/core/logic/utils/uuid';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

function readCommand(
  item: QueuedMutation,
  principalId: string,
  channel: ChatChannel,
): ChatSendCommand | null {
  if (item.userId !== principalId || item.name !== CHAT_SEND_COMMAND) return null;
  const parsed = ChatSendCommandSchema.safeParse(item.variables);
  return parsed.success &&
    parsed.data.channel.kind === channel.kind &&
    parsed.data.channel.id === channel.id
    ? parsed.data
    : null;
}

export function useChatOutbox(principalId: string, channel: ChatChannel) {
  const [hasLegacyQueue, setHasLegacyQueue] = useState(false);
  const legacyKey = `chat_queue:${channel.kind === 'group' ? 'group_chat_' : 'dm_'}${channel.id}`;
  useEffect(() => {
    let active = true;
    void storage
      .getStringAsync(legacyKey)
      .then((raw) => {
        if (active) setHasLegacyQueue(Boolean(raw && raw !== '[]'));
      })
      .catch((error: unknown) =>
        console.warn(
          '[Chat] Older offline work could not be inspected; original record retained.',
          error,
        ),
      );
    return () => {
      active = false;
    };
  }, [legacyKey]);
  const queue = useMutationQueue((state) => state.queue);
  const deadLetters = useMutationQueue((state) => state.deadLetterQueue);
  const addToQueue = useMutationQueue((state) => state.addToQueue);
  const pending = useMemo(
    () =>
      queue.filter((item) => {
        return (
          isQueuedMutationAcknowledged(item.id) && readCommand(item, principalId, channel) !== null
        );
      }),
    [queue, principalId, channel.kind, channel.id],
  );
  const rejected = useMemo(
    () =>
      deadLetters.filter((item) => {
        return readCommand(item, principalId, channel) !== null;
      }),
    [deadLetters, principalId, channel.kind, channel.id],
  );
  const admission = useMutation({
    mutationFn: async (command: ChatSendCommand) => {
      await addToQueue({
        name: CHAT_SEND_COMMAND,
        scope: 'chat',
        type: 'CREATE',
        userId: principalId,
        operationId: command.operationId,
        variables: command,
      });
      return command.operationId;
    },
    retry: false,
    networkMode: 'always',
  });
  const submit = (content: string) => {
    const uncertain = useMutationQueue
      .getState()
      .queue.find(
        (item) =>
          !isQueuedMutationAcknowledged(item.id) &&
          readCommand(item, principalId, channel)?.content === content.trim(),
      );
    const command = uncertain
      ? ChatSendCommandSchema.parse(uncertain.variables)
      : ChatSendCommandSchema.parse({ principalId, channel, content, operationId: uuidv7() });
    return admission.mutateAsync(command);
  };
  const retryPending = () => {
    const state = useMutationQueue.getState();
    for (const item of rejected) state.restoreDeadLetterMutation(item.id);
    for (const item of pending) {
      if (item.commandState === 'retry_scheduled')
        state.updateMutation(item.id, { backoffUntil: undefined });
    }
  };
  return {
    pending,
    rejected,
    admission,
    submit,
    retryPending,
    hasLegacyQueue,
    readPolicy: useTemporalStore((state) => state.readPolicy),
  };
}
