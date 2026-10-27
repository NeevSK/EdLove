import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { CHAT_SEND_COMMAND } from '@repo/core/logic/schemas/chat-command.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const typingSchema = z.object({ userId: z.string().min(1), userName: z.string().min(1) });

/** Owns one typing channel and every timeout it creates. */
export function subscribeChatTyping(
  channelKey: string,
  principalId: string,
  onTyping: (userId: string, name: string | null) => void,
) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  let active = true;
  const channel = supabase
    .channel(`typing:${channelKey}`)
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      const parsed = typingSchema.safeParse(payload);
      if (!active || !parsed.success || parsed.data.userId === principalId) return;
      const { userId, userName } = parsed.data;
      clearTimeout(timers.get(userId));
      onTyping(userId, userName);
      timers.set(
        userId,
        setTimeout(() => {
          timers.delete(userId);
          onTyping(userId, null);
        }, 3000),
      );
    })
    .subscribe();
  return {
    send: (userName: string) => {
      if (!active) return;
      void channel
        .send({ type: 'broadcast', event: 'typing', payload: { userId: principalId, userName } })
        .catch((error: unknown) => console.warn('[Chat] Typing broadcast failed.', error));
    },
    dispose: () => {
      active = false;
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      void supabase.removeChannel(channel);
    },
  };
}

export function useChatRealtime(input: {
  principalId: string;
  channelKey: string;
  userName: string;
  canBroadcast: boolean;
  table: string;
  filter: string;
  queryKey: readonly string[];
}) {
  const { principalId, channelKey, table, filter, queryKey, userName, canBroadcast } = input;
  const client = useQueryClient();
  const [names, setNames] = useState<Record<string, string>>({});
  const typing = useRef<ReturnType<typeof subscribeChatTyping> | null>(null);
  useEffect(() => {
    const owner = subscribeChatTyping(channelKey, principalId, (userId, name) =>
      setNames((previous) => {
        const next = { ...previous };
        if (name === null) delete next[userId];
        else next[userId] = name;
        return next;
      }),
    );
    typing.current = owner;
    return () => {
      if (typing.current === owner) typing.current = null;
      owner.dispose();
    };
  }, [channelKey, principalId]);
  useEffect(() => {
    const invalidate = () => {
      void client.invalidateQueries({ queryKey });
    };
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter,
        },
        invalidate,
      )
      .subscribe();
    const stop = sovereignBus.on('sync:item_succeeded', (event) => {
      if (event.name === CHAT_SEND_COMMAND) invalidate();
    });
    return () => {
      stop();
      void supabase.removeChannel(channel);
    };
  }, [channelKey, table, filter, queryKey, client]);
  const sendTyping = useCallback(
    (text: string) => {
      if (canBroadcast && text.length > 0 && text.length % 5 === 0) typing.current?.send(userName);
    },
    [canBroadcast, userName],
  );
  return { typingUsers: Object.values(names), sendTyping };
}
