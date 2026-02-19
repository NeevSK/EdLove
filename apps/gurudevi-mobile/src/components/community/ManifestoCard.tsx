import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Pressable,
} from '@repo/ui';
import { Heart, Target, Star, ShieldCheck } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { SanctuaryManifesto } from '@repo/community';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolateColor
} from 'react-native-reanimated';

interface ManifestoCardProps extends SanctuaryManifesto {
    onEndorse?: (id: string) => void;
    onPress?: () => void;
}

export default function ManifestoCard({
    id,
    title,
    content,
    vibe,
    endorsement_count = 0,
    has_endorsed = false,
    onEndorse,
    onPress,
}: ManifestoCardProps) {
    const scale = useSharedValue(1);

    const vibeConfig = {
        visionary: { icon: Star, color: Theme.colors.templeGold, bg: '#FFFDE7' },
        supportive: { icon: Heart, color: Theme.colors.twilightPurple, bg: '#F3E5F5' },
        academic: { icon: Target, color: Theme.colors.gurudeviBlue, bg: '#E3F2FD' },
        wellbeing: { icon: ShieldCheck, color: Theme.colors.sageGreen, bg: '#E8F5E9' },
    };

    const config = vibeConfig[vibe] || vibeConfig.visionary;
    const VibeIcon = config.icon;

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={animatedStyle}>
                <Box
                    p={Theme.spacing.lg}
                    sx={{
                        backgroundColor: Theme.colors.midnightBlue,
                        borderRadius: Theme.corners.comfortable,
                        borderLeftWidth: 4,
                        borderLeftColor: config.color,
                        shadowColor: config.color,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 2,
                    }}
                >
                    <VStack space="md">
                        <HStack justifyContent="space-between" alignItems="center">
                            <HStack space="xs" alignItems="center">
                                <Box
                                    p="$1"
                                    sx={{
                                        backgroundColor: config.bg,
                                        borderRadius: Theme.corners.tight,
                                    }}
                                >
                                    <VibeIcon size={16} color={config.color} />
                                </Box>
                                <Text
                                    size="xs"
                                    color={config.color}
                                    sx={{ textTransform: 'uppercase', fontWeight: Theme.typography.fontWeight.bold }}
                                >
                                    {vibe} Manifesto
                                </Text>
                            </HStack>

                            <HStack space="xs" alignItems="center">
                                <Heart
                                    size={16}
                                    color={has_endorsed ? Theme.colors.emberRed : Theme.colors.mistGray}
                                    fill={has_endorsed ? Theme.colors.emberRed : 'transparent'}
                                />
                                <Text size="xs" color={Theme.colors.mistGray}>
                                    {endorsement_count}
                                </Text>
                            </HStack>
                        </HStack>

                        <VStack space="xs">
                            <Heading size="md" color={Theme.colors.sacredWhite}>
                                {title}
                            </Heading>
                            <Text
                                size="sm"
                                numberOfLines={3}
                                color={Theme.colors.pearlGray}
                                sx={{ lineHeight: 20 }}
                            >
                                {content}
                            </Text>
                        </VStack>

                        <Pressable
                            onPress={() => onEndorse?.(id)}
                            sx={{
                                marginTop: Theme.spacing.sm,
                                backgroundColor: has_endorsed ? config.bg : 'transparent',
                                paddingVertical: Theme.spacing.sm,
                                paddingHorizontal: Theme.spacing.md,
                                borderRadius: Theme.corners.tight,
                                borderWidth: 1,
                                borderColor: has_endorsed ? 'transparent' : Theme.colors.dimGray,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <HStack space="xs" alignItems="center">
                                <Text
                                    size="xs"
                                    bold
                                    color={has_endorsed ? config.color : Theme.colors.mistGray}
                                >
                                    {has_endorsed ? 'Endorsed' : 'Endorse Mission'}
                                </Text>
                            </HStack>
                        </Pressable>
                    </VStack>
                </Box>
            </Animated.View>
        </Pressable>
    );
}
