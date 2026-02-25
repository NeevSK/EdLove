import React, { useState, useEffect, useRef } from 'react';
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
    SanctuaryButton,
} from '@repo/ui';
import { uploadToCloudinary } from '@repo/core';
import { SanctuaryManifesto } from '../api/sacredMissions';
import { Star, Sparkles, Megaphone, Users } from 'lucide-react-native';
import { ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Post } from '@repo/community';
import { CommunityPresence } from '@repo/self';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - (Theme.spacing.md * 2);
const AUTO_SWIPE_INTERVAL = 6000;

interface CommunityHearthProps {
    manifestos?: SanctuaryManifesto[];
    spotlightPost?: Post;
    userRole?: 'teacher' | 'student' | 'admin';
    userVibe?: string;
    onEndorseManifesto?: (id: string) => void;
    onPressSpotlight?: (id: string) => void;
}

export default function CommunityHearth({
    manifestos,
    spotlightPost,
    userRole = 'teacher',
    userVibe = 'active',
    onEndorseManifesto,
    onPressSpotlight,
}: CommunityHearthProps) {
    const colors = useThemedColors();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const slides: { key: string; content: React.ReactNode }[] = [
        {
            key: 'presence',
            content: <CommunityPresence compact={false} userRole={userRole} userVibe={userVibe} />
        }
    ];

    if (manifestos && manifestos.length > 0) {
        manifestos.forEach((manifesto, index) => {
            slides.push({
                key: `manifesto-${index}`,
                content: (
                    <VStack space="sm" p="$4">
                        <HStack space="xs" alignItems="center">
                            <Star size={14} color={Theme.colors.sanctuarySaffron} />
                            <Text size="xs" color={Theme.colors.sanctuarySaffron} bold sx={{ textTransform: 'uppercase' }}>
                                {manifesto.vibe || 'Vision'} Manifesto
                            </Text>
                        </HStack>
                        <Heading size="md" color={colors.text}>
                            {manifesto.title}
                        </Heading>
                        <Text size="sm" color={colors.textSecondary} numberOfLines={3} sx={{ lineHeight: 22 }}>
                            {manifesto.content}
                        </Text>
                        {onEndorseManifesto && (
                            <Pressable onPress={() => onEndorseManifesto(manifesto.id)}>
                                <HStack space="xs" alignItems="center" mt="$2">
                                    <Sparkles size={14} color={Theme.colors.sanctuarySaffron} />
                                    <Text size="xs" color={Theme.colors.sanctuarySaffron} bold>
                                        Align with Vision →
                                    </Text>
                                </HStack>
                            </Pressable>
                        )}
                    </VStack>
                )
            });
        });
    }

    if (spotlightPost) {
        slides.push({
            key: 'spotlight',
            content: (
                <VStack space="sm" p="$4">
                    <HStack space="xs" alignItems="center">
                        <Megaphone size={14} color={Theme.colors.gurudeviViolet} />
                        <Text size="xs" color={Theme.colors.gurudeviViolet} bold sx={{ textTransform: 'uppercase' }}>
                            Community Spotlight
                        </Text>
                    </HStack>
                    <Heading size="md" color={colors.text}>
                        {spotlightPost.content.substring(0, 40)}...
                    </Heading>
                    <Text size="sm" color={colors.textSecondary} numberOfLines={2}>
                        {spotlightPost.content}
                    </Text>
                    <Text size="xs" color={colors.textTertiary}>
                        Shared by {spotlightPost.author_name}
                    </Text>
                </VStack>
            )
        });
    }

    // Auto-swipe logic
    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, [activeIndex, slides.length]);

    const startTimer = () => {
        stopTimer();
        if (slides.length <= 1) return;

        timerRef.current = setInterval(() => {
            const nextIndex = (activeIndex + 1) % slides.length;
            scrollRef.current?.scrollTo({
                x: nextIndex * (CARD_WIDTH + Theme.spacing.md),
                animated: true
            });
            setActiveIndex(nextIndex);
        }, AUTO_SWIPE_INTERVAL);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / (CARD_WIDTH + Theme.spacing.md));
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    return (
        <VStack space="sm" sx={{ marginBottom: Theme.spacing.lg }}>
            <HStack justifyContent="space-between" alignItems="center" px="$4">
                <Text size="sm" color={Theme.colors.mistGray} bold>
                    The Community Hearth
                </Text>
                <HStack space="xs">
                    {slides.map((_, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: i === activeIndex ? 16 : 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: i === activeIndex ? colors.action : colors.border,
                            }}
                        />
                    ))}
                </HStack>
            </HStack>

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollBeginDrag={stopTimer}
                onScrollEndDrag={startTimer}
                scrollEventThrottle={16}
                snapToInterval={CARD_WIDTH + Theme.spacing.md}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: Theme.spacing.md }}
            >
                {slides.map((slide, index) => (
                    <Box
                        key={slide.key}
                        sx={{
                            width: CARD_WIDTH,
                            marginRight: index === slides.length - 1 ? 0 : Theme.spacing.md,
                        }}
                    >
                        <LivingGlow duration={4000 + (index * 500)}>
                            <SanctuaryCard
                                onPress={slide.key === 'spotlight' ? () => onPressSpotlight?.(spotlightPost!.id) : undefined}
                            >
                                <Box sx={{ minHeight: 140 }}>
                                    <Animated.View layout={LinearTransition}>
                                        {slide.content}
                                    </Animated.View>
                                </Box>
                            </SanctuaryCard>
                        </LivingGlow>
                    </Box>
                ))}
            </ScrollView>
        </VStack>
    );
}
