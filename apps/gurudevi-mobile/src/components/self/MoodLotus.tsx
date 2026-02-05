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
import { Theme, typography } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import * as Haptics from 'expo-haptics';

interface MoodLotusProps {
    userId?: string;
    onMoodChange?: (mood: number) => void;
}

const LOTUS_BUD = require('../../../assets/images/lotus_bud.png');
const LOTUS_BLOOM = require('../../../assets/images/lotus_bloom.png');

const MOOD_STATES = [
    { value: 1, label: 'Heavy', color: Theme.colors.dimGray, glow: 0, image: LOTUS_BUD, scale: 0.8 },
    { value: 2, label: 'Challenging', color: Theme.colors.slateGray, glow: 0.1, image: LOTUS_BUD, scale: 0.9 },
    { value: 3, label: 'Okay', color: Theme.colors.stoneGray, glow: 0.2, image: LOTUS_BLOOM, scale: 0.8 }, // Transition start
    { value: 4, label: 'Good', color: Theme.colors.sageGreen, glow: 0.4, image: LOTUS_BLOOM, scale: 0.9 },
    { value: 5, label: 'Flourishing', color: Theme.colors.sanctuarySaffron, glow: 0.6, image: LOTUS_BLOOM, scale: 1.0 },
];

export default function MoodLotus({ userId, onMoodChange }: MoodLotusProps) {
    const [moodValue, setMoodValue] = useState(3);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

    const currentMood = MOOD_STATES[moodValue - 1];

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

            {/* Slider */}
            <Box sx={{ paddingHorizontal: Theme.spacing.md }}>
                <Slider
                    value={moodValue}
                    onChange={handleMoodChange}
                    onChangeEnd={handleSlidingComplete}
                    minValue={1}
                    maxValue={5}
                    step={1}
                    size="lg"
                    orientation="horizontal"
                    isDisabled={false}
                    isReversed={false}
                    sx={{
                        width: '100%',
                        height: 50,
                    }}
                >
                    <SliderTrack sx={{ height: 12, borderRadius: 6, backgroundColor: Theme.colors.midnightBlue }}>
                        <SliderFilledTrack
                            sx={{
                                backgroundColor: currentMood.color,
                            }}
                        />
                    </SliderTrack>
                    <SliderThumb
                        sx={{
                            backgroundColor: currentMood.color,
                            borderWidth: 4,
                            borderColor: Theme.colors.sacredWhite,
                            width: 36,
                            height: 36,
                            shadowColor: currentMood.color,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 15,
                            elevation: 8,
                        }}
                    />
                </Slider>

                {/* Mood labels */}
                <HStack
                    justifyContent="space-between"
                    sx={{ marginTop: Theme.spacing.md }}
                >
                    <Text color={Theme.colors.dimGray} size="xs">
                        Closed Bud
                    </Text>
                    <Text color={Theme.colors.dimGray} size="xs">
                        Full Bloom
                    </Text>
                </HStack>
            </Box>

            {/* Privacy note */}
            <Box
                sx={{
                    backgroundColor: Theme.colors.midnightBlue,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                    marginTop: Theme.spacing.sm
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
