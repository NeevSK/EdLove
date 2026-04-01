/**
 * BREATH GUIDE COMPONENT
 * Petal-guided breathing companion
 * 1-minute breathing exercise with visual and haptic rhythm
 * EROI 60:1 (1 min → calm for hour)
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Text,
    Button,
    ButtonText,
    Pressable,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Wind } from 'lucide-react-native';
import { Theme, typography } from '@repo/ui';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useThemedColors } from '@repo/ui';

interface BreathGuideProps {
    onComplete?: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';
const TOTAL_CYCLES = 4; // ~1 minute total

export default function BreathGuide({ onComplete }: BreathGuideProps) {
    const { t } = useTranslation();
    const [isActive, setIsActive] = useState(false);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [phaseIndex, setPhaseIndex] = useState(0);

    const BREATH_CYCLE = [
        { phase: 'inhale' as BreathPhase, duration: 4000, instruction: t('self.inhale') },
        { phase: 'hold' as BreathPhase, duration: 2000, instruction: t('self.hold') },
        { phase: 'exhale' as BreathPhase, duration: 6000, instruction: t('self.exhale') },
        { phase: 'rest' as BreathPhase, duration: 2000, instruction: t('self.rest') },
    ];

    // Animation values
    const petalScale = useSharedValue(0.8);
    const petalOpacity = useSharedValue(0.5);
    const petalRotation = useSharedValue(0);

    const animatePetal = (phase: BreathPhase, duration: number) => {
        switch (phase) {
            case 'inhale':
                petalScale.value = withTiming(1.4, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                });
                petalOpacity.value = withTiming(1, {
                    duration,
                    easing: Easing.linear,
                });
                break;

            case 'hold':
                petalScale.value = withTiming(1.4, {
                    duration,
                    easing: Easing.linear,
                });
                break;

            case 'exhale':
                petalScale.value = withTiming(0.8, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                });
                petalOpacity.value = withTiming(0.5, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                });
                petalRotation.value = withTiming(petalRotation.value + 45, {
                    duration,
                    easing: Easing.linear,
                });
                break;

            case 'rest':
                petalScale.value = withTiming(0.9, {
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                });
                break;
        }
    };

    const completeSession = () => {
        setIsActive(false);

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onComplete?.();
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isActive && currentCycle < TOTAL_CYCLES) {
            const currentStep = BREATH_CYCLE[phaseIndex];
            if (currentStep) {
                triggerHaptic(currentStep.phase);
                animatePetal(currentStep.phase, currentStep.duration);

                timeout = setTimeout(() => {
                    const nextIndex = (phaseIndex + 1) % BREATH_CYCLE.length;
                    if (nextIndex === 0) {
                        setCurrentCycle(c => c + 1);
                    }
                    setPhaseIndex(nextIndex);
                }, currentStep.duration);
            }
        } else if (currentCycle >= TOTAL_CYCLES) {
            completeSession();
        }
        return () => clearTimeout(timeout);
    }, [isActive, currentCycle, phaseIndex, BREATH_CYCLE, TOTAL_CYCLES, animatePetal, completeSession]);

    const triggerHaptic = (phase: BreathPhase) => {
        if (Platform.OS === 'web') return;

        switch (phase) {
            case 'inhale':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'hold':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'exhale':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'rest':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
        }
    };

    const startSession = () => {
        setIsActive(true);
        setCurrentCycle(0);
        setPhaseIndex(0);

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const stopSession = () => {
        setIsActive(false);
        setCurrentCycle(0);
        setPhaseIndex(0);
        petalScale.value = withTiming(0.8);
        petalOpacity.value = withTiming(0.5);
    };

    const petalStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: petalScale.value },
            { rotate: `${petalRotation.value}deg` },
        ],
        opacity: petalOpacity.value,
    }));

    const colors = useThemedColors();
    const currentInstruction = BREATH_CYCLE[phaseIndex]?.instruction || 'Begin...';

    return (
        <VStack space="lg" sx={{ alignItems: 'center', padding: Theme.spacing.lg }}>
            {/* Breath visualization - Lotus Petal */}
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 250,
                }}
            >
                <Animated.View style={petalStyle}>
                    <Box
                        sx={{
                            width: 150,
                            height: 150,
                            borderRadius: 75,
                            backgroundColor: colors.action, // Use theme-aware action color
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: colors.action,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 20,
                            elevation: 10,
                        }}
                    >
                        <Text style={{ fontSize: 48 }}>🌸</Text>
                    </Box>
                </Animated.View>
            </Box>

            {/* Instruction text */}
            {isActive && (
                <VStack space="sm" sx={{ alignItems: 'center' }}>
                    <Text
                        color={colors.text}
                        size="2xl"
                        sx={{ fontWeight: typography.fontWeight.semibold }}
                    >
                        {currentInstruction}
                    </Text>
                    <Text
                        color={colors.textSecondary}
                        size="sm"
                    >
                        {t('self.cycleCount', { current: currentCycle + 1, total: TOTAL_CYCLES })}
                    </Text>
                </VStack>
            )}

            {/* Controls */}
            <Box sx={{ marginTop: Theme.spacing.lg }}>
                {!isActive ? (
                    <Button
                        size="lg"
                        onPress={startSession}
                        sx={{
                            borderRadius: Theme.corners.full,
                            backgroundColor: colors.action,
                            paddingHorizontal: Theme.spacing.xl,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Wind
                            color={Theme.colors.sacredWhite}
                            size={20}
                            style={{ marginRight: Theme.spacing.sm }}
                        />
                        <ButtonText color={Theme.colors.sacredWhite}>
                            {t('self.startBreathing')}
                        </ButtonText>
                    </Button>
                ) : (
                    <Pressable onPress={stopSession}>
                        <Text
                            color={colors.textTertiary}
                            size="sm"
                            sx={{ textDecorationLine: 'underline' }}
                        >
                            {t('self.stop')}
                        </Text>
                    </Pressable>
                )}
            </Box>

            {/* Info */}
            {!isActive && (
                <Box
                    sx={{
                        marginTop: Theme.spacing.md,
                        padding: Theme.spacing.md,
                        backgroundColor: colors.secondary,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <Text
                        color={colors.textSecondary}
                        size="xs"
                        textAlign="center"
                        sx={{ fontStyle: 'italic' }}
                    >
                        {t('self.breathHero')}
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
