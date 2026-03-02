/**
 * GroupChatScreen
 *
 * Real-time group chat for community groups.
 * Messages flow oldest-at-top, newest-at-bottom (standard chat layout).
 * Uses Supabase postgres_changes for live updates.
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '@repo/core';
import { supabase, useStore } from '@repo/core';
import { communityAPI } from '../api/community';
import type { GroupMessage } from '../types';

type GroupChatRoute = {
    key: string;
    name: 'GroupChat';
    params: { groupId: string; groupName: string };
};

export default function GroupChatScreen() {
    const route = useRoute<GroupChatRoute>();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { groupId, groupName } = route.params;
    const user = useStore(state => state.user);
    const colors = useThemedColors();

    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef<FlatList>(null);

    // ── Initial load ─────────────────────────────────────────

    const fetchMessages = useCallback(async () => {
        try {
            const data = await communityAPI.getGroupMessages(groupId);
            setMessages(data);
        } catch (err) {
            console.error('GroupChat: fetch error', err);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // ── Real-time subscription ───────────────────────────────

    useEffect(() => {
        const channel = supabase
            .channel(`group_chat_${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'group_messages',
                    filter: `group_id=eq.${groupId}`,
                },
                async (payload) => {
                    // Fetch full message with author join
                    const { data } = await supabase
                        .from('group_messages')
                        .select('*, author:users!group_messages_author_id_fkey(full_name, avatar_url)')
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        setMessages(prev => {
                            // Avoid duplicates (own messages already added optimistically)
                            if (prev.some(m => m.id === data.id)) return prev;
                            return [...prev, data as GroupMessage];
                        });
                        // Scroll to bottom
                        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [groupId]);

    // Scroll to bottom when messages first load
    useEffect(() => {
        if (!loading && messages.length > 0) {
            setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
        }
    }, [loading]);

    // ── Send ─────────────────────────────────────────────────

    const handleSend = async () => {
        const content = draft.trim();
        if (!content || !user) return;
        setSending(true);
        setDraft('');

        // Optimistic insert
        const optimistic: GroupMessage = {
            id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            group_id: groupId,
            author_id: user.id,
            content,
            created_at: new Date().toISOString(),
            author: { full_name: user.full_name || 'You', avatar_url: user.avatar_url },
        };
        setMessages(prev => [...prev, optimistic]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const real = await communityAPI.sendGroupMessage(groupId, content);
            // Replace optimistic with real
            setMessages(prev => prev.map(m => m.id === optimistic.id ? real : m));
        } catch {
            // Revert optimistic on error
            setMessages(prev => prev.filter(m => m.id !== optimistic.id));
            setDraft(content);
        } finally {
            setSending(false);
        }
    };

    // ── Render ────────────────────────────────────────────────

    const renderMessage = ({ item }: { item: GroupMessage }) => {
        const isOwn = item.author_id === user?.id;
        const authorName = item.author?.full_name || 'Unknown';
        const initials = authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <HStack
                sx={{
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: Theme.spacing.sm,
                    paddingHorizontal: Theme.spacing.md,
                }}
            >
                {!isOwn && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('UserProfile', {
                            userId: item.author_id,
                            userName: item.author?.full_name || 'Member',
                        })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Avatar size="xs" sx={{ marginRight: 8, marginTop: 4, backgroundColor: colors.action }}>
                            {item.author?.avatar_url
                                ? <AvatarImage source={{ uri: item.author.avatar_url }} alt={authorName} />
                                : <AvatarFallbackText>{initials}</AvatarFallbackText>
                            }
                        </Avatar>
                    </TouchableOpacity>
                )}

                <VStack sx={{ maxWidth: '72%', gap: 2 }}>
                    {!isOwn && (
                        <Text sx={{ fontSize: 11, color: colors.textTertiary, marginLeft: 2 }}>
                            {authorName}
                        </Text>
                    )}
                    <Box
                        sx={{
                            backgroundColor: isOwn ? Theme.colors.sanctuarySaffron : colors.secondary,
                            borderRadius: Theme.corners.comfortable,
                            borderBottomRightRadius: isOwn ? 4 : Theme.corners.comfortable,
                            borderBottomLeftRadius: isOwn ? Theme.corners.comfortable : 4,
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.sm,
                            borderWidth: isOwn ? 0 : 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Text
                            sx={{
                                fontSize: Theme.typography.fontSize.sm,
                                color: isOwn ? Theme.colors.sacredWhite : colors.text,
                                lineHeight: 20,
                            }}
                        >
                            {item.content}
                        </Text>
                    </Box>
                    <Text sx={{ fontSize: 10, color: colors.textTertiary, alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
                        {time}
                    </Text>
                </VStack>

                {isOwn && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('UserProfile', {
                            userId: item.author_id,
                            userName: item.author?.full_name || user?.full_name || 'Me',
                        })}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Avatar size="xs" sx={{ marginLeft: 8, marginTop: 4, backgroundColor: Theme.colors.sanctuarySaffron }}>
                            {(item.author?.avatar_url || user?.avatar_url)
                                ? <AvatarImage source={{ uri: item.author?.avatar_url || user?.avatar_url }} alt={authorName} />
                                : <AvatarFallbackText>{initials}</AvatarFallbackText>
                            }
                        </Avatar>
                    </TouchableOpacity>
                )}
            </HStack>
        );
    };

    return (
        <ScreenWrapper scroll={false}>
            {/* Header */}
            <HStack
                sx={{
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.sm,
                    alignItems: 'center',
                    gap: Theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <VStack sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: Theme.typography.fontSize.md, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                        {groupName}
                    </Text>
                    <Text sx={{ fontSize: 11, color: colors.textTertiary }}>Group Chat</Text>
                </VStack>
            </HStack>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
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

                {/* Message input */}
                <Box
                    sx={{
                        backgroundColor: colors.secondary,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingHorizontal: Theme.spacing.md,
                        paddingVertical: Theme.spacing.sm,
                    }}
                >
                    <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'flex-end' }}>
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="Write a message…"
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    backgroundColor: colors.tertiary,
                                    borderColor: colors.border,
                                },
                            ]}
                            returnKeyType="default"
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!draft.trim() || sending}
                            style={[
                                styles.sendBtn,
                                { backgroundColor: draft.trim() ? Theme.colors.sanctuarySaffron : colors.border },
                            ]}
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
