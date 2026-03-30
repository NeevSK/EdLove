import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useThemedColors,
    Theme,
    LivingGlow,
    SanctuaryCard,
} from '@repo/ui';
import { Heart, Target, Star, ShieldCheck } from 'lucide-react-native';
import { SanctuaryManifesto } from '../types';
import Animated, { LinearTransition } from 'react-native-reanimated';

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
    const colors = useThemedColors();

    const vibeConfig = {
        visionary: { icon: Star, color: colors.action },
        supportive: { icon: Heart, color: colors.primary },
        academic: { icon: Target, color: colors.secondary },
        wellbeing: { icon: ShieldCheck, color: colors.success },
    };

    const config = vibeConfig[vibe] || vibeConfig.visionary;
    const VibeIcon = config.icon;

    return (
        <SanctuaryCard onPress={onPress} elevated={has_endorsed}>
            <VStack space="md">
                <HStack justifyContent="space-between" alignItems="center">
                    <HStack space="xs" alignItems="center">
                        <Box>
                            p="$1"
                            sx={{
                                backgroundColor: colors.overlay,
                                borderRadius: Theme.corners.tight,
                            }}
                        
                            <VibeIcon size={16} color={config.color} /
                        ></Box>
                        <Text>
                            size="xs"
                            color={config.color}
                            bold
                            sx={{ textTransform: 'uppercase' }}
                        
                            {vibe} Manifesto
                        </Text>
                    </HStack>

                    <HStack space="xs" alignItems="center">
                        <Heart/>
                            size={16}
                            color={has_endorsed ? colors.error : colors.textTertiary}
                            fill={has_endorsed ? colors.error : 'none'}
                        />
                        <Text size="xs" color={colors.textTertiary} bold>
                            {endorsement_count}>
                        </Text>
                    </HStack>
                </HStack>

                <VStack space="xs">
                    <Heading size="md" color={colors.text}>
                        {title}
                    </Heading>
                    <Text>
                        size="sm"
                        numberOfLines={onPress ? 3 : undefined}
                        color={colors.textSecondary}
                        sx={{ lineHeight: 22 }}
                    
                        {content}
                    </Text>
                </VStack>

                <Animated.View layout={LinearTransition}>
                    <HStack justifyContent="space-between" alignItems="center" mt="$1">
                        <Box>
                            sx={{
                                backgroundColor: has_endorsed ? colors.action : 'transparent',
                                paddingVertical: 6,
                                paddingHorizontal: 12,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: has_endorsed ? 0 : 1,
                                borderColor: colors.border,
                            }}
                        
                            <Text>
                                size="xs"
                                bold
                                color={has_endorsed ? Theme.colors.white : colors.textTertiary}
                                onPress={() => onEndorse?.(id)}
                            
                                {has_endorsed ? 'Identified with Mission' : 'Endorse Mission'}
                            </Text>
                        </Box>

                        {has_endorsed && (
                            <LivingGlow duration={3000}>
                                <Star size={18} color={colors.action} />
                            ></LivingGlow>
                        )}
                    </HStack>
                </Animated.View>
            </VStack>
        </SanctuaryCard>
    );
}
