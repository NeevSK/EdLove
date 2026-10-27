import type { ChatMessage } from '@repo/community/types';
import { useQuerySnapshotHydration } from '@repo/core/hooks/useQuerySnapshotHydration';
import { getAccountScopeRevision, getActiveAccountId } from '@repo/core/lib/accountScope';
import { storage } from '@repo/core/lib/storage';
import type { ChatChannel } from '@repo/core/logic/schemas/chat-command.schema';
import { getTemporalRange } from '@repo/core/logic/utils/temporalUtils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';

const messageSchema = z
  .object({
    id: z.string(),
    group_id: z.string().optional(),
    conversation_id: z.string().optional(),
    author_id: z.string(),
    content: z.string(),
    created_at: z.coerce.date(),
    author: z.object({ full_name: z.string(), avatar_url: z.string().optional() }).optional(),
    author_name: z.string().nullish(),
    author_avatar_url: z.string().nullish(),
  })
  .transform(
    ({ author_name, author_avatar_url, ...message }): ChatMessage => ({
      ...message,
      author: message.author ?? {
        full_name: author_name ?? 'Anonymous User',
        avatar_url: author_avatar_url ?? undefined,
      },
    }),
  );
const messagesSchema = z.array(messageSchema);
const snapshotSchema = z.object({ savedAt: z.number().nonnegative(), data: messagesSchema });
const decodeSnapshot = (raw: string) => snapshotSchema.parse(JSON.parse(raw));

export function chatHistoryQueryKey(principalId: string, channel: ChatChannel, viewDate: string) {
  const cutoff = new Date(getTemporalRange(viewDate, 'day').end).toISOString();
  return ['chat-messages', principalId, channel.kind, channel.id, cutoff] as const;
}

export function useChatMessages(input: {
  principalId: string;
  channel: ChatChannel;
  viewDate: string;
  remoteEnabled: boolean;
  fetchMessages: (viewCutoff: string) => Promise<ChatMessage[]>;
}) {
  const { principalId, channel, viewDate, remoteEnabled, fetchMessages } = input;
  const key = useMemo(
    () => chatHistoryQueryKey(principalId, channel, viewDate),
    [principalId, channel.kind, channel.id, viewDate],
  );
  const cacheKey = JSON.stringify(key);
  const storageKey = `chat-history:v1:${cacheKey}`;
  const isHydrated = useQuerySnapshotHydration(key, storageKey, decodeSnapshot);
  const query = useQuery({
    queryKey: key,
    enabled: remoteEnabled,
    retry: false,
    placeholderData: undefined,
    queryFn: async ({ signal }) => {
      const revision = getAccountScopeRevision();
      if (getActiveAccountId() !== principalId) throw new Error('Chat account is not ready.');
      const result = await fetchMessages(key[4]);
      if (
        signal.aborted ||
        revision !== getAccountScopeRevision() ||
        getActiveAccountId() !== principalId
      )
        throw new Error('Chat account ended before the response arrived.');
      return messagesSchema.parse(result);
    },
  });

  useEffect(() => {
    if (query.data === undefined || query.isPlaceholderData) return;
    void storage
      .setAsync(storageKey, JSON.stringify({ savedAt: query.dataUpdatedAt, data: query.data }))
      .catch((error: unknown) =>
        console.warn('[Chat] Recent history could not be retained offline.', error),
      );
  }, [storageKey, query.data, query.dataUpdatedAt, query.isPlaceholderData]);

  return {
    ...query,
    queryKey: key,
    isLoading: !isHydrated || query.isLoading,
    refresh: async () => {
      if (remoteEnabled) await query.refetch();
    },
  };
}
