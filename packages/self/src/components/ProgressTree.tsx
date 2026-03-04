/**
 * GENTLE PROGRESS TREE
 * Visual growth (seed → sapling → tree) over months
 * NO streaks, NO pressure, just organic growth
 * 
 * Philosophy:
 * - Growth is natural, not forced
 * - Every interaction nurtures the tree
 * - Blooms appear at meaningful milestones
 * - No punishment for "missed days"
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
} from '@repo/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Theme, typography } from '@repo/ui';
import { supabase } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { PositiveInvitation } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

interface ProgressTreeProps {
    userId?: string;
}

// Growth stages based on interaction count (very gentle curve)
const GROWTH_STAGES = [
    { minInteractions: 0, stage: 'seed', emoji: '🌰', label: 'Seed', description: 'Just beginning' },
    { minInteractions: 5, stage: 'sprout', emoji: '🌱', label: 'Sprout', description: 'Taking root' },
    { minInteractions: 15, stage: 'sapling', emoji: '🌿', label: 'Sapling', description: 'Growing steadily' },
    { minInteractions: 30, stage: 'young_tree', emoji: '🌳', label: 'Young Tree', description: 'Finding strength' },
    { minInteractions: 50, stage: 'tree', emoji: '🌲', label: 'Tree', description: 'Standing tall' },
    { minInteractions: 75, stage: 'blooming', emoji: '🌸', label: 'Blooming', description: 'Flourishing' },
];

export default function ProgressTree({ userId }: ProgressTreeProps) {
    const navigation = useNavigation<any>();
    const [interactionCount, setInteractionCount] = useState(0);
    const [currentStage, setCurrentStage] = useState(GROWTH_STAGES[0]);
    const [showBloom, setShowBloom] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    // Animation values
    const treeScale = useSharedValue(0.8);
    const bloomOpacity = useSharedValue(0);
    const bloomScale = useSharedValue(0.5);

    useEffect(() => {
        if (userId) {
            fetchInteractionCount();
        } else {
            setIsLoading(false);
        }

        // Gentle breathing animation for the tree
        treeScale.value = withRepeat(
            withTiming(1, {
                duration: 4000,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [userId]);

    useEffect(() => {
        // Determine current stage based on interaction count
        const stage = [...GROWTH_STAGES]
            .reverse()
            .find(s => interactionCount >= s.minInteractions) || GROWTH_STAGES[0];

        // Check if we just reached a new stage
        const previousStage = currentStage;
        if (stage.stage !== previousStage.stage && stage.minInteractions > 0) {
            // Show bloom animation when reaching milestone
            triggerBloomAnimation();
        }

        setCurrentStage(stage);
    }, [interactionCount]);

    const fetchInteractionCount = async () => {
        try {
            // Count all meaningful interactions across different tables
            const [moodLogs, fireJournal] = await Promise.all([
                supabase
                    .from('mood_logs')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId),
                supabase
                    .from('fire_journal')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId),
                // Add more interaction types as they're built
            ]);

            const total = (moodLogs.count || 0) + (fireJournal.count || 0);
            setInteractionCount(total);
        } catch (error) {
            console.error('Error fetching interaction count:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerBloomAnimation = () => {
        setShowBloom(true);

        // Bloom animation
        bloomOpacity.value = 0;
        bloomScale.value = 0.5;

        bloomOpacity.value = withTiming(1, {
            duration: Theme.motion.gentle,
        });

        bloomScale.value = withSpring(1.2, {
            damping: 10,
            stiffness: 100,
        });

        // Hide after 3 seconds
        setTimeout(() => {
            bloomOpacity.value = withTiming(0, {
                duration: Theme.motion.gentle,
            });
            setTimeout(() => setShowBloom(false), 500);
        }, 3000);
    };

    const treeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: treeScale.value }],
    }));

    const bloomStyle = useAnimatedStyle(() => ({
        opacity: bloomOpacity.value,
        transform: [{ scale: bloomScale.value }],
    }));

    // Calculate progress to next stage
    const nextStage = GROWTH_STAGES.find(s => s.minInteractions > interactionCount);
    const progressPercent = nextStage
        ? ((interactionCount - currentStage.minInteractions) /
            (nextStage.minInteractions - currentStage.minInteractions)) * 100
        : 100;

    if (isLoading && userId) {
        return (
            <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
                <SkeletonCard height={40} />
                <SkeletonCard height={280} />
                <SkeletonCard height={80} />
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
                    {t('progressTree.title')}
                </Heading>
                <Text color={Theme.colors.mistGray} size="sm">
                    {t('progressTree.subtitle')}
                </Text>
            </VStack>

            {/* Tree Visualization */}
            <Box
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: Theme.spacing.xl,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: 200,
                    position: 'relative',
                }}
            >
                {/* Bloom effect */}
                {showBloom && (
                    <Animated.View
                        style={[
                            bloomStyle,
                            {
                                position: 'absolute',
                                top: '20%',
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                        ]}
                    >
                        <Text style={{ fontSize: 72 }}>🌸</Text>
                        <Text
                            color={Theme.colors.sanctuarySaffron}
                            size="lg"
                            sx={{
                                fontWeight: typography.fontWeight.bold,
                                marginTop: Theme.spacing.sm,
                            }}
                        >
                            Milestone reached!
                        </Text>
                    </Animated.View>
                )}

                {/* Main tree */}
                <Animated.View style={treeStyle}>
                    <Text style={{ fontSize: 96 }}>
                        {currentStage.emoji}
                    </Text>
                </Animated.View>

                <Text
                    color={Theme.colors.sacredWhite}
                    size="2xl"
                    sx={{
                        fontWeight: typography.fontWeight.semibold,
                        marginTop: Theme.spacing.md,
                    }}
                >
                    {currentStage.label}
                </Text>
                <Text
                    color={Theme.colors.mistGray}
                    size="sm"
                    sx={{ fontStyle: 'italic' }}
                >
                    {currentStage.description}
                </Text>
            </Box>

            {/* Gentle progress indicator */}
            <Box
                sx={{
                    backgroundColor: Theme.colors.ink,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Text
                    color={Theme.colors.dimGray}
                    size="xs"
                    sx={{ marginBottom: Theme.spacing.sm }}
                >
                    {interactionCount} interactions nurturing your tree
                </Text>

                {nextStage && (
                    <>
                        <Box
                            sx={{
                                width: '100%',
                                height: 8,
                                backgroundColor: Theme.colors.ink,
                                borderRadius: 4,
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    width: `${progressPercent}%`,
                                    height: '100%',
                                    backgroundColor: Theme.colors.sageGreen,
                                }}
                            />
                        </Box>
                        <Text
                            color={Theme.colors.dimGray}
                            size="xs"
                            sx={{ marginTop: Theme.spacing.sm }}
                        >
                            Next: {nextStage.label} ({nextStage.minInteractions - interactionCount} more interactions)
                        </Text>
                    </>
                )}
            </Box>

            {/* Philosophy note */}
            <Box
                sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                }}
            >
                <Text
                    color={Theme.colors.mistGray}
                    size="xs"
                    textAlign="center"
                    sx={{ fontStyle: 'italic' }}
                >
                    Growth happens in its own time. Every small action counts. 🌱
                </Text>
            </Box>
        </VStack>
    );
}
