/**
 * COMMUNITY PRESENCE
 * Shows how many teachers are currently online
 * Provides instant comfort and combats teacher isolation
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    HStack,
    Text,
} from '@/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { Users } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';

interface CommunityPresenceProps {
    compact?: boolean;
}

export default function CommunityPresence({ compact = false }: CommunityPresenceProps) {
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    // Pulsing animation for the indicator
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
        // Pulse animation
        pulseScale.value = withRepeat(
            withTiming(1.2, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        pulseOpacity.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        fetchOnlineTeachers();

        // Set up real-time subscription for presence
        const channel = supabase.channel('online-presence');

        // Update count when presence changes
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const count = Object.keys(state).length;
                setOnlineCount(count);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchOnlineTeachers = async () => {
        try {
            // Query for users who have been active in the last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const { count, error } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('role', 'teacher')
                .gte('last_seen_at', fiveMinutesAgo);

            if (!error && count !== null) {
                setOnlineCount(count);
            } else {
                // If query fails, don't show misleading data
                setOnlineCount(0);
            }
        } catch (error) {
            console.error('Error fetching online teachers:', error);
            // On error, show 0 rather than fake data
            setOnlineCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    if (isLoading) {
        return null; // Or a subtle loading state
    }

    if (compact) {
        return (
            <HStack
                space="xs"
                alignItems="center"
                sx={{
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.sm,
                    backgroundColor: Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Animated.View style={pulseStyle}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: Theme.colors.sageGreen,
                        }}
                    />
                </Animated.View>
                <Text
                    color={Theme.colors.mistGray}
                    size="sm"
                    sx={{ fontWeight: Theme.typography.fontWeight.medium }}
                >
                    {onlineCount} teachers online
                </Text>
            </HStack>
        );
    }

    return (
        <Box
            sx={{
                backgroundColor: Theme.colors.midnightBlue,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: Theme.colors.sageGreen,
            }}
        >
            <HStack space="md" alignItems="center">
                {/* Animated pulse indicator */}
                <Box sx={{ position: 'relative' }}>
                    <Users
                        color={Theme.colors.sageGreen}
                        size={32}
                    />
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
                                backgroundColor: Theme.colors.sageGreen,
                            },
                        ]}
                    />
                </Box>

                {/* Count and message */}
                <Box sx={{ flex: 1 }}>
                    <Text
                        color={Theme.colors.sacredWhite}
                        size="2xl"
                        sx={{ fontWeight: Theme.typography.fontWeight.bold }}
                    >
                        {onlineCount} Teachers
                    </Text>
                    <Text
                        color={Theme.colors.mistGray}
                        size="sm"
                    >
                        Online right now
                    </Text>
                </Box>
            </HStack>

            {/* Comforting message */}
            <Text
                color={Theme.colors.pearlGray}
                size="sm"
                sx={{
                    marginTop: Theme.spacing.md,
                    fontStyle: 'italic',
                }}
            >
                You're not alone in this journey 🌟
            </Text>
        </Box>
    );
}
