/**
 * COMMUNITY PRESENCE
 * Shows how many teachers are currently online
 * Provides instant comfort and combats teacher isolation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    useThemedColors,
    Theme,
} from '@repo/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Users } from 'lucide-react-native';
import { supabase } from '@repo/core';
import { useTranslation } from 'react-i18next';

interface CommunityPresenceProps {
    compact?: boolean;
    userVibe?: string;
    userRole?: 'teacher' | 'student' | 'admin';
}

export default function CommunityPresence({
    compact = false,
    userVibe = 'active',
    userRole = 'teacher'
}: CommunityPresenceProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [dominantVibe, setDominantVibe] = useState<string>('active');

    // Pulsing animation for the indicator
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    const fetchOnlineUsers = useCallback(async () => {
        try {
            // Fallback to DB query for initial count if presence is still syncing
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { count, error } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('role', userRole)
                .gte('last_seen_at', fiveMinutesAgo);

            if (!error && count !== null) setOnlineCount(count > 0 ? count : 0);
        } catch (error) {
            console.error('Error fetching online users:', error);
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
            withTiming(1, {
                duration: 2500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        fetchOnlineUsers();

        // Specific channel for the user's role to focus the resonance
        const channel = supabase.channel(`online-${userRole}`);

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const presences = Object.values(state).flat();
                setOnlineCount(presences.length);

                const vibes: Record<string, number> = {};
                presences.forEach((p: unknown) => {
                    const presence = p as { vibe?: string };
                    const v = presence.vibe || 'active';
                    vibes[v] = (vibes[v] || 0) + 1;
                });

                const sortedVibes = Object.entries(vibes).sort((a, b) => b[1] - a[1]);
                if (sortedVibes.length > 0) {
                    const topVibe = sortedVibes[0]?.[0];
                    if (topVibe) setDominantVibe(topVibe);
                }
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('User joined sanctuary:', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('User left sanctuary:', key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        vibe: userVibe,
                        role: userRole,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userVibe, userRole, fetchOnlineUsers, pulseOpacity, pulseScale]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const getVibeColor = (vibe: string) => {
        switch (vibe) {
            case 'reflecting': return colors.glow;
            case 'teaching': return colors.action;
            case 'studying': return colors.primary;
            case 'planning': return colors.success;
            default: return colors.action;
        }
    };

    const vibeColor = getVibeColor(dominantVibe);
    const roleLabel = userRole === 'teacher' ? t('community.teachers', 'Teachers') : t('community.students', 'Students');

    if (isLoading) {
        return (
            <HStack space="sm" alignItems="center" justifyContent="center" py="$4">
                <Text color={colors.textTertiary} size="sm" italic>
                    {t('community.connecting', 'Joining the Sanctuary Circle...')}
                </Text>
            </HStack>
        );
    }

    if (compact) {
        return (
            <HStack
                space="xs"
                alignItems="center"
                sx={{
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.sm,
                    backgroundColor: colors.overlay,
                    borderRadius: Theme.corners.comfortable,
                    borderWidth: 1,
                    borderColor: vibeColor,
                }}
            >
                <Animated.View style={pulseStyle}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: vibeColor,
                        }}
                    />
                </Animated.View>
                <Text color={colors.textSecondary} size="sm" bold>
                    {onlineCount} {roleLabel} {t('community.online', 'Online')}
                </Text>
            </HStack>
        );
    }

    return (
        <VStack space="md" p={compact ? 0 : "$4"}>
            <HStack space="md" alignItems="center">
                <Box sx={{ position: 'relative' }}>
                    <Users color={vibeColor} size={28} />
                    <Animated.View
                        style={[
                            pulseStyle,
                            {
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: vibeColor,
                            },
                        ]}
                    />
                </Box>

                <VStack sx={{ flex: 1 }}>
                    <Text color={colors.text} size="lg" bold>
                        {onlineCount} {roleLabel} in Sanctuary
                    </Text>
                    <Text color={colors.textSecondary} size="sm">
                        {t('community.currently', 'Currently')} {dominantVibe !== 'active' ? t(`community.vibes.${dominantVibe}`, dominantVibe) : t('community.active', 'active')}
                    </Text>
                </VStack>
            </HStack>

            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: colors.overlay,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: vibeColor,
                    marginTop: Theme.spacing.xs
                }}
            >
                <Text color={colors.textPrimary} size="sm" italic>
                    {userRole === 'teacher'
                        ? t('community.comfortMessage', "You are with all other teachers in this journey. The circle is open.")
                        : t('community.studentComfort', "Learning together, growing together. The circle is here for you.")
                    } 🌟
                </Text>
            </Box>
        </VStack>
    );
}
