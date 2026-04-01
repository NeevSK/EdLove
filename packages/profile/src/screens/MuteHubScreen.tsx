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
            t('profile.safety.unmuteTitle') || 'Unmute User',
            t('profile.safety.unmuteConfirm', { name: userName }) || `Are you sure you want to unmute ${userName}?`,
            [
                { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('profile.safety.unmuteAction') || 'Unmute',
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
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={t('profile.safety_hub') || 'Safety Hub'}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView
                contentContainerStyle={{ padding: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors?.action || '#2196f3'} />
                }
            >
                <VStack space="lg">
                    <Box 
                        sx={{ 
                            p: Theme.spacing.md, 
                            bg: colors?.primary || Theme.colors.ink, 
                            borderRadius: Theme.corners.comfortable, 
                            borderWidth: 1, 
                            borderColor: colors?.border || 'rgba(255,255,255,0.1)' 
                        }}
                    >
                        <HStack space="md" sx={{ alignItems: 'center' }}>
                            <Shield size={24} color={colors?.action || '#2196f3'} />
                            <VStack sx={{ flex: 1 }}>
                                <Text sx={{ fontWeight: '700', color: colors?.text || '#fff' }}>
                                    {t('profile.safety.mutedTotal') || 'Muted Connections'}
                                </Text>
                                <Text sx={{ fontSize: 12, color: colors?.textSecondary || '#aaa' }}>
                                    {t('profile.safety.mutedDesc') || 'People whose updates are hidden from your feed.'}
                                </Text>
                            </VStack>
                        </HStack>
                    </Box>

                    <Heading size="sm" sx={{ color: colors?.textSecondary || '#aaa', marginTop: Theme.spacing.md }}>
                        {t('profile.safety.mutedList') || 'Muted List'} ({mutedUsers.length})
                    </Heading>

                    {mutedUsers.length === 0 && !loading ? (
                        <Center sx={{ height: 200 }}>
                            <VStack space="md" sx={{ alignItems: 'center' }}>
                                <XCircle size={48} color={colors?.textTertiary || '#666'} style={{ opacity: 0.5 }} />
                                <Text sx={{ color: colors?.textTertiary || '#666' }}>
                                    {t('profile.safety.noMutes') || 'Your list is empty.'}
                                </Text>
                            </VStack>
                        </Center>
                    ) : (
                        <VStack space="sm">
                            {mutedUsers.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        p: Theme.spacing.md,
                                        bg: colors?.primary || Theme.colors.ink,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 1,
                                        borderColor: colors?.border || 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <HStack space="md" sx={{ alignItems: 'center', flex: 1 }}>
                                            <UserAvatar
                                                avatarUrl={user.avatar_url}
                                                fullName={user.full_name}
                                                size={40}
                                                authority={user.authority}
                                            />
                                            <VStack>
                                                <Text sx={{ fontWeight: '700', color: colors?.text || '#fff' }}>
                                                    {user.full_name}
                                                </Text>
                                                <Text sx={{ fontSize: 12, color: colors?.textTertiary || '#666' }}>
                                                    @{user.id.substring(0, 8)}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        
                                        <TouchableOpacity 
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
                                                backgroundColor: (colors?.error || '#f44336') + '15'
                                            }}
                                        >
                                            <Trash2 size={20} color={colors?.error || '#f44336'} />
                                        </TouchableOpacity>
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}
