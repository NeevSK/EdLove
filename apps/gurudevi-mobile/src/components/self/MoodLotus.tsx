/**
 * MOOD LOTUS COMPONENT
 * Daily mood check-in with lotus visual metaphor
 * 
 * Visual States:
 * 1 = Closed Bud (Dark) - Heavy/Struggling
 * 2 = Slight Opening (Dim) - Challenging
 * 3 = Half Bloom (Medium) - Neutral/Okay
 * 4 = Nearly Full (Bright) - Good
 * 5 = Full Bloom (Glowing) - Flourishing
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Button,
    ButtonText,
    Pressable,
} from '@repo/ui';
import { StyleSheet, Image, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Wind } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import * as Haptics from 'expo-haptics';
import BreathGuide from './BreathGuide';
import { useTranslation } from 'react-i18next';
import { supabase, useStore, useSafeMutation } from '@repo/core';
import { useThemedColors, SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useMood } from '@repo/self';

interface MoodLotusProps {
    userId?: string;
    onMoodChange?: (mood: number) => void;
}

const LOTUS_BUD = require('../../../assets/images/lotus_bud.png');
const LOTUS_BLOOM = require('../../../assets/images/lotus_bloom.png');

export default function MoodLotus({ userId, onMoodChange }: MoodLotusProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();

    const MOOD_STATES = useMemo(() => [
        { value: 1, label: t('self.moodHeavy'), color: Theme.colors.dimGray, glow: 0, image: LOTUS_BUD, scale: 0.8 },
        { value: 2, label: t('self.moodChallenging'), color: Theme.colors.slateGray, glow: 0.1, image: LOTUS_BUD, scale: 0.9 },
        { value: 3, label: t('self.moodOkay'), color: Theme.colors.stoneGray, glow: 0.2, image: LOTUS_BLOOM, scale: 0.8 },
        { value: 4, label: t('self.moodGood'), color: colors.success, glow: 0.4, image: LOTUS_BLOOM, scale: 0.9 },
        { value: 5, label: t('self.moodFlourishing'), color: colors.warning, glow: 0.6, image: LOTUS_BLOOM, scale: 1.0 },
    ], [t, colors]);

    const [moodValue, setMoodValue] = useState(3);
    const [showBreathGuide, setShowBreathGuide] = useState(false);

    // Resilient Data
    const { moodHistory, refreshData, isLoading } = useMood(userId);
    const showToast = useStore(state => state.showToast);

    // Get last saved time from cache/history
    const lastSaved = useMemo(() => {
        if (moodHistory.length > 0) {
            return new Date(moodHistory[0].created_at);
        }
        return null;
    }, [moodHistory]);

    // Animation values
    const scale = useSharedValue(0.8);
    const glowOpacity = useSharedValue(0.2);

    const styles = useMemo(() => StyleSheet.create({
        lotusImage: {
            width: 200,
            height: 200,
            zIndex: 10,
        },
        glow: {
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            zIndex: 0,
            top: 10,
        },
    }), []);

    const currentMood = MOOD_STATES[Math.floor(moodValue) - 1];

    // Breathing animation for lotus
    useEffect(() => {
        glowOpacity.value = withRepeat(
            withTiming(currentMood.glow + 0.15, {
                duration: Theme.motion.breathing,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        // Update scale based on mood
        scale.value = withSpring(currentMood.scale, {
            damping: 15,
            stiffness: 90,
        });
    }, [moodValue]);

    // Animated lotus style
    const lotusStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const triggerHaptic = () => {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
    };

    const handleMoodChange = (value: number) => {
        if (value !== moodValue) {
            runOnJS(triggerHaptic)();
            setMoodValue(value);
            onMoodChange?.(value);

            // Pulse animation on change
            scale.value = withSpring(currentMood.scale * 1.05, {
                damping: 10,
                stiffness: 200,
            }, () => {
                scale.value = withSpring(currentMood.scale);
            });
        }
    };

    const handleSlidingComplete = async (value: number) => {
        // Auto-save to database when user releases slider
        if (userId) {
            await saveMoodLog(value);
        }
    };

    const { mutate, isLoading: isSaving } = useSafeMutation(
        async (mood: number) => {
            const { error } = await supabase
                .from('mood_logs')
                .insert([
                    {
                        user_id: userId,
                        mood_score: mood,
                        created_at: new Date().toISOString(),
                    },
                ]);
            if (error) throw error;
        },
        {
            onSuccess: () => {
                refreshData(); // Refresh local cache
            },
            retryCount: 3
        }
    );

    const saveMoodLog = async (mood: number) => {
        if (!userId) return;
        await mutate(mood);
    };

    if (isLoading) {
        return (
            <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                <SkeletonCard height={280} />
                <SkeletonCard height={80} />
                <SkeletonCard height={60} />
            </VStack>
        );
    }

    if (!userId) {
        return (
            <PositiveInvitation
                type="guest"
                onAction={() => { }} // TODO: Navigate to Auth
            />
        );
    }

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {showBreathGuide ? (
                <VStack space="md">
                    <Button
                        size="sm"
                        variant="link"
                        onPress={() => setShowBreathGuide(false)}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        <ButtonText color={colors.textSecondary}>{t('self.backToMood')}</ButtonText>
                    </Button>
                    <BreathGuide onComplete={() => setShowBreathGuide(false)} />
                </VStack>
            ) : (
                <>
                    {/* Header */}
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack space="xs" sx={{ flex: 1 }}>
                            <Heading color={colors.text} size="lg">
                                {t('self.moodLotus')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('self.moodLotusDesc')}
                            </Text>
                        </VStack>
                        <Button
                            size="sm"
                            variant="link"
                            onPress={() => setShowBreathGuide(true)}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                paddingHorizontal: Theme.spacing.md,
                                paddingVertical: Theme.spacing.sm,
                            }}
                        >
                            <Wind color={colors.action} size={16} />
                        </Button>
                    </HStack>

                    {/* Lotus Visualization */}
                    <Box
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: Theme.spacing.xl,
                            height: 280, // Fixed height to prevent jump
                        }}
                    >
                        <Animated.View style={lotusStyle}>
                            <Image
                                source={currentMood.image}
                                style={styles.lotusImage}
                                resizeMode="contain"
                            />
                            {/* Glow effect behind */}
                            <Animated.View
                                style={[
                                    styles.glow,
                                    {
                                        opacity: glowOpacity,
                                        backgroundColor: currentMood.color,
                                        shadowColor: currentMood.color,
                                    }
                                ]}
                            />
                        </Animated.View>

                        <Animated.Text
                            style={{
                                marginTop: Theme.spacing.md,
                                fontSize: typography.fontSize.xl,
                                fontWeight: '600',
                                color: currentMood.color,
                                textAlign: 'center',
                                textShadowColor: currentMood.color,
                                textShadowOffset: { width: 0, height: 0 },
                                textShadowRadius: 10,
                            }}
                        >
                            {currentMood.label}
                        </Animated.Text>
                    </Box>

                    {/* Custom Dotted Likert Slider */}
                    <Box sx={{ paddingHorizontal: Theme.spacing.md, marginTop: Theme.spacing.lg }}>
                        <VStack space="md">
                            <Box sx={{ height: 40, justifyContent: 'center' }}>
                                {/* The Track */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 16,
                                        right: 16,
                                        height: 2,
                                        backgroundColor: colors.border,
                                        borderRadius: 1,
                                    }}
                                />

                                {/* Interactive Dots */}
                                <HStack justifyContent="space-between" alignItems="center">
                                    {MOOD_STATES.map((state) => {
                                        const isActive = Math.round(moodValue) === state.value;
                                        return (
                                            <Pressable
                                                key={state.value}
                                                onPress={() => {
                                                    handleMoodChange(state.value);
                                                    handleSlidingComplete(state.value);
                                                }}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Animated.View
                                                    style={[
                                                        {
                                                            width: isActive ? 16 : 8,
                                                            height: isActive ? 16 : 8,
                                                            borderRadius: isActive ? 8 : 4,
                                                            backgroundColor: isActive ? state.color : colors.textTertiary,
                                                            borderWidth: isActive ? 0 : 1,
                                                            borderColor: colors.border,
                                                        },
                                                        isActive && {
                                                            shadowColor: state.color,
                                                            shadowOffset: { width: 0, height: 0 },
                                                            shadowOpacity: 0.8,
                                                            shadowRadius: 10,
                                                            elevation: 5,
                                                        }
                                                    ]}
                                                />
                                            </Pressable>
                                        );
                                    })}
                                </HStack>
                            </Box>

                            {/* Mood labels with soft text */}
                            <HStack
                                justifyContent="space-between"
                                sx={{ paddingHorizontal: 4 }}
                            >
                                <Text color={colors.textTertiary} size="xs" italic>
                                    {t('self.moodHeavy')}
                                </Text>
                                <Text color={colors.textTertiary} size="xs" italic>
                                    {t('self.moodFlourishing')}
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>

                    {/* Privacy note - Refined for Zen aesthetic */}
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            padding: Theme.spacing.md,
                            borderRadius: Theme.corners.generous,
                            marginTop: Theme.spacing.md,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderStyle: 'dashed' // Subtle boundary
                        }}
                    >
                        <Text color={colors.textSecondary} size="xs" textAlign="center">
                            {t('self.privacyNote') || '🔒 Your mood data is private and only visible to you'}
                        </Text>
                        {lastSaved && (
                            <Text color={colors.textTertiary} size="xs" textAlign="center" mt="$1">
                                {t('self.savedAt', { time: lastSaved.toLocaleTimeString() })}
                            </Text>
                        )}
                    </Box>
                </>
            )}
        </VStack>
    );
}
