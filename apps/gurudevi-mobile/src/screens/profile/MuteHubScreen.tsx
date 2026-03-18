import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors,
    GlobalHeader,
    ScreenWrapper,
    Center,
    hapticLight,
    hapticSuccess,
    useEnvironment
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Shield, UserX, XCircle, Trash2, ArrowLeft } from 'lucide-react-native';
import { communityAPI } from '@repo/community';
import { AvatarDisplay } from '@repo/profile';
import { useNavigation } from '@react-navigation/native';

export default function MuteHubScreen() {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const navigation = useNavigation<any>();
    const [mutedUsers, setMutedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMutes = async () => {
        try {
            const data = await communityAPI.getMutedUsers();
            setMutedUsers(data || []);
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
            t('profile.safety.unmuteTitle', 'Unmute User?'),
            t('profile.safety.unmuteConfirm', `Are you sure you want to unmute ${userName}? They will be able to interact with you again.`, { name: userName }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('profile.safety.unmuteAction', 'Unmute'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await communityAPI.unblockUser(userId);
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
                title={t('profile.safety_hub', 'Safety Hub')}
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={{ padding: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.action} />
                }
            >
                <VStack space="lg">
                    <Box sx={{ 
                        p: Theme.spacing.md, 
                        bg: Theme.colors.glass.light.surface, 
                        borderRadius: Theme.corners.comfortable, 
                        borderWidth: 1, 
                        borderColor: Theme.colors.glass.light.border 
                    }}>
                        <HStack space="md" alignItems="center">
                            <Shield size={24} color={colors.action} />
                            <VStack flex={1}>
                                <Text bold color={colors.text}>{t('profile.safety.mutedTotal', 'Silenced Souls')}</Text>
                                <Text size="xs" color={colors.textSecondary}>{t('profile.safety.mutedDesc', 'These users are currently muted. They cannot message you or see your direct interactions.')}</Text>
                            </VStack>
                        </HStack>
                    </Box>

                    <Heading size="sm" color={colors.textSecondary as any} mt={Theme.spacing.md}>
                        {t('profile.safety.mutedList', 'Muted Users')} ({mutedUsers.length})
                    </Heading>

                    {mutedUsers.length === 0 && !loading ? (
                        <Center h={200}>
                            <VStack space="md" alignItems="center">
                                <XCircle size={48} color={colors.textTertiary} opacity={0.5} />
                                <Text color={colors.textTertiary}>{t('profile.safety.noMutes', 'Your sanctuary is peaceful. No users muted.')}</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <VStack space="sm">
                            {mutedUsers.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        p: Theme.spacing.md,
                                        bg: Theme.colors.glass.light.surface,
                                        borderRadius: Theme.corners.comfortable,
                                        borderWidth: 1,
                                        borderColor: Theme.colors.glass.light.border,
                                    }}
                                >
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <HStack space="md" alignItems="center">
                                            <AvatarDisplay
                                                userId={user.id}
                                                avatarUrl={user.avatar_url}
                                                fullName={user.full_name}
                                                size={40}
                                                editable={false}
                                            />
                                            <VStack>
                                                <Text bold color={colors.text}>{user.full_name}</Text>
                                                <Text size="xs" color={colors.textTertiary}>@{user.id.substring(0, 8)}</Text>
                                            </VStack>
                                        </HStack>
                                        
                                        <TouchableOpacity 
                                            onPress={() => {
                                                hapticLight();
                                                handleUnmute(user.id, user.full_name);
                                            }}
                                            style={{
                                                padding: 8,
                                                borderRadius: Theme.corners.tight,
                                                backgroundColor: `${colors.error}15`
                                            }}
                                        >
                                            <Trash2 size={20} color={colors.error} />
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
