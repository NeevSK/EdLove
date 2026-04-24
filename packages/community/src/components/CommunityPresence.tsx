/**
 * COMMUNITY PRESENCE
 * Shows how many teachers/students are currently online based on role.
 * Refactored for Sanctuary V3.
 */

import React, { useEffect, useMemo } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Heading,
    Spinner,
    View,
    Icon
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

    // Replaced hardcoded HEX with semantic Tailwind equivalents for better theme reactivity
    const getVibeClass = (vibe: string) => {
        switch (vibe.toLowerCase()) {
            case 'active': return 'text-phase-interactive';
            case 'focused': return 'text-phase-interactive';
            case 'reflecting': return 'text-phase-interactive'; // standardizing for now
            case 'teaching': return 'text-ink';
            case 'planning': return 'text-phase-interactive';
            default: return 'text-ink/60';
        }
    };

    const vibeClass = useMemo(
        () => isOffline ? 'text-ink/40' : getVibeClass(dominantVibe),
        [isOffline, dominantVibe]
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
            <HStack 
                className={`items-center opacity-60 gap-3 ${hidePadding || compact ? 'p-0' : 'p-4'}`}
            >
                <Spinner />
                <Text className="text-ink/60 text-sm">
                    Locating Sanctuary Presence...
                </Text>
            </HStack>
        );
    }

    if (compact) {
        return (
            <HStack className="items-center gap-2">
                <Box
                    className={`w-2 h-2 rounded-full ${isOffline ? 'bg-ink/40' : 'bg-phase-interactive'}`}
                />
                <Text className="text-[12px] text-ink/60 font-bold">
                    {isOffline ? t('community.offline') || 'Offline' : `${onlineCount} ${roleLabel}`}
                </Text>
            </HStack>
        );
    }

    return (
        <VStack className={`gap-4 ${hidePadding || compact ? 'p-0' : 'p-4'}`}>
            <HStack className="items-center gap-4">
                <View className="relative">
                    {isOffline ? (
                        <Icon as={WifiOff} className="text-ink/40" size="lg" />
                    ) : (
                        <Icon as={Users} className={vibeClass} size="lg" />
                    )}
                    {!isOffline && (
                        <Animated.View style={pulseStyle}>
                            <Box className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-phase-interactive" />
                        </Animated.View>
                    )}
                </View>
                <VStack className="gap-0.5">
                    <Heading className="text-sm font-bold text-ink">
                        {isOffline ? t('community.offlineTitle') || 'Connection Lost' : t('community.sanctuaryPulse') || 'Sanctuary Pulse'}
                    </Heading>
                    <Text className="text-ink/60 text-sm leading-snug">
                        {isOffline
                            ? t('community.offlineDesc') || 'You are viewing a static instance.'
                            : `${onlineCount} ${roleLabel} ${t('community.onlineNow') || 'present now'}`}
                    </Text>
                    {!isOffline && (
                        <Text className="text-ink/40 text-[11px] font-medium mt-0.5">
                            {t('community.dominantVibe') || 'Dominant Vibe'}: <Text className="text-phase-interactive lowercase">{dominantVibe}</Text>
                        </Text>
                    )}
                </VStack>
            </HStack>
            
            {!isOffline && onlineCount > 0 && (
                <Box className="bg-phase-surface/50 p-4 rounded-2xl border border-border">
                    <Text className="text-[12px] text-ink/60 italic leading-relaxed">
                        "{motivationText}"
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
