/**
 * GroupChatScreen
 *
 * Thin wrapper around BaseChatScreen for group conversations.
 * All chat logic lives in BaseChatScreen  this just wires the group-specific
 * data sources (fetch, send, realtime subscription).
 */

import { communityAPI } from '@repo/community/api/community';
import HeaderMoreMenu from '@repo/community/components/HeaderMoreMenu';
import BaseChatScreen, { type SubscriptionConfig } from '@repo/community/screens/BaseChatScreen';
import type { ChatMessage } from '@repo/community/types';
import { useTemporalStore } from '@repo/core/store';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function GroupChatScreen() {
  const params = useLocalSearchParams<{ conversationId?: string; groupName?: string }>();
  const groupId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const groupName = Array.isArray(params.groupName) ? params.groupName[0] : params.groupName;

  const { viewDate, isPastView } = useTemporalStore();

  const fetchMessages = React.useCallback(
    async (cutoff: string): Promise<ChatMessage[]> => {
      return communityAPI.getGroupMessages(groupId, 60, cutoff) as Promise<ChatMessage[]>;
    },
    [groupId],
  );

  const subscription = React.useMemo<SubscriptionConfig>(
    () => ({
      table: 'group_messages',
      filter: `group_id=eq.${groupId}`,
    }),
    [groupId],
  );

  return (
    <BaseChatScreen
      channelKey={`group_chat_${groupId}`}
      title={groupName}
      subtitle="Group Chat"
      fetchMessages={fetchMessages}
      channel={{ kind: 'group', id: groupId }}
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
