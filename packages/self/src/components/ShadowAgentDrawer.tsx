/**
 * SHADOW AGENT DRAWER
 * The Quiet Drawer - A space for reflection and gentle guidance
 * 
 * This is NOT a chatbot. It's a contemplative companion.
 * Features:
 * - Glowing orb trigger
 * - Half-screen bottom sheet
 * - Thought Seeds (random reflection questions)
 * - Fade-in text animation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, VStack, Text, Pressable, hapticLight, Theme, typography } from '@repo/ui';
import { Modal, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
    FadeIn,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ShadowAgentDrawer() {
    const { bottom: bottomInset } = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentSeed, setCurrentSeed] = useState('');
    const [contextualSuggestion, setContextualSuggestion] = useState<{
        message: string;
        emoji: string;
    } | null>(null);

    const THOUGHT_SEEDS = useMemo(() => [
        t('shadowAgent.prompts.heavy'),
        t('shadowAgent.prompts.peace'),
        t('shadowAgent.prompts.holding'),
        t('shadowAgent.prompts.release'),
        t('shadowAgent.prompts.joy'),
        t('shadowAgent.prompts.yourself'),
        t('shadowAgent.prompts.attention'),
        t('shadowAgent.prompts.truth'),
        t('shadowAgent.prompts.forgiveness'),
        t('shadowAgent.prompts.grateful'),
    ], [i18n.resolvedLanguage]);

    const CONTEXTUAL_SUGGESTIONS = useMemo(() => [
        {
            condition: 'working_long',
            message: t('shadowAgent.nudges.longWork'),
            emoji: '🌙'
        },
        {
            condition: 'late_night',
            message: t('shadowAgent.nudges.lateNight'),
            emoji: '🌜'
        },
        {
            condition: 'early_morning',
            message: t('shadowAgent.nudges.earlyStart'),
            emoji: '🌅'
        },
        {
            condition: 'midday',
            message: t('shadowAgent.nudges.lowEnergy'),
            emoji: '☕'
        },
    ], [i18n.resolvedLanguage]);

    const styles = useMemo(() => StyleSheet.create({
        orbContainer: {
            position: 'absolute',
            bottom: bottomInset + 80, // Positioned above the tab bar
            right: 24,
            zIndex: Theme.zIndex.fab,
        },
        orb: {
            borderRadius: 28,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
        },
        drawerContainer: {
            width: '100%',
        },
    }), [bottomInset]);

    // Orb breathing animation
    const orbScale = useSharedValue(1);
    const orbGlow = useSharedValue(0.3);

    useEffect(() => {
        // Breathing animation for the orb
        orbScale.value = withRepeat(
            withTiming(1.1, {
                duration: Theme.motion.breathing,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );

        orbGlow.value = withRepeat(
            withTiming(0.6, {
                duration: Theme.motion.breathing,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, []);

    const orbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: orbScale.value }],
            opacity: orbGlow.value,
        };
    });

    const handleOpenDrawer = () => {
        hapticLight();
        // Pick a random thought seed
        const randomSeed = THOUGHT_SEEDS[Math.floor(Math.random() * THOUGHT_SEEDS.length)];
        setCurrentSeed(randomSeed || '');

        // Determine contextual suggestion based on time
        const hour = new Date().getHours();
        let suggestion = null;

        if (hour >= 22 || hour < 5) {
            // Late night
            suggestion = CONTEXTUAL_SUGGESTIONS.find(s => s.condition === 'late_night');
        } else if (hour >= 5 && hour < 8) {
            // Early morning
            suggestion = CONTEXTUAL_SUGGESTIONS.find(s => s.condition === 'early_morning');
        } else if (hour >= 11 && hour < 14) {
            // Midday
            suggestion = CONTEXTUAL_SUGGESTIONS.find(s => s.condition === 'midday');
        }

        setContextualSuggestion(suggestion || null);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        hapticLight();
        setIsOpen(false);
    };

    return (
        <>
            {/* Glowing Orb Trigger */}
            <Pressable
                onPress={handleOpenDrawer}
                style={styles.orbContainer}
            >
                <Animated.View style={[styles.orb, orbStyle]}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: Theme.corners.full,
                            backgroundColor: Theme.colors.sanctuarySaffron,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...Theme.shadows.glow,
                        }}
                    >
                        <Text style={{ fontSize: 24 }}>🪷</Text>
                    </Box>
                </Animated.View>
            </Pressable>

            {/* Bottom Sheet Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={handleCloseDrawer}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={handleCloseDrawer}
                >
                    <Pressable
                        style={styles.drawerContainer}
                        onPress={(e: any) => e.stopPropagation()}
                    >
                        <Box
                            sx={{
                                backgroundColor: Theme.colors.ink,
                                borderTopLeftRadius: Theme.corners.generous,
                                borderTopRightRadius: Theme.corners.generous,
                                padding: Theme.spacing.xl,
                                minHeight: SCREEN_HEIGHT * 0.5,
                            }}
                        >
                            {/* Handle bar */}
                            <Box
                                sx={{
                                    width: 40,
                                    height: 4,
                                    backgroundColor: Theme.colors.starlightGray,
                                    borderRadius: 2,
                                    alignSelf: 'center',
                                    marginBottom: Theme.spacing.md,
                                    opacity: 0.3,
                                }}
                            />

                            {/* Close Button */}
                            <Pressable
                                onPress={handleCloseDrawer}
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    zIndex: 10,
                                    padding: 8,
                                }}
                            >
                                <Box sx={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: 20,
                                    padding: 4
                                }}>
                                    <X color={Theme.colors.mistGray} size={20} />
                                </Box>
                            </Pressable>

                            <VStack space="xl">
                                {/* Title */}
                                <Animated.View entering={FadeIn.duration(Theme.motion.gentle)}>
                                    <Text
                                        color={Theme.colors.sacredWhite}
                                        size="2xl"
                                        sx={{ fontWeight: Theme.typography.fontWeight.semibold }}
                                    >
                                        {t('shadowAgent.title')}
                                    </Text>
                                    <Text
                                        color={Theme.colors.mistGray}
                                        size="sm"
                                        mt="$2"
                                    >
                                        {t('shadowAgent.subtitle')}
                                    </Text>
                                </Animated.View>

                                {/* Contextual Suggestion */}
                                {contextualSuggestion && (
                                    <Animated.View
                                        entering={FadeIn.duration(Theme.motion.gentle).delay(Theme.motion.quick)}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: Theme.colors.ink,
                                                padding: Theme.spacing.lg,
                                                borderRadius: Theme.corners.comfortable,
                                                borderWidth: 1,
                                                borderColor: Theme.colors.twilightBlue,
                                            }}
                                        >
                                            <Text
                                                color={Theme.colors.shroud}
                                                size="xs"
                                                sx={{
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 1,
                                                    marginBottom: Theme.spacing.sm,
                                                }}
                                            >
                                                Gentle Reminder
                                            </Text>
                                            <Text
                                                color={Theme.colors.starlightGray}
                                                size="lg"
                                                sx={{
                                                    fontWeight: typography.fontWeight.medium,
                                                    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
                                                }}
                                            >
                                                {contextualSuggestion.emoji} {contextualSuggestion.message}
                                            </Text>
                                        </Box>
                                    </Animated.View>
                                )}

                                {/* Thought Seed */}
                                <Animated.View
                                    entering={FadeIn.duration(Theme.motion.gentle).delay(Theme.motion.standard)}
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: Theme.colors.ink,
                                            padding: Theme.spacing.lg,
                                            borderRadius: Theme.corners.comfortable,
                                            borderLeftWidth: 3,
                                            borderLeftColor: Theme.colors.sanctuarySaffron,
                                        }}
                                    >
                                        <Text
                                            color={Theme.colors.shroud}
                                            size="xs"
                                            sx={{
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                                marginBottom: Theme.spacing.sm,
                                            }}
                                        >
                                            Thought Seed
                                        </Text>
                                        <Text
                                            color={Theme.colors.sacredWhite}
                                            size="xl"
                                            sx={{
                                                fontWeight: typography.fontWeight.medium,
                                                lineHeight: typography.lineHeight.relaxed * typography.fontSize.xl,
                                            }}
                                        >
                                            {currentSeed}
                                        </Text>
                                    </Box>
                                </Animated.View>

                                {/* Contemplation Space */}
                                <Animated.View
                                    entering={FadeIn.duration(Theme.motion.gentle).delay(Theme.motion.standard * 2)}
                                >
                                    <VStack space="md">
                                        <Text
                                            color={Theme.colors.mistGray}
                                            size="sm"
                                        >
                                            Take a moment to sit with this question.
                                        </Text>
                                        <Text
                                            color={Theme.colors.mistGray}
                                            size="sm"
                                        >
                                            There's no need to answer right away.
                                        </Text>
                                        <Text
                                            color={Theme.colors.mistGray}
                                            size="sm"
                                            sx={{ fontStyle: 'italic' }}
                                        >
                                            Sometimes questions are more valuable than answers.
                                        </Text>
                                    </VStack>
                                </Animated.View>

                                {/* Note about future feature */}
                                <Animated.View
                                    entering={FadeIn.duration(Theme.motion.gentle).delay(Theme.motion.standard * 3)}
                                >
                                    <Box
                                        sx={{
                                            marginTop: Theme.spacing.xl,
                                            padding: Theme.spacing.md,
                                            borderRadius: Theme.corners.comfortable,
                                            backgroundColor: Theme.colors.ink,
                                            opacity: 0.5,
                                        }}
                                    >
                                        <Text
                                            color={Theme.colors.shroud}
                                            size="xs"
                                            textAlign="center"
                                        >
                                            💫 This space will grow with you
                                        </Text>
                                    </Box>
                                </Animated.View>
                            </VStack>
                        </Box>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}
