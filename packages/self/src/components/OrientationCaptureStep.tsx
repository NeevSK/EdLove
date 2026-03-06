/**
 * OrientationCaptureStep
 *
 * The third onboarding step — presented AFTER name + role.
 * Labelled "How do you learn best?" (not "Personality type").
 *
 * Design principle: NEVER use MBTI / Enneagram labels.
 * Show three concrete life-situations, each with four
 * picture-card options.  The user's choices are translated
 * silently into four 0–100 orientation scores and saved to
 * `users.orientation_seeds`.
 *
 * The three questions map to:
 *   Q1  → depth_breadth  +  reflect_act
 *   Q2  → solo_social
 *   Q3  → steady_surge
 *
 * The step is OPTIONAL — users can skip it with one tap and
 * nothing is stored.  The app works perfectly without seeds.
 */

import React, { useState, useCallback } from 'react';
import { Pressable, View, StyleSheet, ScrollView } from 'react-native';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    Theme,
    useThemedColors,
} from '@repo/ui';
import { ChevronLeft } from 'lucide-react-native';
import { hapticLight, hapticSuccess } from '@repo/ui';
import type { OrientationSeeds } from '@repo/profile';

// ============================================================================
// DATA
// ============================================================================

interface OptionCard {
    emoji: string;
    label: string;
    /** How much this choice adds to each dimension (0–25 per question, 3 questions → 0–75 range, centred at 50) */
    delta: Partial<Record<keyof Omit<OrientationSeeds, 'source' | 'seeded_at' | 'last_updated'>, number>>;
}

interface Question {
    situation: string;
    prompt: string;
    options: [OptionCard, OptionCard, OptionCard, OptionCard];
}

const QUESTIONS: Question[] = [
    {
        situation: 'A free Sunday afternoon. You want to learn something new.',
        prompt: 'Which feels most like you?',
        options: [
            {
                emoji: '🔬',
                label: 'Go deep into one fascinating topic for hours',
                delta: { depth_breadth: -20, reflect_act: -10 },
            },
            {
                emoji: '🗺️',
                label: 'Browse widely — follow curiosity wherever it leads',
                delta: { depth_breadth: 20, reflect_act: 10 },
            },
            {
                emoji: '🛠️',
                label: 'Try making or building something new straight away',
                delta: { reflect_act: 20, depth_breadth: 0 },
            },
            {
                emoji: '📔',
                label: 'Sit quietly, read, and let ideas settle in your mind',
                delta: { reflect_act: -20, depth_breadth: -5 },
            },
        ],
    },
    {
        situation: 'You are stuck on a difficult problem at school or work.',
        prompt: 'What gives you the most energy?',
        options: [
            {
                emoji: '🧘',
                label: 'Stepping away to think it through alone first',
                delta: { solo_social: -22 },
            },
            {
                emoji: '💬',
                label: 'Talking it through with a colleague or friend',
                delta: { solo_social: 22 },
            },
            {
                emoji: '✍️',
                label: 'Writing or drawing your thoughts to clarify them',
                delta: { solo_social: -12, reflect_act: -10 },
            },
            {
                emoji: '🔄',
                label: 'Trying different approaches until something clicks',
                delta: { solo_social: 12, reflect_act: 12 },
            },
        ],
    },
    {
        situation: 'A big project is ahead of you — a term, a semester, a year.',
        prompt: 'How do you work best?',
        options: [
            {
                emoji: '📅',
                label: 'Steady daily progress — small steps, consistent rhythm',
                delta: { steady_surge: -22 },
            },
            {
                emoji: '⚡',
                label: 'Deep focused sprints, then rest — intense bursts',
                delta: { steady_surge: 22 },
            },
            {
                emoji: '🌊',
                label: 'Let energy rise and fall naturally, follow the flow',
                delta: { steady_surge: 10, reflect_act: -8 },
            },
            {
                emoji: '🗂️',
                label: 'Clear structure with planned milestones and checkpoints',
                delta: { steady_surge: -12, reflect_act: -10 },
            },
        ],
    },
];

// ============================================================================
// PROPS
// ============================================================================

