/**
 * GENTLE PROGRESS TREE
 * Visual growth (seed → sapling → tree) over months
 * NO streaks, NO pressure, just organic growth
 */

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Heading, 
    PositiveInvitation, 
    SkeletonCard, 
    Text, 
    VStack, 
    Icon,
    Progress,
    ProgressFilledTrack
} from '@repo/ui';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
    FadeIn
} from 'react-native-reanimated';
import { supabase } from '@repo/core';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

interface ProgressTreeProps {
    userId?: string;
}

// Growth stages based on interaction count (very gentle curve)
const GROWTH_STAGES = [
    { minInteractions: 0, stage: 'seed', emoji: '🌱', label: 'Seed', description: 'Just beginning' },
    { minInteractions: 5, stage: 'sprout', emoji: '🌱', label: 'Sprout', description: 'Taking root' },
    { minInteractions: 15, stage: 'sapling', emoji: '🌿', label: 'Sapling', description: 'Growing steadily' },
    { minInteractions: 30, stage: 'young_tree', emoji: '🌳', label: 'Young Tree', description: 'Finding strength' },
    { minInteractions: 50, stage: 'tree', emoji: '🌲', label: 'Tree', description: 'Standing tall' },
    { minInteractions: 75, stage: 'blooming', emoji: '🌸', label: 'Blooming', description: 'Flourishing' },
];

export default function ProgressTree({ userId }: ProgressTreeProps) {
    const navigation = useNavigation<any>();
    const [interactionCount, setInteractionCount] = useState(0);
    const [currentStage, setCurrentStage] = useState(GROWTH_STAGES[0]!);
    const [showBloom, setShowBloom] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    // Animation values
    const treeScale = useSharedValue(0.8);
    const bloomOpacity = useSharedValue(0);
    const bloomScale = useSharedValue(0.5);

    useEffect(() => {
        if (userId) {
            const fetchInteractionCount = async () => {
                try {
                    const [moodLogs, fireJournal] = await Promise.all([
                        supabase
                            .from('mood_logs')
                            .select('id', { count: 'exact', head: true })
                            .eq('user_id', userId),
                        supabase
                            .from('fire_journal')
                            .select('id', { count: 'exact', head: true })
                            .eq('user_id', userId),
                    ]);

                    const total = (moodLogs.count || 0) + (fireJournal.count || 0);
                    setInteractionCount(total);
                } catch (error) {
                    console.error('Error fetching interaction count:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInteractionCount();
        } else {
            setIsLoading(false);
        }

        // Gentle breathing animation for the tree
        treeScale.value = withRepeat(
            withTiming(1, {
                duration: 4000,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );
    }, [userId, treeScale]);

    useEffect(() => {
        const stage = [...GROWTH_STAGES]
            .reverse()
            .find(s => interactionCount >= s.minInteractions) || GROWTH_STAGES[0]!;

        if (stage.stage !== currentStage.stage && stage.minInteractions > 0) {
            // Milestone animation
            setShowBloom(true);
            bloomOpacity.value = withTiming(1, { duration: 600 });
            bloomScale.value = withSpring(1.2, { damping: 10, stiffness: 100 });

            setTimeout(() => {
                bloomOpacity.value = withTiming(0, { duration: 600 });
                setTimeout(() => setShowBloom(false), 600);
            }, 3000);
        }

        setCurrentStage(stage);
    }, [interactionCount]);

    const treeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: treeScale.value }]
    }));

    const bloomStyle = useAnimatedStyle(() => ({
        opacity: bloomOpacity.value,
        transform: [{ scale: bloomScale.value }]
    }));

    // Calculate progress to next stage
    const nextStage = GROWTH_STAGES.find(s => s.minInteractions > interactionCount);
    const progressPercent = (nextStage && currentStage)
        ? ((interactionCount - currentStage.minInteractions) /
            (nextStage.minInteractions - currentStage.minInteractions)) * 100
        : 100;

    if (isLoading && userId) {
        return (
            <VStack className="p-lg gap-lg">
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
        <VStack className="p-lg gap-lg">
            {/* Header */}
            <VStack className="gap-1">
                <Heading className="text-sacredWhite" size="lg">
                    {t('progressTree.title') || 'Gentle Progress'}
                </Heading>
                <Text className="text-mistGray text-sm">
                    {t('progressTree.subtitle') || 'Organic growth at your own pace.'}
                </Text>
            </VStack>

            {/* Tree Visualization */}
            <Box className="items-center justify-center p-xl bg-obsidian rounded-comfortable min-h-[250px] relative border border-white/5 overflow-hidden">
                {/* Bloom effect */}
                {showBloom && (
                    <Animated.View style={[bloomStyle]} className="absolute top-[20%] items-center justify-center z-10">
                        <Text className="text-7xl mb-4">🌸</Text>
                        <Text className="text-sanctuarySaffron text-lg font-bold text-center">
                            Milestone reached!
                        </Text>
                    </Animated.View>
                )}

                {/* Main tree */}
                <Animated.View style={treeStyle} className="items-center justify-center">
                    <Text className="text-[120px]">
                        {currentStage.emoji}
                    </Text>
                </Animated.View>

                <VStack className="items-center mt-4">
                    <Text className="text-sacredWhite text-2xl font-bold">
                        {currentStage.label}
                    </Text>
                    <Text className="text-mistGray text-sm italic">
                        {currentStage.description}
                    </Text>
                </VStack>
            </Box>

            {/* Progress indicator */}
            <VStack className="bg-obsidian p-lg rounded-comfortable border border-white/5 gap-4">
                <HStack className="justify-between items-center">
                    <Text className="text-dimGray text-xs">
                        {interactionCount} {t('progressTree.interactionsLabel') || 'nurturing actions'}
                    </Text>
                    {nextStage && (
                        <Text className="text-dimGray text-xs">
                            {nextStage.minInteractions - interactionCount} more to {nextStage.label}
                        </Text>
                    )}
                </HStack>

                <Progress value={progressPercent} className="h-2 bg-white/5 rounded-full">
                    <ProgressFilledTrack className="bg-emeraldGreen" />
                </Progress>
            </VStack>

            {/* Philosophy note */}
            <Box className="p-md bg-white/5 rounded-comfortable">
                <Text className="text-mistGray text-xs text-center italic">
                    {t('progressTree.philosophy') || 'Growth happens in its own time. Every small action counts. 🌱'}
                </Text>
            </Box>
        </VStack>
    );
}
