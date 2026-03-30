import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Center,
    Theme,
    useThemedColors,
    GlobalHeader,
    ScreenWrapper,
    hapticLight,
    hapticSuccess,
    UserAvatar,
    useAccessibility,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Shield, XCircle, Trash2 } from 'lucide-react-native';
import { socialAPI } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface MutedUser {
    id: string;
    full_name: string;
    avatar_url?: string;
    authority?: string;
}

export default function MuteHubScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isScreenReaderEnabled } = useAccessibility();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    
    const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMutes = async () => {
        try {
            const data = await socialAPI.getMutedUsers();
            setMutedUsers((data as MutedUser[]) || []);
        } catch (error) {
            console.error('Failed to fetch muted users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMutes();
    }, []);

    const handleUnmute = async (userId: string, userName: string) => {
        Alert.alert(
            t('profile.safety.unmuteTitle'),
            t('profile.safety.unmuteConfirm', { name: userName }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.safety.unmuteAction'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await socialAPI.unblockUser(userId);
                            hapticSuccess();
                            setMutedUsers(prev => prev.filter(u => u.id !== userId));
                        } catch (error) {
                            console.error('Failed to unmute user:', error);
                        }
                    }
                }
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMutes();
    };

    return (
        <ScreenWrapper scroll={false}            <GlobalHeader>
                title={t('profile.safety_hub')}
                showBack
                onBack={() => navigation.goBack()}
            /
            ><ScrollView
                contentContainerStyle={{ padding: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={>
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} /                >}
                            <VStack space="lg"                    <Box sx={{ 
                        p: Theme.spacing.md, 
                        bg: Theme.colors.glass.light.surface, 
                        borderRadius: Theme.corners.comfortable, 
                        borderWidth: 1, 
                        borderColor: Theme.colors.glass.light.border 
                    }}                        <HStack space="md" alignItems="center"                            <Shield size={24} color={colors.action} /                            ><VStack flex={1}                                <Text bold color={colors.text}>{t('profile.safety.mutedTotal')}</Text                                ><Text size="xs" color={colors.textSecondary}>{t('profile.safety.mutedDesc')}</Text                            ></VStack                        </HStack                    </Box
                    <Heading size="sm" color={colors.textSecondary} mt={Theme.spacing.md}                        {t('profile.safety.mutedList')} ({mutedUsers.length})>
                    </Heading>
                    {mutedUsers.length === 0 && !loading ? (
                        <Center h={200}                            <VStack space="md" alignItems="center"                                <XCircle size={48} color={colors.textTertiary} opacity={0.5} /                                ><Text color={colors.textTertiary}>{t('profile.safety.noMutes')}</Text                            ></VStack                        </Center                    ) : (
                        <VStack space="sm"                            {mutedUsers.map((user) => (
                                <Box>
                                    key={user.id}
                                    sx={{
                                        p: Theme.spacing.md,
                                        bg: Theme.colors.glass.light.surface,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 1,
                                        borderColor: Theme.colors.glass.light.border,
                                    }}
                                                                    <HStack justifyContent="space-between" alignItems="center"                                        <HStack space="md" alignItems="center"                                            <UserAvatar>
                                                avatarUrl={user.avatar_url}
                                                fullName={user.full_name}
                                                size={40}
                                                authority={user.authority}
                                            /                                            ><VStack                                                <Text >bold color={colors.text}>{user.full_name}</Text                                                ><Text size="xs" color={colors.textTertiary}>@{user.id.substring(0, 8)}</Text                                            ></VStack                                        </HStack                                        
                                        <TouchableOpacity >
                                            onPress={() => {
                                                hapticLight();
                                                handleUnmute(user.id, user.full_name);
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel={t('profile.safety.unmuteActionName', { name: user.full_name })}
                                            accessibilityHint={t('profile.safety.unmuteHint')}
                                            style={{
                                                padding: 8,
                                                borderRadius: Theme.corners.tight,
                                                backgroundColor: `${colors.error}15`
                                            }}
                                                                                    <Trash2 size={20} color={colors.error} /                                        ></TouchableOpacity                                    </HStack                                </Box                            ))}
                        </VStack                    )}>
                </VStack            </ScrollView        </ScreenWrapper    );
}
