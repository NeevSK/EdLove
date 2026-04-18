/**
 * BaseChatScreen
 *
 * Shared chat layout used by GroupChatScreen and (future) DirectMessageScreen.
 * Handles: message list, real-time subscription, optimistic sends, compose bar.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    ActivityIndicator,
} from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    ScreenWrapper,
    GlobalHeader,
    Pressable,
    InputField,
    Theme
} from '@repo/ui';
import { Send } from 'lucide-react-native';
import { supabase, useStore } from '@repo/core';

export interface ChatMessage {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    author?: { full_name?: string | null; avatar_url?: string | null } | null;
}

export interface SubscriptionConfig {
    /** Supabase table name to listen on (e.g. 'group_messages') */
    table: string;
    /** Row filter string (e.g. 'group_id=eq.<uuid>') */
    filter: string;
    /** Query to fetch the full message row with author join after INSERT */
    fetchById: (id: string) => Promise<ChatMessage | null>;
}

export interface BaseChatScreenProps {
    /** Unique key for the Supabase realtime channel */
    channelKey: string;
    title: string;
    subtitle?: string;
    fetchMessages: () => Promise<ChatMessage[]>;
    sendMessage: (content: string) => Promise<ChatMessage>;
    subscription: SubscriptionConfig;
    onPressAuthor?: (userId: string, userName: string) => void;
    headerRight?: React.ReactNode;
    isBlocked?: boolean;
    blockedMessage?: string;
    isReadOnly?: boolean;
}

export default function BaseChatScreen({
    channelKey,
    title,
    subtitle,
    fetchMessages,
    sendMessage,
    subscription,
    onPressAuthor,
    headerRight,
    isBlocked,
    blockedMessage,
    isReadOnly,
}: BaseChatScreenProps) {
    const user = useStore(state => state.user);
    const { t } = useTranslation();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef<FlatList>(null);

    // Initial load
    const load = useCallback(async () => {
        try {
            const data = await fetchMessages();
            setMessages(data);
        } catch (err) {
            console.error('[BaseChatScreen] fetch error', err);
        } finally {
            setLoading(false);
        }
    }, [fetchMessages]);

    useEffect(() => { load(); }, [load]);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel(channelKey)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: subscription.table, filter: subscription.filter },
                async (payload) => {
                    const msg = await subscription.fetchById(payload.new.id);
                    if (!msg) return;
                    setMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [channelKey, subscription]);

    // Scroll to bottom on first load
    useEffect(() => {
        if (!loading && messages.length > 0) {
            setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
        }
    }, [loading]);

    // Send
    const handleSend = async () => {
        const content = draft.trim();
        if (!content || !user) return;
        setSending(true);
        setDraft('');

        const optimisticId = `opt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const optimistic: ChatMessage = {
            id: optimisticId,
            author_id: user.id,
            content,
            created_at: new Date().toISOString(),
            author: { full_name: user.full_name || 'You', avatar_url: user.avatar_url },
        };
        setMessages(prev => [...prev, optimistic]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const real = await sendMessage(content);
            setMessages(prev => prev.map(m => m.id === optimisticId ? real : m));
        } catch {
            setMessages(prev => prev.filter(m => m.id !== optimisticId));
            setDraft(content);
        } finally {
            setSending(false);
        }
    };

    // Message renderer
    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isOwn = item.author_id === user?.id;
        const authorName = item.author?.full_name || 'Unknown';
        const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const avatar = (side: 'left' | 'right') => (
            <Pressable
                onPress={() => onPressAuthor?.(item.author_id, authorName)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Avatar size="xs" className={`${side === 'left' ? 'mr-2' : 'ml-2'} mt-1 ${isOwn ? 'bg-primary-500' : 'bg-primary-400'}`}>
                    {(isOwn ? item.author?.avatar_url || user?.avatar_url : item.author?.avatar_url)
                        ? <AvatarImage source={{ uri: (isOwn ? item.author?.avatar_url || user?.avatar_url : item.author?.avatar_url)! }} alt={authorName} />
                        : <AvatarFallbackText>{initials}</AvatarFallbackText>
                    }
                </Avatar>
            </Pressable>
        );

        return (
            <HStack className={`justify-${isOwn ? 'end' : 'start'} mb-2 px-4`}>
                {!isOwn && avatar('left')}
                <VStack className="max-w-[72%] gap-0.5">
                    {!isOwn && (
                        <Text className="text-[11px] text-muted-foreground ml-0.5">{authorName}</Text>
                    )}
                    <Box className={`px-4 py-2 rounded-xl border ${isOwn ? 'bg-primary-500 border-primary-500 rounded-br-sm' : 'bg-surface-low border-outline-variant rounded-bl-sm'}`}>
                        <Text className={`text-sm leading-relaxed ${isOwn ? 'text-white' : 'text-foreground'}`}>
                            {item.content}
                        </Text>
                    </Box>
                    <Text className={`text-[10px] text-muted-foreground ${isOwn ? 'self-end' : 'self-start'}`}>{time}</Text>
                </VStack>
                {isOwn && avatar('right')}
            </HStack>
        );
    };

    return (
        <ScreenWrapper scroll={false} noTopInset={true}>
            <GlobalHeader
                title={title}
                subtitle={subtitle}
                showBack
                rightAction={headerRight}
            />

            <Box className="flex-1">
                {loading ? (
                    <Box className="flex-1 items-center justify-center">
                        <ActivityIndicator color="#E67E22" />
                    </Box>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1, justifyContent: messages.length === 0 ? 'center' : 'flex-start' }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text className="text-center text-muted-foreground text-sm">
                                {t('chat.empty', 'No messages yet. Say hello!')}
                            </Text>
                        }
                    />
                )}

                {/* Compose bar */}
                <Box className="bg-surface-lowest border-t border-outline-variant px-4 py-2">
                    {isReadOnly ? (
                        <Box className="p-4 items-center">
                            <Text className="text-muted-foreground text-sm italic">
                                {t('chat.historicalView', 'Viewing historical sanctuary records.')}
                            </Text>
                        </Box>
                    ) : isBlocked ? (
                        <Box className="p-4 items-center">
                            <Text className="text-muted-foreground text-sm italic">
                                {blockedMessage || 'You cannot send messages to this sanctuary.'}
                            </Text>
                        </Box>
                    ) : (
                        <HStack className="gap-2 items-end">
                            <InputField
                                value={draft}
                                onChangeText={setDraft}
                                placeholder="Write a message..."
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                multiline
                                className="flex-1 min-h-[40px] max-h-[120px] rounded-xl border border-outline-variant px-4 py-2 text-sm text-foreground bg-surface-low"
                                returnKeyType="default"
                            />
                            <Pressable
                                onPress={handleSend}
                                disabled={!draft.trim() || sending}
                                className={`w-10 h-10 rounded-full items-center justify-center ${draft.trim() ? 'bg-primary-500' : 'bg-outline-variant'}`}
                            >
                                {sending
                                    ? <ActivityIndicator size="small" color="white" />
                                    : <Send size={18} color="white" />
                                }
                            </Pressable>
                        </HStack>
                    )}
                </Box>
            </Box>
        </ScreenWrapper>
    );
}
