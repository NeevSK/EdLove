/**
 * MyGradesView
 *
 * Student-facing grade summary: shows graded submissions ordered by most recent.
 * Queries `submissions` where `student_id = userId` (internal users.id) and grade IS NOT NULL.
 * RLS: students can read their own rows (migration 20260301_submissions_rls.sql).
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    SkeletonCard,
    useThemedColors,
    Theme,
} from '@repo/ui';
import { supabase } from '@repo/core';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScrollView } from 'react-native';

interface GradeRow {
    id: string;
    assignment_id: string;
    classroom_id: string;
    grade: number;
    feedback: string | null;
    submitted_at: string;
    assignments: { title: string } | null;
    classrooms: { name: string } | null;
}

interface MyGradesViewProps {
    userId?: string;
}

// Sri Lankan grade thresholds (configurable per school system in future)
const GRADE_THRESHOLD_EXCELLENT = 75;
const GRADE_THRESHOLD_PASSING = 50;

const GRADE_COLOR = (grade: number): string => {
    if (grade >= GRADE_THRESHOLD_EXCELLENT) return Theme.colors.sageGreen ?? '#4caf50';
    if (grade >= GRADE_THRESHOLD_PASSING) return Theme.colors.amberGlow ?? '#ffc107';
    return Theme.colors.emberRed ?? '#f44336';
};

export default function MyGradesView({ userId }: MyGradesViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [grades, setGrades] = useState<GradeRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) { setIsLoading(false); return; }
        fetchGrades();
    }, [userId]);

    const fetchGrades = async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('submissions')
                .select('id, assignment_id, classroom_id, grade, feedback, submitted_at, assignments(title), classrooms(name)')
                .eq('student_id', userId)
                .not('grade', 'is', null)
                .order('submitted_at', { ascending: false })
                .limit(20);

            // Filter rows with a numeric grade (Supabase returns null-grade rows despite the filter in some edge cases)
            const rows = (data as any[] ?? []).filter(
                (r): r is GradeRow => r !== null && typeof r.grade === 'number'
            );
            setGrades(rows);
        } catch {
            // Non-fatal  show empty state
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <VStack space="sm" sx={{ flex: 1 }}>
                <SkeletonCard height={72} />
                <SkeletonCard height={72} />
                <SkeletonCard height={72} />
            </VStack>
        );
    }

    if (!grades.length) {
        return (
            <Box>
                p={Theme.spacing.lg}
                sx={{
                    backgroundColor: colors.tertiary,
                    borderRadius: Theme.corners.comfortable,
                    alignItems: 'center',
                }}
            
                <Text color={colors.textSecondary} size="sm" textAlign="center">
                    {t('student.noGradesYet')}
                </Text>
            </Box>
        );
    }

    return (
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            <VStack space="sm">
                {grades.map((item, i) => (
                    <Animated.View key={item.id} entering={FadeInDown.delay(i * 40)}>
                        <Box>
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 4,
                                borderLeftColor: GRADE_COLOR(item.grade),
                            }}
                        
                            <HStack justifyContent="space-between" alignItems="flex-start">
                                <VStack sx={{ flex: 1, marginRight: Theme.spacing.sm }}>
                                    <Text color={colors.text} size="sm" bold numberOfLines={1}>
                                        {item.assignments?.title ?? t('student.unknownAssignment')}
                                    </Text>
                                    <Text color={colors.textSecondary} size="xs">
                                        {item.classrooms?.name ?? ''}
                                    </Text>
                                    {!!item.feedback && (
                                        <Text color={colors.textTertiary} size="xs" mt="$1" numberOfLines={2}>
                                            {item.feedback}
                                        </Text>
                                    )}
                                </VStack>
                                <Box>
                                    sx={{
                                        backgroundColor: GRADE_COLOR(item.grade),
                                        borderRadius: Theme.corners.full,
                                        width: 44,
                                        height: 44,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                
                                    <Text color={Theme.colors.white} bold size="sm">{item.grade}</Text
                                ></Box>
                            </HStack>
                        </Box>
                    </Animated.View>
                ))}
            </VStack>
        </ScrollView>
    );
}
