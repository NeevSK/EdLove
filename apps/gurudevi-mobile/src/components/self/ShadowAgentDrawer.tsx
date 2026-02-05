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
import {
    Box,
    VStack,
    Text,
    Pressable,
} from '@gluestack-ui/themed';
import { Modal, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
    FadeIn,
} from 'react-native-reanimated';
import { Theme, typography } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';

const THOUGHT_SEEDS = [
    "What is heavy today?",
    "What brought you peace this morning?",
    "What are you holding onto?",
    "What would you like to release?",
    "What small joy found you today?",
    "Where did you feel most yourself?",
    "What needs your gentle attention?",
    "What truth are you avoiding?",
    "What deserves your forgiveness?",
    "What are you grateful for in this moment?",
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ShadowAgentDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSeed, setCurrentSeed] = useState('');

    const styles = useMemo(() => StyleSheet.create({
        orbContainer: {
            position: 'absolute',
            bottom: 24,
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
    }), []);

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
        setCurrentSeed(randomSeed);
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
                        <Text style={{ fontSize: 24 }}>🌙</Text>
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
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Box
                            sx={{
                                backgroundColor: Theme.colors.voidIndigo,
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
                                    backgroundColor: Theme.colors.pearlGray,
                                    borderRadius: 2,
                                    alignSelf: 'center',
                                    marginBottom: Theme.spacing.lg,
                                    opacity: 0.3,
                                }}
                            />

                            <VStack space="xl">
                                {/* Title */}
                                <Animated.View entering={FadeIn.duration(Theme.motion.gentle)}>
                                    <Text
                                        color={Theme.colors.sacredWhite}
                                        size="2xl"
                                        sx={{ fontWeight: Theme.typography.fontWeight.semibold }}
                                    >
                                        Shadow Agent
                                    </Text>
                                    <Text
                                        color={Theme.colors.mistGray}
                                        size="sm"
                                        mt="$2"
                                    >
                                        A quiet companion for reflection
                                    </Text>
                                </Animated.View>

                                {/* Thought Seed */}
                                <Animated.View
                                    entering={FadeIn.duration(Theme.motion.gentle).delay(Theme.motion.standard)}
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: Theme.colors.deepIndigo,
                                            padding: Theme.spacing.lg,
                                            borderRadius: Theme.corners.comfortable,
                                            borderLeftWidth: 3,
                                            borderLeftColor: Theme.colors.sanctuarySaffron,
                                        }}
                                    >
                                        <Text
                                            color={Theme.colors.dimGray}
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
                                            backgroundColor: Theme.colors.deepIndigo,
                                            opacity: 0.5,
                                        }}
                                    >
                                        <Text
                                            color={Theme.colors.dimGray}
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


