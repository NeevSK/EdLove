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
} from '@gluestack-ui/themed';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Theme from '../../constants/Theme';

interface Goal {
    id: string;
    text: string;
    progress: number; // 0-100
    createdAt: string;
}

interface StudentGoalsProps {
    userId: string;
}

export default function StudentGoals({ userId }: StudentGoalsProps) {
    const { t } = useTranslation();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');
    const [streak, setStreak] = useState(0);
    const [showAddGoal, setShowAddGoal] = useState(false);

    useEffect(() => {
        loadGoals();
        loadStreak();
    }, [userId]);

    const loadGoals = async () => {
        // In a real app, would load from API or local storage
        // For now, using mock data
        const mockGoals: Goal[] = [
            {
                id: '1',
                text: 'Get an A in Mathematics',
                progress: 65,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                text: 'Complete all homework on time',
                progress: 80,
                createdAt: new Date().toISOString(),
            },
        ];
        setGoals(mockGoals);
    };

    const loadStreak = async () => {
        // In a real app, would calculate from mood logs or activity
        // For now, using mock data
        setStreak(5);
    };

    const handleAddGoal = () => {
        if (!newGoalText.trim()) return;

        const newGoal: Goal = {
            id: Date.now().toString(),
            text: newGoalText,
            progress: 0,
            createdAt: new Date().toISOString(),
        };

        setGoals([...goals, newGoal]);
        setNewGoalText('');
        setShowAddGoal(false);
    };

    const handleUpdateProgress = (goalId: string, newProgress: number) => {
        setGoals(
            goals.map((goal) =>
                goal.id === goalId
                    ? { ...goal, progress: Math.min(100, Math.max(0, newProgress)) }
                    : goal
            )
        );
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
                    backgroundColor: Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 4,
                    borderLeftColor: Theme.colors.dawnGold,
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
                            color={Theme.colors.dawnGold}
                            sx={{
                                fontSize: 32,
                                fontWeight: '700',
                            }}
                        >
                            {getStreakMessage(streak)}
                        </Text>
                    </HStack>

                    <Text
                        color={Theme.colors.pearlGray}
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
                            backgroundColor: Theme.colors.deepIndigo,
                            borderRadius: Theme.corners.comfortable,
                        }}
                    >
                        <VStack space="md">
                            <Input
                                sx={{
                                    backgroundColor: Theme.colors.voidIndigo,
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
                            >
                                <ButtonText color={Theme.colors.sacredWhite}>
                                    {t('studentGoals.saveGoal') || 'Save Goal'}
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
                            backgroundColor: Theme.colors.deepIndigo,
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
                                        backgroundColor: Theme.colors.voidIndigo,
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
                                                backgroundColor: Theme.colors.voidIndigo,
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
                            color={Theme.colors.pearlGray}
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
