/**
 * FIRE JOURNAL
 * "Burn" negative thoughts - A cathartic release mechanism
 * 
 * Features:
 * - Large text area for writing
 * - Voice input option (UI only)
 * - "Burn" button with smoke animation
 * - Distortion and fade-out effect using Reanimated
 * - Saves to fire_journal table with is_burned = true
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
} from '@repo/ui';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    runOnJS,
    FadeIn,
} from 'react-native-reanimated';
import { Mic, Flame } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import { supabase, useSafeMutation } from '@repo/core';
import { hapticLight, hapticMedium, SkeletonCard, SkeletonLoader, PositiveInvitation } from '@repo/ui';
import { useFireJournal } from '@repo/self';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

interface FireJournalProps {
    userId?: string;
    onBurned?: () => void;
}

export default function FireJournal({ userId, onBurned }: FireJournalProps) {
    const navigation = useNavigation<any>();
    const [content, setContent] = useState('');
    const [isBurning, setIsBurning] = useState(false);
    // Use useFireJournal to keep cache in sync (even if not explicitly showing history)
    const { refreshData, isLoading } = useFireJournal(userId);
    const [showSuccess, setShowSuccess] = useState(false);
    const { t } = useTranslation();

    // Refs for timeout cleanup
    const burnTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const successTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Animation values
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);

    // Ember particles animation values
    const ember1Y = useSharedValue(0);
    const ember2Y = useSharedValue(0);
    const ember3Y = useSharedValue(0);
    const ember1Opacity = useSharedValue(0);
    const ember2Opacity = useSharedValue(0);
    const ember3Opacity = useSharedValue(0);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (burnTimeoutRef.current) {
                clearTimeout(burnTimeoutRef.current);
            }
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    const containerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { scale: scale.value },
                { translateY: translateY.value },
                { rotate: `${rotation.value}deg` },
            ] as any,
        };
    });

    // Ember particle styles
    const ember1Style = useAnimatedStyle(() => ({
        opacity: ember1Opacity.value,
        transform: [{ translateY: ember1Y.value }],
    }));

    const ember2Style = useAnimatedStyle(() => ({
        opacity: ember2Opacity.value,
        transform: [{ translateY: ember2Y.value }],
    }));

    const ember3Style = useAnimatedStyle(() => ({
        opacity: ember3Opacity.value,
        transform: [{ translateY: ember3Y.value }],
    }));

    const { mutate, isLoading: isMutating } = useSafeMutation(
        async (text: string) => {
            const { error } = await supabase
                .from('fire_journal')
                .insert([
                    {
                        content_preview: text.substring(0, 100), // Store preview only
                        is_burned: true,
                        user_id: userId,
                        created_at: new Date().toISOString(),
                    },
                ]);
            if (error) throw error;
        },
        {
            onSuccess: () => {
                refreshData();
            },
            retryCount: 3
        }
    );

    const handleBurn = async () => {
        if (!content.trim()) return;
        if (!userId) return;

        hapticMedium();
        setIsBurning(true); // Trigger animation immediately

        // Start burn animation (Visuals first)
        performBurnAnimation();

        // Save to database (Background/Robust)
        // We pass 'content' to mutate, capturing it before reset
        await mutate(content);
    };

    const performBurnAnimation = () => {
        // Distortion and smoke effect
        opacity.value = withSequence(
            // Brief flash
            withTiming(1.2, { duration: 100 }),
            // Start fading and distorting
            withTiming(0.8, {
                duration: 300,
                easing: Easing.inOut(Easing.ease),
            }),
            // Fade to smoke
            withTiming(0, {
                duration: 700,
                easing: Easing.in(Easing.ease),
            })
        );

        scale.value = withSequence(
            // Slight grow
            withTiming(1.05, { duration: 100 }),
            // Distort
            withTiming(0.95, { duration: 300 }),
            // Shrink to point
            withTiming(0.7, { duration: 700 })
        );

        translateY.value = withSequence(
            // Stay in place briefly
            withTiming(0, { duration: 400 }),
            // Rise like smoke
            withTiming(-100, {
                duration: 700,
                easing: Easing.out(Easing.ease),
            })
        );

        rotation.value = withSequence(
            withTiming(0, { duration: 400 }),
            withTiming(5, { duration: 350 }),
            withTiming(-5, { duration: 350 })
        );

        // Animate embers floating upward
        // Ember 1 - left side
        ember1Opacity.value = withSequence(
            withTiming(0.8, { duration: 100 }),
            withTiming(0, { duration: 1200 })
        );
        ember1Y.value = withTiming(-150, {
            duration: 1300,
            easing: Easing.out(Easing.ease),
        });

        // Ember 2 - center
        ember2Opacity.value = withSequence(
            withTiming(0, { duration: 200 }), // Delay start
            withTiming(0.9, { duration: 100 }),
            withTiming(0, { duration: 1100 })
        );
        ember2Y.value = withTiming(-180, {
            duration: 1400,
            easing: Easing.out(Easing.ease),
        });

        // Ember 3 - right side
        ember3Opacity.value = withSequence(
            withTiming(0, { duration: 300 }), // Delay start
            withTiming(0.7, { duration: 100 }),
            withTiming(0, { duration: 1000 })
        );
        ember3Y.value = withTiming(-160, {
            duration: 1400,
            easing: Easing.out(Easing.ease),
        });

        // Reset after animation completes
        burnTimeoutRef.current = setTimeout(() => {
            resetAfterBurn();
        }, 1500);
    };

    const resetAfterBurn = () => {
        setContent('');
        setIsBurning(false);
        setShowSuccess(true);

        // Reset animation values
        opacity.value = withSpring(1);
        scale.value = withSpring(1);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);

        // Reset ember positions
        ember1Y.value = 0;
        ember2Y.value = 0;
        ember3Y.value = 0;
        ember1Opacity.value = 0;
        ember2Opacity.value = 0;
        ember3Opacity.value = 0;

        // Hide success message after delay
        successTimeoutRef.current = setTimeout(() => {
            setShowSuccess(false);
            onBurned?.();
        }, 2000);
    };

    if (isLoading && userId) {
        return (
            <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                <SkeletonCard height={40} />
                <SkeletonCard height={200} />
                <HStack space="md" justifyContent="flex-end">
                    <SkeletonLoader width={48} height={48} borderRadius={24} />
                    <SkeletonLoader width={100} height={48} borderRadius={24} />
                </HStack>
            </VStack>
        );
    }

    if (!userId) {
        return (
            <PositiveInvitation
                type="guest"
                onAction={() => navigation.navigate('Auth' as never)}
            />
        );
    }

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {/* Header */}
            <VStack space="xs">
                <Heading color={Theme.colors.sacredWhite} size="lg">
                    {t('fireJournal.title')}
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    {t('fireJournal.subtitle')}
                </Text>
            </VStack>

            {/* Success Message */}
            {showSuccess && (
                <Animated.View entering={FadeIn.duration(Theme.motion.quick)}>
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.sageGreen,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.comfortable,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            color={Theme.colors.obsidian}
                            size="md"
                            sx={{ fontWeight: Theme.typography.fontWeight.semibold }}
                        >
                            {t('fireJournal.released')}
                        </Text>
                    </Box>
                </Animated.View>
            )}

            {/* Text Input Area with Ember Particles */}
            <Box sx={{ position: 'relative' }}>
                {/* Floating Embers */}
                {isBurning && (
                    <>
                        <Animated.View
                            style={[
                                ember1Style,
                                {
                                    position: 'absolute',
                                    left: '20%',
                                    top: 100,
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: Theme.colors.emberRed,
                                    zIndex: 10,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                ember2Style,
                                {
                                    position: 'absolute',
                                    left: '50%',
                                    top: 80,
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                    zIndex: 10,
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                ember3Style,
                                {
                                    position: 'absolute',
                                    left: '70%',
                                    top: 110,
                                    width: 7,
                                    height: 7,
                                    borderRadius: 3.5,
                                    backgroundColor: Theme.colors.amberGlow,
                                    zIndex: 10,
                                },
                            ]}
                        />
                    </>
                )}

                <Animated.View style={containerStyle}>
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.ink,
                            borderRadius: Theme.corners.comfortable,
                            padding: Theme.spacing.md,
                            minHeight: 200,
                        }}
                    >
                        <Input
                            variant="outline"
                            size="md"
                            sx={{
                                borderWidth: 0,
                                flex: 1,
                            }}
                            isDisabled={isBurning}
                        >
                            <InputField
                                placeholder={t('fireJournal.placeholder')}
                                multiline
                                value={content}
                                onChangeText={setContent}
                                color={Theme.colors.sacredWhite}
                                placeholderTextColor={Theme.colors.dimGray}
                                sx={{
                                    textAlignVertical: 'top',
                                    fontSize: typography.fontSize.lg,
                                    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
                                    minHeight: 160,
                                }}
                            />
                        </Input>
                    </Box>
                </Animated.View>
            </Box>

            {/* Action Buttons */}
            <HStack space="md" justifyContent="flex-end">
                {/* Voice Input (UI only for now) */}
                <Button
                    size="md"
                    variant="link"
                    action="primary"
                    onPress={hapticLight}
                    isDisabled={isBurning}
                    sx={{
                        borderRadius: Theme.corners.full,
                        width: 48,
                        height: 48,
                        backgroundColor: Theme.colors.ink,
                    }}
                >
                    <Mic color={Theme.colors.sanctuarySaffron} size={20} />
                </Button>

                {/* Burn Button */}
                <Button
                    size="md"
                    action="primary"
                    onPress={handleBurn}
                    isDisabled={!content.trim() || isBurning}
                    sx={{
                        borderRadius: Theme.corners.full,
                        backgroundColor: isBurning
                            ? Theme.colors.emberRed
                            : Theme.colors.sanctuarySaffron,
                        paddingHorizontal: Theme.spacing.lg,
                        paddingVertical: Theme.spacing.md,
                    }}
                >
                    <Flame
                        color={Theme.colors.sacredWhite}
                        size={20}
                        style={{ marginRight: Theme.spacing.sm }}
                    />
                    <ButtonText color={Theme.colors.sacredWhite}>
                        {isBurning ? t('fireJournal.burning') : t('fireJournal.burn')}
                    </ButtonText>
                </Button>
            </HStack>

            {/* Privacy & Guidance Note */}
            <VStack space="sm">
                <Box
                    sx={{
                        backgroundColor: Theme.colors.ink,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <Text color={Theme.colors.mistGray} size="xs" textAlign="center">
                        {t('fireJournal.privacy')}
                    </Text>
                </Box>

                <Box
                    sx={{
                        padding: Theme.spacing.sm,
                    }}
                >
                    <Text
                        color={Theme.colors.dimGray}
                        size="xs"
                        textAlign="center"
                        sx={{ fontStyle: 'italic' }}
                    >
                        {t('fireJournal.guidance')}
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
}