export interface OrientationCaptureStepProps {
    onComplete: (seeds: OrientationSeeds) => void;
    onSkip: () => void;
    onBack: () => void;
    currentStep: number;
    totalSteps: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const OrientationCaptureStep = ({
    onComplete,
    onSkip,
    onBack,
    currentStep,
    totalSteps,
}: OrientationCaptureStepProps) => {
    const colors = useThemedColors();
    const [questionIndex, setQuestionIndex] = useState(0);
    const [selectedPerQuestion, setSelectedPerQuestion] = useState<number[]>([]);

    const question = QUESTIONS[questionIndex];
    const isLast = questionIndex === QUESTIONS.length - 1;

    const handleSelect = useCallback((optionIndex: number) => {
        hapticLight();
        const updated = [...selectedPerQuestion];
        updated[questionIndex] = optionIndex;
        setSelectedPerQuestion(updated);

        // Auto-advance after brief pause so the selection is visible
        setTimeout(() => {
            if (isLast) {
                // Calculate seeds from all selections
                const seeds = computeSeeds([...updated]);
                hapticSuccess();
                onComplete(seeds);
            } else {
                setQuestionIndex(qi => qi + 1);
            }
        }, 260);
    }, [questionIndex, selectedPerQuestion, isLast, onComplete]);

    const handleBack = useCallback(() => {
        hapticLight();
        if (questionIndex > 0) {
            setQuestionIndex(qi => qi - 1);
        } else {
            onBack();
        }
    }, [questionIndex, onBack]);

    const selected = selectedPerQuestion[questionIndex] ?? -1;

    const styles = StyleSheet.create({
        optionCard: {
            borderRadius: Theme.corners.generous,
            padding: Theme.spacing.md,
            borderWidth: 1.5,
            marginBottom: Theme.spacing.sm,
        },
    });

    return (
        <VStack style={{ flex: 1 }} space="md">
            {/* Progress dots */}
            <HStack space="xs" justifyContent="center" style={{ paddingTop: Theme.spacing.md }}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <Box
                        key={i}
                        style={{
                            width: i === currentStep ? 18 : 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: i === currentStep
                                ? Theme.colors.sanctuarySaffron
                                : i < currentStep ? colors.action : colors.border,
                        }}
                    />
                ))}
            </HStack>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: Theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <VStack space="xs" style={{ marginBottom: Theme.spacing.lg }}>
                    <Text
                        style={{
                            fontSize: 11,
                            fontWeight: '700',
                            letterSpacing: 1.2,
                            color: Theme.colors.sanctuarySaffron,
                            textTransform: 'uppercase',
                        }}
                    >
                        {`${questionIndex + 1} of ${QUESTIONS.length}`}
                    </Text>
                    <Heading
                        size="lg"
                        color={colors.text}
                        style={{ lineHeight: 28 }}
                    >
                        {question?.situation}
                    </Heading>
                    <Text color={colors.textSecondary} size="sm">
                        {question?.prompt}
                    </Text>
                </VStack>

                {/* Options */}
                <VStack space="sm">
                    {question?.options.map((opt, i) => {
                        const isSelected = selected === i;
                        return (
                            <Pressable
                                key={i}
                                onPress={() => handleSelect(i)}
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: isSelected
                                            ? Theme.colors.sanctuarySaffron + '22'
                                            : colors.secondary,
                                        borderColor: isSelected
                                            ? Theme.colors.sanctuarySaffron
                                            : colors.border,
                                    },
                                ]}
                            >
                                <HStack space="md" alignItems="center">
                                    <Text style={{ fontSize: 28 }}>{opt.emoji}</Text>
                                    <Text
                                        style={{
                                            flex: 1,
                                            fontSize: Theme.typography.fontSize.sm,
                                            lineHeight: 20,
                                            color: isSelected ? colors.text : colors.textSecondary,
                                            fontWeight: isSelected ? '600' : '400',
                                        }}
                                    >
                                        {opt.label}
                                    </Text>
                                </HStack>
                            </Pressable>
                        );
                    })}
                </VStack>

                {/* Privacy note */}
                <Text
                    style={{
                        marginTop: Theme.spacing.lg,
                        fontSize: Theme.typography.fontSize.xs,
                        color: colors.textTertiary,
                        textAlign: 'center',
                        lineHeight: 16,
                    }}
                >
                    🔒 Your answers are private. They help the app feel more like you — we never label or categorize you.
                </Text>
            </ScrollView>

            {/* Footer actions */}
            <HStack
                space="md"
                style={{
                    paddingHorizontal: Theme.spacing.lg,
                    paddingBottom: Theme.spacing.xl,
                    paddingTop: Theme.spacing.sm,
                }}
            >
                <Pressable
                    onPress={handleBack}
                    style={{
                        flex: 1,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 4,
                    }}
                >
                    <ChevronLeft color={colors.textSecondary} size={16} />
                    <Text color={colors.textSecondary} size="sm">Back</Text>
                </Pressable>
                <Pressable
                    onPress={onSkip}
                    style={{
                        flex: 2,
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        alignItems: 'center',
                    }}
                >
                    <Text color={colors.textTertiary} size="sm">Skip for now</Text>
                </Pressable>
            </HStack>
        </VStack>
    );
}

// ============================================================================
// SEED COMPUTATION
// ============================================================================

/**
 * Translates raw option selections into a normalised OrientationSeeds object.
 * Starts all dimensions at 50 (perfectly neutral) and applies deltas.
 * Clamps to [0, 100].
 */
export function computeSeeds(selections: number[]): OrientationSeeds {
    const acc: Record<string, number> = {
        depth_breadth: 50,
        reflect_act: 50,
        solo_social: 50,
        steady_surge: 50,
    };

    selections.forEach((optIdx, qIdx) => {
        const question = QUESTIONS[qIdx];
        if (!question || optIdx < 0 || optIdx >= question.options.length) return;
        const delta = question.options[optIdx].delta;
        for (const [key, val] of Object.entries(delta)) {
            if (val !== undefined && key in acc) {
                acc[key] = Math.max(0, Math.min(100, (acc[key] || 0) + (val as number)));
            }
        }
    });

    return {
        depth_breadth: acc.depth_breadth || 50,
        reflect_act: acc.reflect_act || 50,
        solo_social: acc.solo_social || 50,
        steady_surge: acc.steady_surge || 50,
        source: 'seeded',
        seeded_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
    };
}

// No default export — use the named export: import { OrientationCaptureStep } from './OrientationCaptureStep'

