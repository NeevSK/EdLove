/**
 * GroupChatScreen
 *
 * Thin wrapper around BaseChatScreen for group conversations.
 * All chat logic lives in BaseChatScreen — this just wires the group-specific
 * data sources (fetch, send, realtime subscription).
 */

import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '@repo/core';
import { supabase } from '@repo/core';
import { communityAPI } from '../api/community';
import BaseChatScreen, { type ChatMessage, type SubscriptionConfig } from './BaseChatScreen';
import HeaderMoreMenu from '../components/HeaderMoreMenu';

type GroupChatRoute = {
    key: string;
    name: 'GroupChat';
    params: { groupId: string; groupName: string };
};

export default function GroupChatScreen() {
    const route = useRoute<GroupChatRoute>();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { groupId, groupName } = route.params;

    const fetchMessages = async (): Promise<ChatMessage[]> => {
        return communityAPI.getGroupMessages(groupId) as Promise<ChatMessage[]>;
    };

    const sendMessage = async (content: string): Promise<ChatMessage> => {
        return communityAPI.sendGroupMessage(groupId, content) as Promise<ChatMessage>;
    };

    const subscription: SubscriptionConfig = {
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
    };

    return (
        <BaseChatScreen
            channelKey={`group_chat_${groupId}`}
            title={groupName}
            subtitle="Group Chat"
            fetchMessages={fetchMessages}
            sendMessage={sendMessage}
            subscription={subscription}
            onPressAuthor={(userId, userName) => {
                navigation.navigate('UserProfile', { userId, userName });
            }}
            headerRight={
                <HeaderMoreMenu
                    groupId={groupId}
                />
            }
        />
    );
}
