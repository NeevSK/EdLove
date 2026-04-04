/**
 * DirectMessagesListScreen
 *
 * Displays a list of recent 1:1 conversations.
 */

import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
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
    SanctuaryFlashList,
    FadeInDown,
} from '@repo/ui';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';
import { communityAPI } from '../api/community';
import { DirectConversation } from '../types';

export default function DirectMessagesListScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const colors = useThemedColors();
    const [conversations, setConversations] = useState<DirectConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const data = await communityAPI.getDirectConversations();
            setConversations(data as DirectConversation[]);
        } catch (err) {
            console.error('[DirectMessagesListScreen] load error', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    const renderItem = ({ item, index }: { item: DirectConversation; index: number }) => {
        const initials = item.other_user_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('DirectMessage', {
                        conversationId: item.id,
                        userName: item.other_user_name
                    })}
                >
                    <HStack
                        sx={{
                            padding: Theme.spacing.md,
                            alignItems: 'center',
                            backgroundColor: colors.secondary,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            gap: Theme.spacing.md,
                        }}
                    >
                        <Avatar size="md" sx={{ backgroundColor: colors.action }}>
                            {item.other_user_avatar ? (
                                <AvatarImage source={{ uri: item.other_user_avatar }} alt={item.other_user_name} />
                            ) : (
                                <AvatarFallbackText>{initials}</AvatarFallbackText>
                            )}
                        </Avatar>

                        <VStack sx={{ flex: 1 }}>
                            <Text sx={{ fontWeight: '700', color: colors.textPrimary }}>
                                {item.other_user_name}
                            </Text>
                            <Text sx={{ fontSize: 12, color: colors.textTertiary }} numberOfLines={1}>
                                Tap to continue conversation
                            </Text>
                        </VStack>

                        <Text sx={{ fontSize: 10, color: colors.textTertiary }}>
                            {new Date(item.updated_at).toLocaleDateString()}
                        </Text>
                    </HStack>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1 }}>
            <SanctuaryFlashList
                data={conversations}
                keyExtractor={(item) => item.id}
                estimatedItemSize={80}
                renderItem={renderItem}
                onRefresh={onRefresh}
                refreshing={refreshing}
                ListEmptyComponent={
                    <Box sx={{ flex: 1, padding: Theme.spacing.xl, alignItems: 'center', justifyContent: 'center' }}>
                        <Text sx={{ textAlign: 'center', color: colors.textTertiary }}>
                            No messages yet. Start a conversation from a user's profile!
                        </Text>
                    </Box>
                }
            />
        </Box>
    );
}
