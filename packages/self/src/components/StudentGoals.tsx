/**
 * STUDENT GOALS COMPONENT
 * 
 * Student-specific feature for the Self tab.
 * Features:
 * - Goal setter ("I want to get an A in Math")
 * - Motivation bar ("Current Streak: 5 Days")
 * - Progress tracking
 * 
 * Mission 05: Student Path
 */

import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Button,
    ButtonText,
    Input,
    InputField,
    Progress,
    ProgressFilledTrack,
} from '@repo/ui';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';

import { supabase } from '@repo/core';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useSafeMutation } from '@repo/core';
import { useStudentGoals } from '../hooks/useStudentGoals';
import type { Goal } from '../types';

interface StudentGoalsProps {
    userId: string;
}

export default function StudentGoals({ userId }: StudentGoalsProps) {
    const { t } = useTranslation();

    // Resilient Data Hook
    const { goals, refreshData } = useStudentGoals(userId);

    const [newGoalText, setNewGoalText] = useState('');
    const [streak, setStreak] = useState(0);
    const [showAddGoal, setShowAddGoal] = useState(false);

    useEffect(() => {
        loadStreak();
    }, [userId]);

    // Removed manual loadGoals as it's handled by generic hook

    const loadStreak = async () => {
        // In a real app, would calculate from mood logs or activity
        // For now, using mock data
        setStreak(5);
    };

    const { mutate: saveGoal, isLoading: isSaving } = useSafeMutation(
        async (text: string) => {
            const { error } = await supabase
                .from('student_goals')
                .insert({
                    user_id: userId,
                    text: text,
                    progress: 0
                });
            if (error) throw error;
        },
        {
            onSuccess: () => {
                hapticSuccess();
                setNewGoalText('');
                setShowAddGoal(false);
                refreshData();
            }
        }
    );

    const handleAddGoal = async () => {
        if (!newGoalText.trim() || !userId) return;
        hapticLight();
        await saveGoal(newGoalText.trim());
    };

    const { mutate: updateProgress } = useSafeMutation(
        async (variables: { id: string, progress: number }) => {
            const { error } = await supabase
                .from('student_goals')
                .update({ progress: variables.progress })
                .eq('id', variables.id);
            if (error) throw error;
        },
        {
            onSuccess: () => {
                hapticLight();
                refreshData();
            }
        }
    );

    const handleUpdateProgress = (goalId: string, newProgress: number) => {
        const clampedProgress = Math.min(100, Math.max(0, newProgress));
        updateProgress({ id: goalId, progress: clampedProgress });
    };

    const getStreakMessage = (days: number): string => {
        if (days === 0) {
            return t('studentGoals.streakStart') || 'Start your streak today!';
        } else if (days === 1) {
            return t('studentGoals.streak1') || '1 Day Streak 🌱';
        } else if (days < 7) {
            return t('studentGoals.streakDays', { days }) || `${days} Day Streak 🔥`;
        } else if (days < 30) {
            return t('studentGoals.streakWeeks', { weeks: Math.floor(days / 7) }) ||
                `${Math.floor(days / 7)} Week Streak 💪`;
        } else {
            return t('studentGoals.streakMonths', { months: Math.floor(days / 30) }) ||
                `${Math.floor(days / 30)} Month Streak ⭐`;
        }
    };

    return (
        <VStack space="lg">
            {/* Motivation Bar / Streak */}
            <Box
                sx={{
                    padding: Theme.spacing.lg,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 4,
                    borderLeftColor: Theme.colors.templeGold,
                }}
            >
                <VStack space="md">
                    <HStack
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            color={Theme.colors.sacredWhite}
                            size="lg"
                            sx={{ fontWeight: '700' }}
                        >
                            {t('studentGoals.motivationTitle') || '✨ Your Momentum'}
                        </Text>
                    </HStack>

                    <HStack
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: Theme.spacing.md,
                        }}
                    >
                        <Text
                            color={Theme.colors.templeGold}
                            sx={{
                                fontSize: 32,
                                fontWeight: '700',
                            }}
                        >
                            {getStreakMessage(streak)}
                        </Text>
                    </HStack>

                    <Text
                        color={Theme.colors.starlightGray}
                        size="sm"
                        textAlign="center"
                    >
                        {t('studentGoals.streakDesc') ||
                            'Keep logging your mood and completing assignments!'}
                    </Text>
                </VStack>
            </Box>

            {/* Goals Section */}
            <VStack space="md">
                <HStack
                    sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Heading size="lg" color={Theme.colors.sanctuarySaffron}>
                        {t('studentGoals.goalsTitle') || '🎯 My Goals'}
                    </Heading>

                    <Button
                        variant="link"
                        size="sm"
                        onPress={() => setShowAddGoal(!showAddGoal)}
                    >
                        <ButtonText color={Theme.colors.sanctuarySaffron}>
                            {showAddGoal
                                ? t('common.cancel') || 'Cancel'
                                : t('studentGoals.addGoal') || '+ Add Goal'}
                        </ButtonText>
                    </Button>
                </HStack>

                {/* Add Goal Input */}
                {showAddGoal && (
                    <Box
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: Theme.colors.ink,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <VStack space="md">
                            <Input
                                sx={{
                                    backgroundColor: Theme.colors.obsidian,
                                }}
                            >
                                <InputField
                                    placeholder={
                                        t('studentGoals.goalPlaceholder') ||
                                        'I want to...'
                                    }
                                    value={newGoalText}
                                    onChangeText={setNewGoalText}
                                    sx={{
                                        color: Theme.colors.sacredWhite,
                                    }}
                                />
                            </Input>

                            <Button
                                sx={{
                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                }}
                                onPress={handleAddGoal}
                                isDisabled={!newGoalText.trim() || isSaving}
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {isSaving ? 'Saving...' : (t('studentGoals.saveGoal') || 'Save Goal')}
                                </ButtonText>
                            </Button>
                        </VStack>
                    </Box>
                )}

                {/* Goals List */}
                {goals.map((goal) => (
                    <Box
                        key={goal.id}
                        sx={{
                            padding: Theme.spacing.md,
                            backgroundColor: Theme.colors.ink,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <VStack space="md">
                            {/* Goal Text */}
                            <Text
                                color={Theme.colors.sacredWhite}
                                size="md"
                                sx={{ fontWeight: '600' }}
                            >
                                {goal.text}
                            </Text>

                            {/* Progress Bar */}
                            <VStack space="xs">
                                <HStack
                                    sx={{
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text color={Theme.colors.mistGray} size="sm">
                                        {t('studentGoals.progress') || 'Progress'}
                                    </Text>
                                    <Text
                                        color={Theme.colors.sanctuarySaffron}
                                        size="sm"
                                        sx={{ fontWeight: '700' }}
                                    >
                                        {goal.progress}%
                                    </Text>
                                </HStack>

                                <Progress
                                    value={goal.progress}
                                    sx={{
                                        height: 8,
                                        backgroundColor: Theme.colors.obsidian,
                                    }}
                                >
                                    <ProgressFilledTrack
                                        sx={{
                                            backgroundColor:
                                                goal.progress === 100
                                                    ? Theme.colors.sageGreen
                                                    : Theme.colors.sanctuarySaffron,
                                        }}
                                    />
                                </Progress>
                            </VStack>

                            {/* Progress Controls */}
                            {goal.progress < 100 && (
                                <HStack space="sm">
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleUpdateProgress(goal.id, goal.progress - 10)
                                        }
                                    >
                                        <Box
                                            sx={{
                                                padding: Theme.spacing.sm,
                                                backgroundColor: Theme.colors.obsidian,
                                                borderRadius: Theme.corners.tight,
                                            }}
                                        >
                                            <Text color={Theme.colors.mistGray}>➖</Text>
                                        </Box>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() =>
                                            handleUpdateProgress(goal.id, goal.progress + 10)
                                        }
                                    >
                                        <Box
                                            sx={{
                                                padding: Theme.spacing.sm,
                                                backgroundColor: Theme.colors.sanctuarySaffron,
                                                borderRadius: Theme.corners.tight,
                                            }}
                                        >
                                            <Text color={Theme.colors.sacredWhite}>➕</Text>
                                        </Box>
                                    </TouchableOpacity>
                                </HStack>
                            )}

                            {/* Completion Badge */}
                            {goal.progress === 100 && (
                                <HStack space="sm" sx={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 20 }}>🎉</Text>
                                    <Text
                                        color={Theme.colors.sageGreen}
                                        sx={{ fontWeight: '700' }}
                                    >
                                        {t('studentGoals.completed') || 'Goal Achieved!'}
                                    </Text>
                                </HStack>
                            )}
                        </VStack>
                    </Box>
                ))}

                {/* Empty State */}
                {goals.length === 0 && !showAddGoal && (
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            color={Theme.colors.starlightGray}
                            textAlign="center"
                        >
                            {t('studentGoals.noGoals') ||
                                'Set your first goal to start tracking your progress!'}
                        </Text>
                    </Box>
                )}
            </VStack>
        </VStack>
    );
}
