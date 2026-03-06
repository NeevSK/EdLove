import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    useThemedColors,
    Theme,
    SanctuaryCard,
    SanctuaryButton,
} from '@repo/ui';
import { uploadToCloudinary } from '@repo/core';
import { SanctuaryManifesto } from '../api/sacredMissions';
import { Star, Sparkles, Megaphone, Users } from 'lucide-react-native';
import { ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Post } from '../index';
import { CommunityPresence } from '@repo/self';
import { UserRole } from '@repo/core';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85; // Netflix-style: cards take 85% of width
const SNAP_INTERVAL = CARD_WIDTH + Theme.spacing.md;
const AUTO_SWIPE_INTERVAL = 8000;

interface CommunityHearthProps {
    manifestos?: SanctuaryManifesto[];
    spotlightPost?: Post;
    userRole?: UserRole | string | null;
    userVibe?: string;
    userId: string;
    onEndorseManifesto?: (id: string) => void;
    onPressSpotlight?: (id: string) => void;
}

export default function CommunityHearth({
    manifestos,
    spotlightPost,
    userRole = 'teacher',
    userVibe = 'active',
    userId,
    onEndorseManifesto,
    onPressSpotlight,
}: CommunityHearthProps) {
    const colors = useThemedColors();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const slides: { key: string; content: React.ReactNode }[] = [];

    // Guest Welcome Slide - always first if guest
    if (userId === 'guest' || !userId) {
        slides.push({
            key: 'welcome',
            content: (
                <VStack space="sm">
                    <HStack space="xs" alignItems="center">
                        <Sparkles size={14} color={Theme.colors.sanctuarySaffron} />
                        <Text size="xs" color={Theme.colors.sanctuarySaffron} bold sx={{ textTransform: 'uppercase' }}>
                            Welcome to the Circle
                        </Text>
                    </HStack>
                    <Heading size="md" color={colors.text}>
                        Feel the School's Pulse
                    </Heading>
                    <Text size="sm" color={colors.textSecondary}>
                        The Hearth is where we share wisdom, celebrate growth, and align our visions. Explore what's blooming today.
                    </Text>
                </VStack>
            )
        });
    }

    slides.push({
        key: 'presence',
        content: <CommunityPresence compact={false} hidePadding={true} userRole={userRole as any} userVibe={userVibe} userId={userId} />
    });

    if (manifestos && manifestos.length > 0) {
        manifestos.forEach((manifesto, index) => {
            slides.push({
                key: `manifesto-${index}`,
                content: (
                    <VStack space="sm">
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

    if (spotlightPost && spotlightPost.content) {
        slides.push({
            key: 'spotlight',
            content: (
                <VStack space="sm">
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
                    {spotlightPost.author_name && (
                        <Text size="xs" color={colors.textTertiary}>
                            Shared by {spotlightPost.author_name}
                        </Text>
                    )}
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
                x: nextIndex * SNAP_INTERVAL,
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
        const index = Math.round(scrollOffset / SNAP_INTERVAL);
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
                pagingEnabled={false} // Disable paging for "Netflix-style" peaking
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollBeginDrag={stopTimer}
                onScrollEndDrag={startTimer}
                scrollEventThrottle={16}
                snapToInterval={SNAP_INTERVAL}
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
                        <SanctuaryCard
                            onPress={slide.key === 'spotlight' ? () => onPressSpotlight?.(spotlightPost!.id) : undefined}
                            elevated={false} // Disable elevation to fix perceived glow layer issues
                            variant="glass"
                            style={{ minHeight: 180 }} // Dynamic minHeight
                        >
                            <Box sx={{ flex: 1, justifyContent: 'center' }}>
                                <Animated.View layout={LinearTransition}>
                                    {slide.content}
                                </Animated.View>
                            </Box>
                        </SanctuaryCard>
                    </Box>
                ))}
            </ScrollView>
        </VStack>
    );
}
