/**
 * DirectMessageScreen
 *
 * Wrapper around BaseChatScreen for 1:1 private conversations.
 * Wires up DM-specific data sources (fetch, send, realtime subscription).
 */

import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';

import { useStore, useTemporalStore } from '@repo/core/store';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { communityAPI } from '@repo/community/api/community';
import HeaderMoreMenu from '@repo/community/components/HeaderMoreMenu';
import type { ChatMessage } from '@repo/community/types';
import BaseChatScreen, { type SubscriptionConfig } from '@repo/community/screens/BaseChatScreen';

export default function DirectMessageScreen() {
  const params = useLocalSearchParams<{ conversationId?: string; userName?: string }>();
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const userName = Array.isArray(params.userName) ? params.userName[0] : params.userName;
  const { user } = useStore();
  const [targetUserId, setTargetUserId] = React.useState<string | undefined>();
  const [isBlocked, setIsBlocked] = React.useState(false);
  const { viewDate, isPastView } = useTemporalStore();

  // Fetch conversation and block status
  React.useEffect(() => {
    async function fetchContext() {
      try {
        const { data } = await supabase
          .from('direct_conversations')
          .select('user1_id, user2_id')
          .eq('id', conversationId)
          .single();

        if (data && user) {
          const otherId = data.user1_id === user.id ? data.user2_id : data.user1_id;
          setTargetUserId(otherId);

          // Check if either user has blocked the other
          const blocked = await communityAPI.isBlockingActive(otherId);
          setIsBlocked(blocked);
        }
      } catch (err) {
        console.error('Failed to fetch conversation context:', err);
      }
    }
    void fetchContext();
  }, [conversationId, user]);

  const fetchMessages = React.useCallback(async (): Promise<ChatMessage[]> => {
    return communityAPI.getDirectMessages(conversationId, 60, viewDate) as Promise<ChatMessage[]>;
  }, [conversationId, viewDate]);

  const sendMessage = React.useCallback(async (content: string): Promise<ChatMessage> => {
    if (isPastView) throw new Error('Cannot send messages in historical view');
    return communityAPI.sendDirectMessage(conversationId, content) as Promise<ChatMessage>;
  }, [conversationId, isPastView]);

  const subscription = React.useMemo<SubscriptionConfig>(() => ({
      table: 'direct_messages',
      filter: `conversation_id=eq.${conversationId}`,
      fetchById: async (id: string) => {
        const { data } = await supabase
          .from('direct_messages')
          .select('*, author:users!direct_messages_author_id_fkey(full_name, avatar_url)')
          .eq('id', id)
          .single();
        return data as ChatMessage | null;
      },
    }),
    [conversationId],
  );

  return (
    <BaseChatScreen
      channelKey={`dm_${conversationId}`}
      title={userName}
      subtitle="Direct Message"
      fetchMessages={fetchMessages}
      sendMessage={sendMessage}
      subscription={subscription}
      onPressAuthor={(userId) => {
        router.push({
          pathname: '/community/profile/[id]',
          params: { id: userId },
        });
      }}
      isBlocked={isBlocked}
      isReadOnly={isPastView}
      key={viewDate}
      blockedMessage={`This conversation is currently paused. ${userName} or you have restricted interactions.`}
      headerRight={
        <HeaderMoreMenu
          conversationId={conversationId}
          targetUserName={userName}
          targetUserId={targetUserId}
        />
      }
    />
  );
}
