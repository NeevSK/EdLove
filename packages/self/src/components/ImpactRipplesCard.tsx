/**
 * IMPACT RIPPLES CARD
 * Renders pending Impact Ripple notifications from the community.
 * Standardized to Zero-Legacy: purged corrupted StyleSheet and migrated to NativeWind v4.
 */

import React from 'react';
import { 
    Box, 
    Text, 
    VStack, 
    HStack, 
    Icon 
} from '@repo/ui';
import { Droplet, Heart, Sparkles } from 'lucide-react-native';
import type { ImpactRipple } from '@repo/core';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ImpactRipplesCardProps {
    ripples: ImpactRipple[];
}

export function ImpactRipplesCard({ ripples }: ImpactRipplesCardProps) {
    if (!ripples || !ripples.length) return null;

    return (
        <Animated.View entering={FadeInDown.duration(800)}>
            <Box className="p-xl bg-skyBlue/5 rounded-3xl border border-skyBlue/10 shadow-sm overflow-hidden">
                <VStack className="gap-lg">
                    {/* Header */}
                    <HStack className="items-center gap-2">
                        <Icon as={Droplet} size={14} className="text-skyBlue" />
                        <Text className="text-skyBlue text-[10px] font-black uppercase tracking-[0.2em]">
                            Impact Ripples
                        </Text>
                    </HStack>

                    {/* Ripple List */}
                    <VStack className="gap-3">
                        {ripples.map((ripple, index) => (
                            <Animated.View 
                                key={ripple.id} 
                                entering={FadeInDown.delay(index * 150)}
                            >
                                <Box className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-sm">
                                    <HStack className="gap-4 items-center">
                                        <Box className="w-8 h-8 rounded-full bg-skyBlue/10 items-center justify-center">
                                            <Icon 
                                                as={ripple.ripple_type === 'gratitude' ? Heart : Sparkles} 
                                                size={12} 
                                                className="text-skyBlue" 
                                            />
                                        </Box>
                                        <VStack className="flex-1">
                                            <Text className="text-sacredWhite/80 text-sm leading-relaxed italic font-medium">
                                                "{ripple.warm_message_en ?? ripple.ripple_type}"
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </Box>
                            </Animated.View>
                        ))}
                    </VStack>

                    <Box className="mt-2 h-0.5 bg-skyBlue/10 rounded-full w-full opacity-50" />
                </VStack>
            </Box>
        </Animated.View>
    );
}

export default ImpactRipplesCard;
