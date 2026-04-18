/**
 * DirectMessagesListScreen
 *
 * Displays a list of recent 1:1 conversations.
 */

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
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
        const name = item.other_user_name || 'Explorer';
        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('DirectMessage', {
                        conversationId: item.id,
                        userName: name
                    })}
                >
                    <HStack
                        className="p-4 items-center bg-surface-low border-b border-outline-variant gap-4"
                    >
                        <Avatar size="md" className="bg-primary-500">
                            {item.other_user_avatar ? (
                                <AvatarImage source={{ uri: item.other_user_avatar }} alt={name} />
                            ) : (
                                <AvatarFallbackText>{initials}</AvatarFallbackText>
                            )}
                        </Avatar>

                        <VStack className="flex-1">
                            <Text className="font-bold text-foreground">
                                {name}
                            </Text>
                            <Text className="text-[12px] text-muted-foreground" numberOfLines={1}>
                                Tap to continue conversation
                            </Text>
                        </VStack>

                        <Text className="text-[10px] text-muted-foreground">
                            {new Date(item.updated_at).toLocaleDateString()}
                        </Text>
                    </HStack>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <Box className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator color="#E67E22" />
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-background">
            <SanctuaryFlashList
                data={conversations}
                keyExtractor={(item) => item.id}
                estimatedItemSize={80}
                renderItem={renderItem}
                onRefresh={onRefresh}
                refreshing={refreshing}
                ListEmptyComponent={
                    <Box className="flex-1 p-10 items-center justify-center">
                        <Text className="text-center text-muted-foreground">
                            No messages yet. Start a conversation from a user's profile!
                        </Text>
                    </Box>
                }
            />
        </Box>
    );
}
