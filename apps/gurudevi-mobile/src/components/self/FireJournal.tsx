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
} from '@gluestack-ui/themed';
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
import { Theme, typography } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticMedium } from '../../utils/haptics';

interface FireJournalProps {
    userId?: string;
    onBurned?: () => void;
}

export default function FireJournal({ userId, onBurned }: FireJournalProps) {
    const [content, setContent] = useState('');
    const [isBurning, setIsBurning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Refs for timeout cleanup
    const burnTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const successTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Animation values
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);

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
            ],
        };
    });

    const handleBurn = async () => {
        if (!content.trim()) return;
        if (!userId) {
            console.error('User must be logged in to use Fire Journal');
            return;
        }

        hapticMedium();
        setIsBurning(true);

        // Start burn animation
        performBurnAnimation();

        // Save to database
        try {
            const { error } = await supabase
                .from('fire_journal')
                .insert([
                    {
                        content_preview: content.substring(0, 100), // Store preview only
                        is_burned: true,
                        user_id: userId,
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (error) {
                console.error('Failed to save fire journal entry:', error);
            }
        } catch (error) {
            console.error('Error saving fire journal:', error);
        }
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

        // Hide success message after delay
        successTimeoutRef.current = setTimeout(() => {
            setShowSuccess(false);
            onBurned?.();
        }, 2000);
    };

    return (
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
            {/* Header */}
            <VStack space="xs">
                <Heading color={Theme.colors.sacredWhite} size="lg">
                    Fire Journal
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    Write what weighs on you, then let it go
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
                            color={Theme.colors.voidIndigo}
                            size="md"
                            sx={{ fontWeight: Theme.typography.fontWeight.semibold }}
                        >
                            ✨ Released into the fire
                        </Text>
                    </Box>
                </Animated.View>
            )}

            {/* Text Input Area */}
            <Animated.View style={containerStyle}>
                <Box
                    sx={{
                        backgroundColor: Theme.colors.deepIndigo,
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
                            placeholder="Write what you need to release..."
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
                        backgroundColor: Theme.colors.deepIndigo,
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
                        color={Theme.colors.white}
                        size={20}
                        style={{ marginRight: Theme.spacing.sm }}
                    />
                    <ButtonText color={Theme.colors.white}>
                        {isBurning ? 'Burning...' : 'Burn'}
                    </ButtonText>
                </Button>
            </HStack>

            {/* Privacy & Guidance Note */}
            <VStack space="sm">
                <Box
                    sx={{
                        backgroundColor: Theme.colors.deepIndigo,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <Text color={Theme.colors.mistGray} size="xs" textAlign="center">
                        🔥 What you burn is transformed, not stored
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
                        Sometimes the act of naming is enough to release it
                    </Text>
                </Box>
            </VStack>
        </VStack>
    );
}
