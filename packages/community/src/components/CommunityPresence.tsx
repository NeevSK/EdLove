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
    useThemedColors,
    View,
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
            case 'active': return '#F6BF8C'; // colors.action
            case 'focused': return '#F6BF8C';
            case 'reflecting': return '#B8A9E0'; // colors.secondary
            case 'teaching': return '#8BBF7A'; // colors.success
            case 'planning': return '#F6BF8C';
            default: return '#8BBF7A';
        }
    };

    const vibeColor = useMemo(
        () => isOffline ? '#968E80' : getVibeColor(dominantVibe),
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
                space="md" 
                className={`items-center opacity-60 ${hidePadding || compact ? 'p-0' : 'p-4'}`}
            >
                <Spinner size="small" />
                <Text className="text-willow text-sm">
                    Locating Sanctuary Presence...
                </Text>
            </HStack>
        );
    }

    if (compact) {
        return (
            <HStack space="xs" className="items-center">
                <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: vibeColor }}
                />
                <Text className="text-[12px] text-willow font-bold">
                    {isOffline ? t('community.offline') || 'Offline' : `${onlineCount} ${roleLabel}`}
                </Text>
            </HStack>
        );
    }

    return (
        <VStack space="md" className={hidePadding || compact ? 'p-0' : 'p-4'}>
            <HStack space="md" className="items-center">
                <View className="relative">
                    {isOffline ? (
                        <WifiOff color="#968E80" size={28} />
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
                </View>
                <VStack>
                    <Heading size="sm" className="text-phaseText-primary">
                        {isOffline ? t('community.offlineTitle') || 'Connection Lost' : t('community.sanctuaryPulse') || 'Sanctuary Pulse'}
                    </Heading>
                    <Text className="text-willow text-sm">
                        {isOffline
                            ? t('community.offlineDesc') || 'You are viewing a static instance.'
                            : `${onlineCount} ${roleLabel} ${t('community.onlineNow') || 'present now'}`}
                    </Text>
                    {!isOffline && (
                        <Text className="text-mistGray text-[12px] mt-1">
                            {t('community.dominantVibe') || 'Dominant Vibe'}: {dominantVibe}
                        </Text>
                    )}
                </VStack>
            </HStack>
            
            {!isOffline && onlineCount > 0 && (
                <Box className="bg-linen p-3 rounded-comfortable border border-linen">
                    <Text className="text-[12px] text-willow italic">
                        {motivationText}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
