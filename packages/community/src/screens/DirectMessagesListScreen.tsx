/**
 * DirectMessagesListScreen
 *
 * Displays a list of recent 1:1 conversations.
 * Refactored for Sanctuary V3.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    UserAvatar,
    SanctuaryFlashList,
    FadeInDown,
    Pressable,
    Spinner,
    Icon
} from '@repo/ui';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';
import { communityAPI } from '../api/community';
import { DirectConversation } from '../types';
import { MessageSquare, ChevronRight } from 'lucide-react-native';

export default function DirectMessagesListScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const [conversations, setConversations] = useState<DirectConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await communityAPI.getDirectConversations();
            setConversations(data as DirectConversation[]);
        } catch (err) {
            console.error('[DirectMessagesListScreen] load error', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    const renderItem = ({ item, index }: { item: DirectConversation; index: number }) => {
        const name = item.other_user_name || 'Explorer';
        const date = new Date(item.updated_at);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <Pressable
                    onPress={() => navigation.navigate('DirectMessage', {
                        conversationId: item.id,
                        userName: name
                    })}
                    className="mx-5 mb-3"
                >
                    <HStack
                        className="p-4 items-center bg-phase-surface border border-border rounded-2xl gap-4 shadow-sm active:scale-[0.98] transition-all"
                    >
                        <Box className="shadow-sm">
                            <UserAvatar
                                avatarUrl={item.other_user_avatar}
                                fullName={name}
                                size={48}
                            />
                        </Box>

                        <VStack className="flex-1 gap-0.5">
                            <HStack className="justify-between items-center">
                                <Text className="font-black text-ink text-base">
                                    {name}
                                </Text>
                                <Text className="text-[10px] font-bold text-ink/20">
                                    {timeStr}
                                </Text>
                            </HStack>
                            <Text className="text-xs font-medium text-ink/40" numberOfLines={1}>
                                {t('chat.tapToContinue', 'Deepen your resonance...') || 'Tap to continue conversation'}
                            </Text>
                        </VStack>

                        <Icon as={ChevronRight} size="xs" className="text-ink/20" />
                    </HStack>
                </Pressable>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <Box className="flex-1 justify-center items-center bg-phase-canvas">
                <Spinner />
                <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest mt-4">Gathering Resonances...</Text>
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-phase-canvas">
            <SanctuaryFlashList
                data={conversations}
                keyExtractor={(item) => item.id}
                estimatedItemSize={80}
                renderItem={renderItem}
                onRefresh={onRefresh}
                refreshing={refreshing}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                ListEmptyComponent={
                    <VStack className="flex-1 p-10 pt-20 items-center justify-center gap-6">
                        <Box className="w-20 h-20 rounded-full bg-ink/5 items-center justify-center">
                            <Icon as={MessageSquare} size="lg" className="text-ink/20" />
                        </Box>
                        <VStack className="gap-2 items-center">
                            <Text className="text-xl font-black text-ink text-center">
                                {t('chat.noConversationsTitle', 'Quiet Sanctuary') || 'Quiet Sanctuary'}
                            </Text>
                            <Text className="text-center text-ink/40 font-medium px-4 leading-relaxed">
                                {t('chat.noConversationsDesc', "No direct resonances yet. Start a conversation from a user's profile to begin.") || "No direct resonances yet. Start a conversation from a user's profile to begin."}
                            </Text>
                        </VStack>
                    </VStack>
                }
            />
        </Box>
    );
}
