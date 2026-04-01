/**
 * COMMUNITY PRESENCE
 * Shows how many teachers/students are currently online based on role.
 */

import React, { useEffect, useMemo } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Heading,
    Spinner,
    Theme,
    useThemedColors,
} from '@repo/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Users, WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useCommunityPresence } from '../hooks/useCommunityPresence';

interface CommunityPresenceProps {
    compact?: boolean;
    hidePadding?: boolean;
    userVibe?: string;
    userId: string;
}

export default function CommunityPresence({
    compact = false,
    hidePadding = false,
    userVibe = 'active',
    userId,
}: CommunityPresenceProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const dominantVibe = userVibe;
    const { onlineCount, isLoading, isOffline, perspective } = useCommunityPresence({ userId, userVibe });

    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
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
    }, []);

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

    const roleLabel = useMemo(() => {
        if (perspective === 'student') return t('community.students') || 'Students';
        if (perspective === 'principal') return t('community.members') || 'Members';
        return t('community.educators') || 'Educators';
    }, [perspective, t]);

    const motivationText = useMemo(() => {
        if (perspective === 'student') return t('community.studentMotivation') || 'You are not alone in your journey.';
        if (perspective === 'principal') return t('community.principalMotivation') || 'Maintaining the sanctuary together.';
        return t('community.teacherMotivation') || 'Guiding the future, together.';
    }, [perspective, t]);

    if (isLoading) {
        return (
            <HStack space="md" sx={{ alignItems: 'center', padding: hidePadding || compact ? 0 : 16, opacity: 0.6 }}>
                <Spinner size="small" color={colors.action} />
                <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                    Locating Sanctuary Presence...
                </Text>
            </HStack>
        );
    }

    if (compact) {
        return (
            <HStack space="xs" sx={{ alignItems: 'center' }}>
                <Box
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: vibeColor,
                    }}
                />
                <Text sx={{ fontSize: 12, color: colors.textSecondary, fontWeight: 'bold' }}>
                    {isOffline ? t('community.offline') || 'Offline' : `${onlineCount} ${roleLabel}`}
                </Text>
            </HStack>
        );
    }

    return (
        <VStack space="md" sx={{ padding: hidePadding || compact ? 0 : 16 }}>
            <HStack space="md" sx={{ alignItems: 'center' }}>
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
                    <Heading size="sm" sx={{ color: colors.text }}>
                        {isOffline ? t('community.offlineTitle') || 'Connection Lost' : t('community.sanctuaryPulse') || 'Sanctuary Pulse'}
                    </Heading>
                    <Text sx={{ color: colors.textSecondary, fontSize: 14 }}>
                        {isOffline
                            ? t('community.offlineDesc') || 'You are viewing a static instance.'
                            : `${onlineCount} ${roleLabel} ${t('community.onlineNow') || 'present now'}`}
                    </Text>
                    {!isOffline && (
                        <Text
                            sx={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}
                        >
                            {t('community.dominantVibe') || 'Dominant Vibe'}: {dominantVibe}
                        </Text>
                    )}
                </VStack>
            </HStack>
            
            {!isOffline && onlineCount > 0 && (
                <Box
                    sx={{
                        backgroundColor: colors.secondary,
                        padding: 12,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <Text sx={{ fontSize: 12, color: colors.textSecondary, fontStyle: 'italic' }}>
                        {motivationText}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
