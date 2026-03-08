/**
 * DirectMessageScreen
 *
 * Wrapper around BaseChatScreen for 1:1 private conversations.
 * Wires up DM-specific data sources (fetch, send, realtime subscription).
 */

import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '@repo/core';
import { supabase } from '@repo/core';
import { communityAPI } from '../api/community';
import BaseChatScreen, { type ChatMessage, type SubscriptionConfig } from './BaseChatScreen';
import HeaderMoreMenu from '../components/HeaderMoreMenu';
import { useStore } from '@repo/core';

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

    // Determine the target user ID from the conversation metadata (if available) or assume from params
    // In a real app, you'd fetch the conversation participants. 
    // For now, we'll try to find it or let the menu handle it if we can pass it down.

    const fetchMessages = async (): Promise<ChatMessage[]> => {
        return communityAPI.getDirectMessages(conversationId) as Promise<ChatMessage[]>;
    };

    const sendMessage = async (content: string): Promise<ChatMessage> => {
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
            onPressAuthor={(userId, name) => {
                navigation.navigate('UserProfile', { userId, userName: name });
            }}
            headerRight={
                <HeaderMoreMenu
                    conversationId={conversationId}
                    targetUserName={userName}
                />
            }
        />
    );
}
