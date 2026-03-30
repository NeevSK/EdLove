/**
 * COMMUNITY PRESENCE
 * Shows how many teachers/students are currently online based on role.
 * Provides instant comfort and combats isolation.
 * Follows TAIL_FIN resonance principles with glass-morphic status indicator.
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
    }, [pulseOpacity, pulseScale]);

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
        if (perspective === 'student') return t('community.students');
        if (perspective === 'principal') return t('community.members');
        return t('community.educators');
    }, [perspective, t]);

    const motivationText = useMemo(() => {
        if (perspective === 'student') return t('community.studentMotivation');
        if (perspective === 'principal') return t('community.principalMotivation');
        return t('community.teacherMotivation');
    }, [perspective, t]);

    if (isLoading) {
        return (
            <HStack space="md" alignItems="center" p={hidePadding || compact ? 0 : "$4"} opacity={0.6}                <Spinner size="small" color={colors.action} /                <Text color={colors.textSecondary} sx={{ fontSize: '$sm' }}>Locating Sanctuary Presence...</Text            </HStack        );
    }

    if (compact) {
        return (
            <HStack space="xs" alignItems="center"                <Box
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: vibeColor,
                    }}
                /                <Text size="xs" color={colors.textSecondary} bold                    {isOffline ? t('community.offline') : `${onlineCount} ${roleLabel}`}
                </Text            </HStack        );
    }

    return (
        <VStack space="md" p={hidePadding || compact ? 0 : "$4"}            <HStack space="md" alignItems="center"                <Box sx={{ position: 'relative' }}                    {isOffline ? (
                        <WifiOff color={colors.textTertiary} size={28} /                    ) : (
                        <Users color={vibeColor} size={28} /                    )}

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
                        /                    )}
                </Box                <VStack                    <Heading size="sm" color={colors.text}                        {isOffline ? t('community.offlineTitle') : t('community.sanctuaryPulse')}
                    </Heading                    <Text color={colors.textSecondary} size="sm"                        {isOffline
                            ? t('community.offlineDesc')
                            : `${onlineCount} ${roleLabel} ${t('community.onlineNow')}`}
                    </Text                    {!isOffline && (
                        <Text
                            color={colors.textTertiary}
                            size="xs"
                            sx={{ mt: '$1' }}
                                                    {t('community.dominantVibe')}: {dominantVibe}
                        </Text                    )}
                </VStack            </HStack
            {!isOffline && onlineCount > 0 && (
                <Box
                    sx={{
                        bg: colors.secondary,
                        p: '$3',
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                                    <Text size="xs" color={colors.textSecondary} italic                        {motivationText}
                    </Text                </Box            )}
        </VStack    );
}
