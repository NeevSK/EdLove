/**
 * DirectMessageScreen
 *
 * Wrapper around BaseChatScreen for 1:1 private conversations.
 * Wires up DM-specific data sources (fetch, send, realtime subscription).
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '@repo/core/api';

import { useStore, useTemporalStore } from '@repo/core/store';
import type { CommunityStackParamList } from '@repo/core/types';
import React from 'react';
import { communityAPI } from '../api/community';
import HeaderMoreMenu from '../components/HeaderMoreMenu';
import type { ChatMessage } from '../types';
import BaseChatScreen, { type SubscriptionConfig } from './BaseChatScreen';

type DMRoute = {
  key: string;
  name: 'DirectMessage';
  params: { conversationId: string; userName: string };
};

export default function DirectMessageScreen() {
  const route = useRoute<DMRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const { conversationId, userName } = route.params;
  const { user } = useStore();
  const [targetUserId, setTargetUserId] = React.useState<string | undefined>();
  const [isBlocked, setIsBlocked] = React.useState(false);
  const { viewDate, isPastView } = useTemporalStore();

  // Fetch conversation and block status
  React.useEffect(() => {
    async function fetchContext() {
      try {
        const { data, error } = await supabase
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
    fetchContext();
  }, [conversationId, user]);

  const fetchMessages = async (): Promise<ChatMessage[]> => {
    return communityAPI.getDirectMessages(conversationId, 60, viewDate) as Promise<ChatMessage[]>;
  };

  const sendMessage = async (content: string): Promise<ChatMessage> => {
    if (isPastView) throw new Error('Cannot send messages in historical view');
    return communityAPI.sendDirectMessage(conversationId, content) as Promise<ChatMessage>;
  };

  const subscription: SubscriptionConfig = {
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
  };

  return (
    <BaseChatScreen
      channelKey={`dm_${conversationId}`}
      title={userName}
      subtitle="Direct Message"
      fetchMessages={fetchMessages}
      sendMessage={sendMessage}
      subscription={subscription}
      onPressAuthor={(userId) => {
        navigation.navigate('PublicProfile', { id: userId, type: 'user' });
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
