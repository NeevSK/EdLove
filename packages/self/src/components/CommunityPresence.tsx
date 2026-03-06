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
import { supabase } from '@repo/core';
import { Theme, useThemedColors } from '@repo/ui';
import { useTranslation } from 'react-i18next';

// Extended role type to include principal (and other staff roles that see cumulative counts)
type PresenceRole = 'teacher' | 'student' | 'admin' | 'principal' | 'section_head' | 'grade_head' | 'founder' | 'developer';


interface CommunityPresenceProps {
    compact?: boolean;
    hidePadding?: boolean;
    userVibe?: string;
    userId: string;
    userRole: PresenceRole;
}

/**
 * PRESENCE LOGIC (corrected 2026-03-02):
 *  - Students   → see STUDENT count  (comfort: "my peers are here")
 *  - Teachers   → see EDUCATOR count (solidarity: "other educators are present")
 *  - Principals → see full SCHOOL count (oversight)
 */
function getWatcherConfig(role: PresenceRole): {
    targetRoles: string[];
    channelName: string;
    isCumulative: boolean;
} {
    if (role === 'student') {
        return {
            targetRoles: ['student'],
            channelName: 'presence:students',
            isCumulative: false,
        };
    }
    if (role === 'principal' || role === 'founder' || role === 'developer') {
        return {
            targetRoles: ['teacher', 'student', 'section_head', 'grade_head', 'principal', 'developer'],
            channelName: 'presence:school',
            isCumulative: true,
        };
    }

    // teacher, section_head, grade_head, admin → see other educators
    return {
        targetRoles: ['teacher', 'section_head', 'grade_head', 'principal'],
        channelName: 'presence:educators',
        isCumulative: false,
    };
}

export default function CommunityPresence({
    compact = false,
    hidePadding = false,
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

    const { targetRoles, channelName, isCumulative } = useMemo(
        () => getWatcherConfig(userRole as PresenceRole),
        [userRole]
    );

    // DB fallback: count users who were last_seen_at in the past 5 minutes
    const fetchOnlineUsers = useCallback(async () => {
        if (!userRole) return;
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

        if (!userId || !userRole) return;

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
                    role: userRole,
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
    }, [userId, userVibe, userRole, channelName, fetchOnlineUsers, pulseOpacity, pulseScale]);

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
        if (userRole === 'student') return t('community.students', 'Students');
        if (userRole === 'principal' || userRole === 'founder' || userRole === 'developer') return t('community.members', 'Members');
        return t('community.educators', 'Educators'); // teachers see other educators
    }, [userRole, t]);

    // Motivational message based on role
    const motivationText = useMemo(() => {
        if (userRole === 'student') return t('community.studentMotivation', 'Your peers are thriving. You are not alone on this path.');
        if (userRole === 'principal' || userRole === 'founder' || userRole === 'developer') return t('community.principalMotivation', 'Your school community is alive. Keep the current flowing.');
        return t('community.teacherMotivation', 'Fellow educators are present. Share wisdom, not just content.');
    }, [userRole, t]);

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
                    {isOffline ? t('community.offline', 'Offline') : `${onlineCount} ${roleLabel}`}
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
                        {motivationText}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
