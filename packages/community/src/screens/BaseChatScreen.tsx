/**
 * BaseChatScreen
 *
 * Shared chat layout used by GroupChatScreen and (future) DirectMessageScreen.
 * Handles: message list, real-time subscription, optimistic sends, compose bar.
 *
 * Consumers provide:
 *  - `channelKey`    : unique Supabase channel identifier (e.g. "group_chat_<id>")
 *  - `fetchMessages` : fetch initial list of messages
 *  - `sendMessage`   : sends one message, returns the saved record
 *  - `subscriptionConfig` : `{ table, filter }` for postgres_changes subscription
 *  - `title` / `subtitle` : header display strings
 *  - `onPressAuthor` : called when tapping an avatar/name
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    useThemedColors,
    Theme,
    ScreenWrapper,
} from '@repo/ui';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
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
}: BaseChatScreenProps) {
    const navigation = useNavigation<any>();
    const user = useStore(state => state.user);
    const colors = useThemedColors();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef<FlatList>(null);

    // ── Initial load ──────────────────────────────────────────
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

    // ── Real-time subscription ────────────────────────────────
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

    // ── Send ──────────────────────────────────────────────────
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

    // ── Message renderer ──────────────────────────────────────
    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isOwn = item.author_id === user?.id;
        const authorName = item.author?.full_name || 'Unknown';
        const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const avatar = (side: 'left' | 'right') => (
            <TouchableOpacity
                onPress={() => onPressAuthor?.(item.author_id, authorName)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Avatar size="xs" sx={{ [side === 'left' ? 'marginRight' : 'marginLeft']: 8, marginTop: 4, backgroundColor: isOwn ? Theme.colors.sanctuarySaffron : colors.action }}>
                    {(isOwn ? item.author?.avatar_url || user?.avatar_url : item.author?.avatar_url)
                        ? <AvatarImage source={{ uri: (isOwn ? item.author?.avatar_url || user?.avatar_url : item.author?.avatar_url)! }} alt={authorName} />
                        : <AvatarFallbackText>{initials}</AvatarFallbackText>
                    }
                </Avatar>
            </TouchableOpacity>
        );

        return (
            <HStack sx={{ justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: Theme.spacing.sm, paddingHorizontal: Theme.spacing.md }}>
                {!isOwn && avatar('left')}
                <VStack sx={{ maxWidth: '72%', gap: 2 }}>
                    {!isOwn && (
                        <Text sx={{ fontSize: 11, color: colors.textTertiary, marginLeft: 2 }}>{authorName}</Text>
                    )}
                    <Box sx={{
                        backgroundColor: isOwn ? Theme.colors.sanctuarySaffron : colors.secondary,
                        borderRadius: Theme.corners.comfortable,
                        borderBottomRightRadius: isOwn ? 4 : Theme.corners.comfortable,
                        borderBottomLeftRadius: isOwn ? Theme.corners.comfortable : 4,
                        paddingHorizontal: Theme.spacing.md,
                        paddingVertical: Theme.spacing.sm,
                        borderWidth: isOwn ? 0 : 1,
                        borderColor: colors.border,
                    }}>
                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: isOwn ? Theme.colors.sacredWhite : colors.text, lineHeight: 20 }}>
                            {item.content}
                        </Text>
                    </Box>
                    <Text sx={{ fontSize: 10, color: colors.textTertiary, alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>{time}</Text>
                </VStack>
                {isOwn && avatar('right')}
            </HStack>
        );
    };

    // ── Layout ────────────────────────────────────────────────
    return (
        <ScreenWrapper scroll={false}>
            {/* Header */}
            <HStack sx={{ paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, alignItems: 'center', gap: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <VStack sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: Theme.typography.fontSize.md, fontWeight: '700', color: colors.text }} numberOfLines={1}>{title}</Text>
                    {subtitle && <Text sx={{ fontSize: 11, color: colors.textTertiary }}>{subtitle}</Text>}
                </VStack>
                {headerRight}
            </HStack>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {loading ? (
                    <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
                    </Box>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ paddingVertical: Theme.spacing.md, flexGrow: 1, justifyContent: messages.length === 0 ? 'center' : 'flex-start' }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text sx={{ textAlign: 'center', color: colors.textTertiary, fontSize: Theme.typography.fontSize.sm }}>
                                No messages yet. Say hello 👋
                            </Text>
                        }
                    />
                )}

                {/* Compose bar */}
                <Box sx={{ backgroundColor: colors.secondary, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm }}>
                    <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'flex-end' }}>
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="Write a message…"
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            style={[styles.input, { color: colors.text, backgroundColor: colors.tertiary, borderColor: colors.border }]}
                            returnKeyType="default"
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!draft.trim() || sending}
                            style={[styles.sendBtn, { backgroundColor: draft.trim() ? Theme.colors.sanctuarySaffron : colors.border }]}
                        >
                            {sending
                                ? <ActivityIndicator size="small" color={Theme.colors.sacredWhite} />
                                : <Send size={18} color={Theme.colors.sacredWhite} />
                            }
                        </TouchableOpacity>
                    </HStack>
                </Box>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: 10,
        fontSize: Theme.typography.fontSize.sm,
        textAlignVertical: 'center',
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
