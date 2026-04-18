import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    LivingGlow,
    SanctuaryCard,
    Theme
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
    const vibeConfig: Record<string, { icon: any; textColor: string }> = {
        visionary: { icon: Star, textColor: 'text-primary-500' },
        supportive: { icon: Heart, textColor: 'text-error-500' },
        academic: { icon: Target, textColor: 'text-secondary-500' },
        wellbeing: { icon: ShieldCheck, textColor: 'text-success-500' },
    };

    const config = vibeConfig[vibe] || vibeConfig.visionary;
    const VibeIcon = config.icon;

    return (
        <SanctuaryCard onPress={onPress} elevated={has_endorsed}>
            <VStack space="md">
                <HStack className="justify-between items-center">
                    <HStack space="xs" className="items-center">
                        <Box className="p-1 bg-surface-lowest border border-outline-variant rounded-sm">
                            <VibeIcon size={16} className={config.textColor} />
                        </Box>
                        <Text className={`text-[10px] font-extrabold uppercase ${config.textColor}`}>
                            {vibe} Manifesto
                        </Text>
                    </HStack>

                    <HStack space="xs" className="items-center">
                        <Heart
                            size={16}
                            fill={has_endorsed ? 'currentColor' : 'none'}
                            className={has_endorsed ? 'text-error-500' : 'text-muted-foreground'}
                        />
                        <Text className="text-[12px] font-bold text-muted-foreground">
                            {endorsement_count}
                        </Text>
                    </HStack>
                </HStack>

                <VStack space="xs">
                    <Heading size="md" className="text-foreground">
                        {title}
                    </Heading>
                    <Text
                        numberOfLines={onPress ? 3 : undefined}
                        className="text-sm leading-relaxed text-muted-foreground"
                    >
                        {content}
                    </Text>
                </VStack>

                <Animated.View layout={LinearTransition}>
                    <HStack className="justify-between items-center mt-1">
                        <TouchableOpacity
                            onPress={() => onEndorse?.(id)}
                            className={`py-1.5 px-3 rounded-comfortable border ${has_endorsed ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-outline-variant'}`}
                        >
                            <Text className={`text-[11px] font-bold ${has_endorsed ? 'text-white' : 'text-muted-foreground'}`}>
                                {has_endorsed ? 'Identified with Mission' : 'Endorse Mission'}
                            </Text>
                        </TouchableOpacity>

                        {has_endorsed && (
                            <LivingGlow duration={3000}>
                                <Star size={18} className="text-primary-500" />
                            </LivingGlow>
                        )}
                    </HStack>
                </Animated.View>
            </VStack>
        </SanctuaryCard>
    );
}
