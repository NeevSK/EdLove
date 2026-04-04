/**
 * REPORT CARD COMPONENT
 * 
 * Displays a student's report card with all their grades.
 */

import React, { useMemo } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    ScrollView,
    Theme
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { StudentGrade, marksToGPA, calculateRanks } from '@repo/analytics';

interface ReportCardProps {
    studentName: string;
    grades: StudentGrade[];
    assignmentNames: { [assignmentId: string]: string };
    showGPA?: boolean;
    showRanks?: boolean;
}

export default function ReportCard({
    studentName,
    grades,
    assignmentNames,
    showGPA = true,
    showRanks = false,
}: ReportCardProps) {
    const { t } = useTranslation();

    // Calculate overall GPA
    const overallGPA = useMemo(() => {
        if (grades.length === 0) return 0;
        const totalGPA = grades.reduce((sum, grade) => {
            const { gpa } = marksToGPA(grade.marks);
            return sum + gpa;
        }, 0);
        return totalGPA / grades.length;
    }, [grades]);

    // Calculate average marks
    const averageMarks = useMemo(() => {
        if (grades.length === 0) return 0;
        const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
        return totalMarks / grades.length;
    }, [grades]);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space="lg" sx={{ padding: Theme.spacing.md }}>
                {/* Student Info Header */}
                <Box
                    sx={{
                        padding: Theme.spacing.xl,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.generous,
                        ...Theme.shadows.md,
                    }}
                >
                    <VStack space="sm">
                        <Text size="sm" sx={{ color: Theme.colors.sacredWhite, opacity: 0.9 }}>
                            {t('grades.reportCard') || 'Report Card'}
                        </Text>
                        <Heading size="xl" sx={{ color: Theme.colors.sacredWhite }}>
                            {studentName}
                        </Heading>
                        {grades.length > 0 && (
                            <HStack space="lg" sx={{ marginTop: Theme.spacing.sm }}>
                                <VStack space="xs">
                                    <Text size="xs" sx={{ color: Theme.colors.sacredWhite, opacity: 0.9 }}>
                                        {t('grades.averageMarks') || 'Avg Marks'}
                                    </Text>
                                    <Text size="xl" sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                                        {averageMarks.toFixed(1)}
                                    </Text>
                                </VStack>
                                {showGPA && (
                                    <VStack space="xs">
                                        <Text size="xs" sx={{ color: Theme.colors.sacredWhite, opacity: 0.9 }}>
                                            {t('grades.overallGPA') || 'Overall GPA'}
                                        </Text>
                                        <Text size="xl" sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                                            {overallGPA.toFixed(2)}
                                        </Text>
                                    </VStack>
                                )}
                            </HStack>
                        )}
                    </VStack>
                </Box>

                {/* Assignments List */}
                <VStack space="md">
                    <Heading size="md" color={Theme.colors.inkTruth}>
                        {t('grades.assignments') || 'Assignments'}
                    </Heading>

                    {grades.length === 0 ? (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                backgroundColor: Theme.colors.sacredWhite,
                                borderRadius: Theme.corners.comfortable,
                                alignItems: 'center',
                            }}
                        >
                            <Text color={Theme.colors.starlightGray} textAlign="center">
                                {t('grades.noAssignments') || 'No assignments recorded.'}
                            </Text>
                        </Box>
                    ) : (
                        grades.map((grade) => {
                            const { grade: letterGrade, gpa } = marksToGPA(grade.marks);
                            const assignmentName = grade.assignment_id
                                ? (assignmentNames[grade.assignment_id] || t('grades.assignment') || 'Assignment')
                                : t('grades.assignment') || 'Assignment';

                            return (
                                <Box
                                    key={grade.id}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.sacredWhite,
                                        borderRadius: Theme.corners.comfortable,
                                        ...Theme.shadows.sm,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.sanctuarySaffron,
                                    }}
                                >
                                    <VStack space="md">
                                        {/* Assignment Header */}
                                        <HStack space="md" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <VStack space="xs" sx={{ flex: 1 }}>
                                                <Text size="md" sx={{ fontWeight: '700', color: Theme.colors.inkTruth }}>
                                                    {assignmentName}
                                                </Text>
                                                <Text size="xs" color={Theme.colors.starlightGray}>
                                                    {new Date(grade.created_at).toLocaleDateString()}
                                                </Text>
                                            </VStack>

                                            {/* Grade Display */}
                                            <VStack space="xs" sx={{ alignItems: 'flex-end' }}>
                                                <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                    <Text size="2xl" sx={{ fontWeight: '700', color: Theme.colors.inkTruth }}>
                                                        {grade.marks}
                                                    </Text>
                                                    <Text size="sm" color={Theme.colors.starlightGray}>
                                                        /100
                                                    </Text>
                                                </HStack>
                                                {showGPA && (
                                                    <HStack space="xs" sx={{ alignItems: 'center' }}>
                                                        <Box
                                                            sx={{
                                                                paddingHorizontal: Theme.spacing.sm,
                                                                paddingVertical: Theme.spacing.xs,
                                                                backgroundColor: Theme.colors.sanctuarySaffron,
                                                                borderRadius: Theme.corners.tight,
                                                            }}
                                                        >
                                                            <Text size="sm" sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                                                                {letterGrade}
                                                            </Text>
                                                        </Box>
                                                        <Text size="sm" color={Theme.colors.starlightGray}>
                                                            {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
                                                        </Text>
                                                    </HStack>
                                                )}
                                            </VStack>
                                        </HStack>

                                        {/* Rank Badge */}
                                        {showRanks && grade.rank && (
                                            <Box
                                                sx={{
                                                    paddingHorizontal: Theme.spacing.md,
                                                    paddingVertical: Theme.spacing.sm,
                                                    backgroundColor: Theme.colors.ink,
                                                    borderRadius: Theme.corners.tight,
                                                    alignSelf: 'flex-start',
                                                }}
                                            >
                                                <Text size="sm" sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>
                                                    {t('grades.rankInClass', { rank: grade.rank }) || `Rank: #${grade.rank}`}
                                                </Text>
                                            </Box>
                                        )}

                                        {/* Feedback */}
                                        {grade.feedback && (
                                            <VStack space="xs">
                                                <Text size="xs" sx={{ fontWeight: '700', color: Theme.colors.starlightGray }}>
                                                    {t('grades.feedback') || 'Feedback'}:
                                                </Text>
                                                <Text size="sm" color={Theme.colors.inkTruth}>
                                                    {grade.feedback}
                                                </Text>
                                            </VStack>
                                        )}
                                    </VStack>
                                </Box>
                            );
                        })
                    )}
                </VStack>
            </VStack>
        </ScrollView>
    );
}
