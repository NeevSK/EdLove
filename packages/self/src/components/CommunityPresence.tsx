/**
 * COMMUNITY PRESENCE
 * Shows how many teachers/students are currently online based on role.
 * Provides instant comfort and combats isolation.
 * Follows TAIL_FIN resonance principles with glass-morphic status indicator.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Heading,
    Spinner,
} from '@gluestack-ui/themed';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Users, WifiOff } from 'lucide-react-native';
import { supabase, Theme, useThemedColors } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface CommunityPresenceProps {
    compact?: boolean;
    userVibe?: string;
    userId: string;
    userRole: 'teacher' | 'student' | 'admin';
}

export default function CommunityPresence({
    compact = false,
    userVibe = 'active',
    userId,
    userRole = 'teacher'
}: CommunityPresenceProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [dominantVibe, setDominantVibe] = useState('Focused');

    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    const fetchOnlineUsers = useCallback(async () => {
        if (!userRole) return;
        try {
            const targetRole = userRole === 'teacher' ? 'student' : 'teacher';

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count, error: countError } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('role', targetRole)
                .gte('last_seen_at', fiveMinutesAgo);

            if (countError) throw countError;
            setOnlineCount(count || 0);
            setIsOffline(false);
        } catch (error) {
            console.error('Error fetching online users:', error);
            setIsOffline(true);
        } finally {
            setIsLoading(false);
        }
    }, [userRole]);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.3, {
                duration: 2500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        pulseOpacity.value = withRepeat(
            withTiming(0.2, {
                duration: 2500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        fetchOnlineUsers();

        if (!userId || !userRole) return;

        const channelName = userRole === 'teacher' ? 'online-students' : 'online-teachers';
        const channel = supabase.channel(channelName);

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const presences = Object.values(state).flat();
                setOnlineCount(presences.length);
                setIsOffline(false);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('User joined sanctuary:', key, newPresences);
                setIsOffline(false);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('User left sanctuary:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: userId,
                        vibe: userVibe,
                        role: userRole,
                        online_at: new Date().toISOString(),
                    });
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsOffline(true);
                }
            });

        const heartbeat = setInterval(fetchOnlineUsers, 30000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(heartbeat);
        };
    }, [userId, userVibe, userRole, fetchOnlineUsers, pulseOpacity, pulseScale]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const getVibeColor = (vibe: string) => {
        switch (vibe.toLowerCase()) {
            case 'active': return colors.action;
            case 'focused': return Theme.colors.sanctuaryBlue;
            case 'reflecting': return Theme.colors.twilightPurple;
            case 'teaching': return Theme.colors.dawnGold;
            case 'planning': return Theme.colors.skyBlue;
            default: return colors.success;
        }
    };

    const vibeColor = useMemo(() => isOffline ? colors.textTertiary : getVibeColor(dominantVibe), [isOffline, dominantVibe, colors]);
    const roleLabel = userRole === 'teacher' ? t('community.students', 'Students') : t('community.teachers', 'Teachers');

    if (isLoading) {
        return (
            <HStack space="md" alignItems="center" p={compact ? 0 : "$4"} opacity={0.6}>
                <Spinner size="small" color={colors.action} />
                <Text size="sm" color={colors.textSecondary}>Locating Sanctuary Presence...</Text>
            </HStack>
        );
    }

    if (compact) {
        return (
            <HStack space="xs" alignItems="center">
                <Box
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: vibeColor,
                    }}
                />
                <Text size="xs" color={colors.textSecondary} bold>
                    {isOffline ? t('community.offline', 'Offline') : `${onlineCount} ${roleLabel}`}
                </Text>
            </HStack>
        );
    }

    return (
        <VStack space="md" p={compact ? 0 : "$4"}>
            <HStack space="md" alignItems="center">
                <Box sx={{ position: 'relative' }}>
                    {isOffline ? (
                        <WifiOff color={colors.textTertiary} size={28} />
                    ) : (
                        <Users color={vibeColor} size={28} />
                    )}

                    {!isOffline && (
                        <Animated.View
                            style={[
                                pulseStyle,
                                {
                                    position: 'absolute',
                                    top: -4,
                                    right: -4,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 6,
                                    backgroundColor: vibeColor,
                                },
                            ]}
                        />
                    )}
                </Box>
                <VStack>
                    <Heading size="sm" color={colors.text}>
                        {isOffline ? t('community.offlineTitle', 'Connection Interrupted') : t('community.sanctuaryPulse', 'Sanctuary Pulse')}
                    </Heading>
                    <Text color={colors.textSecondary} size="sm">
                        {isOffline
                            ? t('community.offlineDesc', 'Reconnecting to current...')
                            : `${onlineCount} ${roleLabel} ${t('community.onlineNow', 'thriving now')}`}
                    </Text>
                    {!isOffline && (
                        <Text
                            color={colors.textTertiary}
                            size="xs"
                            sx={{ mt: '$1' }}
                        >
                            {t('community.dominantVibe', 'Dominant Vibe')}: {dominantVibe}
                        </Text>
                    )}
                </VStack>
            </HStack>

            {!isOffline && onlineCount > 0 && (
                <Box
                    sx={{
                        bg: colors.secondary,
                        p: '$3',
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}
                >
                    <Text size="xs" color={colors.textSecondary} italic>
                        {userRole === 'teacher'
                            ? t('community.teacherMotivation', 'Your students are active. They are waiting for your wisdom.')
                            : t('community.studentMotivation', 'Your mentors are here. Guidance is just a pulse away.')}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
