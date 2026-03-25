/**
 * COMMUNITY PRESENCE
 * Shows how many teachers/students are currently online based on role.
 * Provides instant comfort and combats isolation.
 * Follows TAIL_FIN resonance principles with glass-morphic status indicator.
 *
 * Fixed bugs (2026-03-02):
 *  1. Principal role now shows CUMULATIVE count (all roles).
 *  2. Dual-channel architecture: self-tracking channel is separate from the
 *     watcher channel so a teacher's presence is never mixed into the student count.
 *  3. last_seen_at is updated on subscribe so the DB fallback count is accurate.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Heading,
    Spinner,
} from '@repo/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Users, WifiOff } from 'lucide-react-native';
import { supabase, usePermissions } from '@repo/core';
import { Theme, useThemedColors } from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface CommunityPresenceProps {
    compact?: boolean;
    hidePadding?: boolean;
    userVibe?: string;
    userId: string;
}

/**
 * PRESENCE LOGIC (Refactored to POA 2026-03-24):
 *  - PrincipalPulse → see full SCHOOL count (oversight)
 *  - TeacherPulse   → see EDUCATOR count (solidarity)
 *  - StudentPulse   → see STUDENT count  (comfort)
 */
export default function CommunityPresence({
    compact = false,
    hidePadding = false,
    userVibe = 'active',
    userId,
}: CommunityPresenceProps) {
    const { t } = useTranslation();
    const { can, context } = usePermissions();
    const userRole = context.roles[0];
    const colors = useThemedColors();

    const [onlineCount, setOnlineCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [dominantVibe, setDominantVibe] = useState(userVibe);

    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    const { targetRoles, channelName, isCumulative, perspective } = useMemo(() => {
        if (can('read', 'PrincipalPulse')) {
            return {
                targetRoles: ['teacher', 'student', 'section_head', 'grade_head', 'principal', 'developer'],
                channelName: 'presence:school',
                isCumulative: true,
                perspective: 'principal'
            };
        }
        if (can('read', 'TeacherPulse')) {
             return {
                targetRoles: ['teacher', 'section_head', 'grade_head', 'principal'],
                channelName: 'presence:educators',
                isCumulative: false,
                perspective: 'teacher'
            };
        }
        return {
            targetRoles: ['student'],
            channelName: 'presence:students',
            isCumulative: false,
            perspective: 'student'
        };
    }, [can]);

    // DB fallback: count users who were last_seen_at in the past 5 minutes
    const fetchOnlineUsers = useCallback(async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            let query = supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .gte('last_seen_at', fiveMinutesAgo);

            if (!isCumulative) {
                // Filter to just the target role(s)
                query = query.in('role', targetRoles);
            } else if (userId && userId !== 'guest') {
                // Cumulative: exclude own userId if it's a valid ID
                query = query.neq('id', userId);
            }

            const { count, error: countError } = await query;
            if (countError) throw countError;
            setOnlineCount(count || 0);
            setIsOffline(false);
        } catch (error) {
            console.error('[CommunityPresence] Error fetching online users:', error);
            setIsOffline(true);
        } finally {
            setIsLoading(false);
        }
    }, [userRole, targetRoles, isCumulative, userId]);

    useEffect(() => {
        // Animate the pulse glow
        pulseScale.value = withRepeat(
            withTiming(1.3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        pulseOpacity.value = withRepeat(
            withTiming(0.2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        fetchOnlineUsers();

        if (!userId) return;

        // ─── Channel A: Self-Tracking ─────────────────────────────────────────
        // The user announces THEIR OWN presence here. Role-namespaced so a teacher's
        // own presence never lands inside the students-watcher channel.
        const selfChannelName = `presence:self:${userRole}`;
        const selfChannel = supabase.channel(selfChannelName);

        selfChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Update last_seen_at in DB so the DB-fallback count is accurate
                await supabase
                    .from('users')
                    .update({ last_seen_at: new Date().toISOString() })
                    .eq('id', userId);

                await selfChannel.track({
                    user_id: userId,
                    vibe: userVibe,
                    online_at: new Date().toISOString(),
                });
            }
        });

        // ─── Channel B: Watching Others ───────────────────────────────────────
        // Subscribes to the presence channel of the role(s) we WANT TO SEE.
        // A teacher watches 'presence:students'; a student watches 'presence:teachers'.
        const watcherChannel = supabase.channel(channelName);

        watcherChannel
            .on('presence', { event: 'sync' }, () => {
                const state = watcherChannel.presenceState();
                const presences = Object.values(state).flat();
                setOnlineCount(presences.length);
                setIsOffline(false);
            })
            .on('presence', { event: 'join' }, () => {
                setIsOffline(false);
            })
            .on('presence', { event: 'leave' }, () => {
                // count updates via sync; no extra action needed
            })
            .subscribe((status) => {
                if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    setIsOffline(true);
                }
            });

        const heartbeat = setInterval(fetchOnlineUsers, 30000);

        return () => {
            supabase.removeChannel(selfChannel);
            supabase.removeChannel(watcherChannel);
            clearInterval(heartbeat);
        };
    }, [userId, userVibe, channelName, fetchOnlineUsers, pulseOpacity, pulseScale]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const getVibeColor = (vibe: string) => {
        switch (vibe.toLowerCase()) {
            case 'active': return colors.action;
            case 'focused': return colors.action;
            case 'reflecting': return colors.secondary;
            case 'teaching': return colors.success;
            case 'planning': return colors.action;
            default: return colors.success;
        }
    };

    const vibeColor = useMemo(
        () => isOffline ? colors.textTertiary : getVibeColor(dominantVibe),
        [isOffline, dominantVibe, colors]
    );

    // Role-aware label: who am I seeing?
    const roleLabel = useMemo(() => {
        if (perspective === 'student') return t('community.students');
        if (perspective === 'principal') return t('community.members');
        return t('community.educators'); // teachers see other educators
    }, [perspective, t]);

    // Motivational message based on role
    const motivationText = useMemo(() => {
        if (perspective === 'student') return t('community.studentMotivation');
        if (perspective === 'principal') return t('community.principalMotivation');
        return t('community.teacherMotivation');
    }, [perspective, t]);

    if (isLoading) {
        return (
            <HStack space="md" alignItems="center" p={hidePadding || compact ? 0 : "$4"} opacity={0.6}>
                <Spinner size="small" color={colors.action} />
                <Text color={colors.textSecondary} sx={{ fontSize: '$sm' }}>Locating Sanctuary Presence...</Text>
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
                    {isOffline ? t('community.offline') : `${onlineCount} ${roleLabel}`}
                </Text>
            </HStack>
        );
    }

    return (
        <VStack space="md" p={hidePadding || compact ? 0 : "$4"}>
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
                        {isOffline ? t('community.offlineTitle') : t('community.sanctuaryPulse')}
                    </Heading>
                    <Text color={colors.textSecondary} size="sm">
                        {isOffline
                            ? t('community.offlineDesc')
                            : `${onlineCount} ${roleLabel} ${t('community.onlineNow')}`}
                    </Text>
                    {!isOffline && (
                        <Text
                            color={colors.textTertiary}
                            size="xs"
                            sx={{ mt: '$1' }}
                        >
                            {t('community.dominantVibe')}: {dominantVibe}
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
                        {motivationText}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
