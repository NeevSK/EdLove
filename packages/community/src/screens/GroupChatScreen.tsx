/**
 * GroupChatScreen
 *
 * Thin wrapper around BaseChatScreen for group conversations.
 * All chat logic lives in BaseChatScreen  this just wires the group-specific
 * data sources (fetch, send, realtime subscription).
 */

import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';

import { useTemporalStore } from '@repo/core/store';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { communityAPI } from '@repo/community/api/community';
import HeaderMoreMenu from '@repo/community/components/HeaderMoreMenu';
import type { ChatMessage } from '@repo/community/types';
import BaseChatScreen, { type SubscriptionConfig } from '@repo/community/screens/BaseChatScreen';

export default function GroupChatScreen() {
  const params = useLocalSearchParams<{ conversationId?: string; groupName?: string }>();
  const groupId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const groupName = Array.isArray(params.groupName) ? params.groupName[0] : params.groupName;

  const { viewDate, isPastView } = useTemporalStore();

  const fetchMessages = React.useCallback(async (): Promise<ChatMessage[]> => {
    return communityAPI.getGroupMessages(groupId, 60, viewDate) as Promise<ChatMessage[]>;
  }, [groupId, viewDate]);

  const sendMessage = React.useCallback(async (content: string): Promise<ChatMessage> => {
    if (isPastView) throw new Error('Cannot send messages in historical view');
    return communityAPI.sendGroupMessage(groupId, content) as Promise<ChatMessage>;
  }, [groupId, isPastView]);

  const subscription = React.useMemo<SubscriptionConfig>(
    () => ({
      table: 'group_messages',
      filter: `group_id=eq.${groupId}`,
      fetchById: async (id: string) => {
        const { data } = await supabase
          .from('group_messages')
          .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
          .eq('id', id)
          .single();
        return data as ChatMessage | null;
      },
    }),
    [groupId],
  );

  return (
    <BaseChatScreen
      channelKey={`group_chat_${groupId}`}
      title={groupName}
      subtitle="Group Chat"
      fetchMessages={fetchMessages}
      sendMessage={sendMessage}
      subscription={subscription}
      isReadOnly={isPastView}
      key={viewDate} // Force remount/refetch on date change for consistency
      onPressAuthor={(userId) => {
        router.push({
          pathname: '/community/profile/[id]',
          params: { id: userId },
        });
      }}
      headerRight={
        <HeaderMoreMenu conversationId={groupId} groupId={groupId} targetUserName={groupName} />
      }
    />
  );
}
