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
} from '@gluestack-ui/themed';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Wind } from 'lucide-react-native';
import { Theme, typography } from '../../constants/Theme';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface BreathGuideProps {
    onComplete?: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATH_CYCLE = [
    { phase: 'inhale' as BreathPhase, duration: 4000, instruction: 'Breathe in...' },
    { phase: 'hold' as BreathPhase, duration: 2000, instruction: 'Hold...' },
    { phase: 'exhale' as BreathPhase, duration: 6000, instruction: 'Breathe out...' },
    { phase: 'rest' as BreathPhase, duration: 2000, instruction: 'Rest...' },
];

const TOTAL_CYCLES = 4; // ~1 minute total

export default function BreathGuide({ onComplete }: BreathGuideProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
    const [currentCycle, setCurrentCycle] = useState(0);
    const [phaseIndex, setPhaseIndex] = useState(0);

    // Animation values
    const petalScale = useSharedValue(0.8);
    const petalOpacity = useSharedValue(0.5);
    const petalRotation = useSharedValue(0);

    useEffect(() => {
        if (isActive && currentCycle < TOTAL_CYCLES) {
            startBreathCycle();
        } else if (currentCycle >= TOTAL_CYCLES) {
            completeSession();
        }
    }, [isActive, currentCycle, phaseIndex]);

    const startBreathCycle = () => {
        const currentStep = BREATH_CYCLE[phaseIndex];
        setCurrentPhase(currentStep.phase);

        // Trigger haptic feedback at phase start
        triggerHaptic(currentStep.phase);

        // Animate petal based on phase
        animatePetal(currentStep.phase, currentStep.duration);

        // Move to next phase
        setTimeout(() => {
            const nextIndex = (phaseIndex + 1) % BREATH_CYCLE.length;
            if (nextIndex === 0) {
                // Completed one full cycle
                setCurrentCycle(c => c + 1);
            }
            setPhaseIndex(nextIndex);
        }, currentStep.duration);
    };

    const animatePetal = (phase: BreathPhase, duration: number) => {
        switch (phase) {
            case 'inhale':
                // Expand
                petalScale.value = withTiming(1.4, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                });
                petalOpacity.value = withTiming(1, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                });
                petalRotation.value = withTiming(petalRotation.value + 45, {
                    duration,
                    easing: Easing.linear,
                });
                break;

            case 'hold':
                // Stay expanded
                petalScale.value = withTiming(1.4, {
                    duration,
                    easing: Easing.linear,
                });
                break;

            case 'exhale':
                // Contract
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
                // Gentle pulse
                petalScale.value = withTiming(0.9, {
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                });
                break;
        }
    };

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

    const completeSession = () => {
        setIsActive(false);
        
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onComplete?.();
    };

    const petalStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: petalScale.value },
            { rotate: `${petalRotation.value}deg` },
        ],
        opacity: petalOpacity.value,
    }));

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
                            backgroundColor: Theme.colors.lotusDeepPink,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: Theme.colors.lotusDeepPink,
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
                        color={Theme.colors.sacredWhite}
                        size="2xl"
                        sx={{ fontWeight: typography.fontWeight.semibold }}
                    >
                        {currentInstruction}
                    </Text>
                    <Text
                        color={Theme.colors.mistGray}
                        size="sm"
                    >
                        Cycle {currentCycle + 1} of {TOTAL_CYCLES}
                    </Text>
                </VStack>
            )}

            {/* Controls */}
            <Box sx={{ marginTop: Theme.spacing.lg }}>
                {!isActive ? (
                    <Button
                        size="lg"
                        action="primary"
                        onPress={startSession}
                        sx={{
                            borderRadius: Theme.corners.full,
                            backgroundColor: Theme.colors.lotusDeepPink,
                            paddingHorizontal: Theme.spacing.xl,
                        }}
                    >
                        <Wind
                            color={Theme.colors.white}
                            size={20}
                            style={{ marginRight: Theme.spacing.sm }}
                        />
                        <ButtonText color={Theme.colors.white}>
                            Start Breathing
                        </ButtonText>
                    </Button>
                ) : (
                    <Pressable onPress={stopSession}>
                        <Text
                            color={Theme.colors.dimGray}
                            size="sm"
                            sx={{ textDecorationLine: 'underline' }}
                        >
                            Stop
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
                        backgroundColor: Theme.colors.deepIndigo,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <Text
                        color={Theme.colors.mistGray}
                        size="xs"
                        textAlign="center"
                        sx={{ fontStyle: 'italic' }}
                    >
                        1 minute of breath for an hour of calm 🌸
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
