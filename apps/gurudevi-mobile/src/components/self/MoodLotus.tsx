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
} from '@gluestack-ui/themed';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight } from '../../utils/haptics';

interface MoodLotusProps {
    userId?: string;
    onMoodChange?: (mood: number) => void;
}

const MOOD_STATES = [
    { value: 1, label: 'Heavy', color: Theme.colors.mudBrown, glow: 0 },
    { value: 2, label: 'Challenging', color: Theme.colors.earthConnection, glow: 0.1 },
    { value: 3, label: 'Okay', color: Theme.colors.tealWater, glow: 0.2 },
    { value: 4, label: 'Good', color: Theme.colors.sageGreen, glow: 0.3 },
    { value: 5, label: 'Flourishing', color: Theme.colors.sanctuarySaffron, glow: 0.5 },
];

export default function MoodLotus({ userId, onMoodChange }: MoodLotusProps) {
    const [moodValue, setMoodValue] = useState(3);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Animation values
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.2);

    const currentMood = MOOD_STATES[moodValue - 1];

    // Breathing animation for lotus
    useEffect(() => {
        glowOpacity.value = withRepeat(
            withTiming(currentMood.glow + 0.1, {
                duration: Theme.motion.breathing,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [moodValue]);

    // Animated lotus style
    const lotusStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: 0.5 + glowOpacity.value,
        };
    });

    // Memoize shadow styles to avoid recreation on each render
    const lotusShadowStyle = useMemo(() => ({
        backgroundColor: currentMood.color,
        shadowColor: currentMood.color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: currentMood.glow,
        shadowRadius: 20,
    }), [currentMood.color, currentMood.glow]);

    const handleMoodChange = async (value: number) => {
        hapticLight();
        setMoodValue(value);

        // Pulse animation on change
        scale.value = withSpring(1.1, {
            damping: Theme.motion.spring.gentle.damping,
            stiffness: Theme.motion.spring.gentle.stiffness,
        }, () => {
            scale.value = withSpring(1);
        });

        // Call parent callback
        onMoodChange?.(value);

        // Auto-save to database
        if (userId) {
            await saveMoodLog(value);
        }
    };

    const saveMoodLog = async (mood: number) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('mood_logs')
                .insert([
                    {
                        user_id: userId,
                        mood_score: mood,
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (error) {
                console.error('Failed to save mood log:', error);
            } else {
                setLastSaved(new Date());
            }
        } catch (error) {
            console.error('Error saving mood:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {/* Header */}
            <VStack space="xs">
                <Heading color={Theme.colors.sacredWhite} size="lg">
                    Mood Check-in
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    How is your inner lotus today?
                </Text>
            </VStack>

            {/* Lotus Visualization */}
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: Theme.spacing.xl,
                }}
            >
                <Animated.View style={lotusStyle}>
                    <View
                        style={[
                            styles.lotus,
                            lotusShadowStyle,
                        ]}
                    >
                        <Text
                            style={{
                                fontSize: 48,
                                color: Theme.colors.sacredWhite,
                            }}
                        >
                            🪷
                        </Text>
                    </View>
                </Animated.View>
                <Text
                    style={{
                        marginTop: Theme.spacing.md,
                        fontSize: Theme.typography.fontSize.lg,
                        fontWeight: Theme.typography.fontWeight.semibold,
                        color: currentMood.color,
                    }}
                >
                    {currentMood.label}
                </Text>
            </Box>

            {/* Slider */}
            <Box sx={{ paddingHorizontal: Theme.spacing.md }}>
                <Slider
                    value={moodValue}
                    onChange={handleMoodChange}
                    minValue={1}
                    maxValue={5}
                    step={1}
                    size="md"
                >
                    <SliderTrack>
                        <SliderFilledTrack
                            sx={{
                                backgroundColor: currentMood.color,
                            }}
                        />
                    </SliderTrack>
                    <SliderThumb
                        sx={{
                            backgroundColor: currentMood.color,
                            borderWidth: 2,
                            borderColor: Theme.colors.sacredWhite,
                            width: 24,
                            height: 24,
                        }}
                    />
                </Slider>

                {/* Mood labels */}
                <HStack
                    justifyContent="space-between"
                    sx={{ marginTop: Theme.spacing.sm }}
                >
                    <Text color={Theme.colors.dimGray} size="xs">
                        Closed
                    </Text>
                    <Text color={Theme.colors.dimGray} size="xs">
                        Blooming
                    </Text>
                </HStack>
            </Box>

            {/* Privacy note */}
            <Box
                sx={{
                    backgroundColor: Theme.colors.deepIndigo,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Text color={Theme.colors.mistGray} size="xs" textAlign="center">
                    🔒 Your mood data is private and only visible to you
                </Text>
                {lastSaved && (
                    <Text color={Theme.colors.dimGray} size="xs" textAlign="center" mt="$2">
                        Saved {lastSaved.toLocaleTimeString()}
                    </Text>
                )}
            </Box>
        </VStack>
    );
}

const styles = StyleSheet.create({
    lotus: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
});
