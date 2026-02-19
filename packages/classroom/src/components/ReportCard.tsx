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
import { StudentGrade, marksToGPA } from '@repo/core';

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
            <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.md }}>
                {/* Student Info Header */}
                <Box
                    sx={{
                        padding: Theme.spacing.xl,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.generous,
                        ...Theme.shadows.md,
                    }}
                >
                    <VStack sx={{ gap: Theme.spacing.sm }}>
                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.white, opacity: 0.9 }}>
                            {t('grades.reportCard')}
                        </Text>
                        <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.white, fontWeight: '700' as any }}>
                            {studentName}
                        </Heading>
                        {grades.length > 0 && (
                            <HStack sx={{ gap: Theme.spacing.lg, marginTop: Theme.spacing.sm }}>
                                <VStack sx={{ gap: Theme.spacing.xs }}>
                                    <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.white, opacity: 0.9 }}>
                                        {t('grades.averageMarks')}
                                    </Text>
                                    <Text sx={{ fontSize: Theme.typography.fontSize.xl, fontWeight: '700' as any, color: Theme.colors.white }}>
                                        {averageMarks.toFixed(1)}
                                    </Text>
                                </VStack>
                                {showGPA && (
                                    <VStack sx={{ gap: Theme.spacing.xs }}>
                                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.white, opacity: 0.9 }}>
                                            {t('grades.overallGPA')}
                                        </Text>
                                        <Text sx={{ fontSize: Theme.typography.fontSize.xl, fontWeight: '700' as any, color: Theme.colors.white }}>
                                            {overallGPA.toFixed(2)}
                                        </Text>
                                    </VStack>
                                )}
                            </HStack>
                        )}
                    </VStack>
                </Box>

                {/* Assignments List */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <Heading sx={{ fontSize: Theme.typography.fontSize.md, color: Theme.colors.charcoalTruth, fontWeight: '700' as any }}>
                        {t('grades.assignments')}
                    </Heading>

                    {grades.length === 0 ? (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl * 2,
                                backgroundColor: Theme.colors.lotusWhite,
                                borderRadius: Theme.corners.comfortable,
                                alignItems: 'center',
                            }}
                        >
                            <Text sx={{ color: Theme.colors.slateGray, textAlign: 'center' }}>
                                {t('grades.noAssignments')}
                            </Text>
                        </Box>
                    ) : (
                        grades.map((grade) => {
                            const { grade: letterGrade, gpa } = marksToGPA(grade.marks);
                            const assignmentName = grade.assignment_id
                                ? (assignmentNames[grade.assignment_id] || t('grades.assignment'))
                                : t('grades.assignment');

                            return (
                                <Box
                                    key={grade.id}
                                    sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.lotusWhite,
                                        borderRadius: Theme.corners.comfortable,
                                        ...Theme.shadows.sm,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.sanctuarySaffron,
                                    }}
                                >
                                    <VStack sx={{ gap: Theme.spacing.md }}>
                                        {/* Assignment Header */}
                                        <HStack sx={{ gap: Theme.spacing.md, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <VStack sx={{ gap: Theme.spacing.xs, flex: 1 }}>
                                                <Text sx={{ fontSize: Theme.typography.fontSize.md, fontWeight: '700' as any, color: Theme.colors.charcoalTruth }}>
                                                    {assignmentName}
                                                </Text>
                                                <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.slateGray }}>
                                                    {new Date(grade.graded_at).toLocaleDateString()}
                                                </Text>
                                            </VStack>

                                            {/* Grade Display */}
                                            <VStack sx={{ gap: Theme.spacing.xs, alignItems: 'flex-end' }}>
                                                <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                                    <Text sx={{ fontSize: 24, fontWeight: '700' as any, color: Theme.colors.charcoalTruth }}>
                                                        {grade.marks}
                                                    </Text>
                                                    <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.slateGray }}>
                                                        /100
                                                    </Text>
                                                </HStack>
                                                {showGPA && (
                                                    <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                                        <Box
                                                            sx={{
                                                                paddingHorizontal: Theme.spacing.sm,
                                                                paddingVertical: Theme.spacing.xs,
                                                                backgroundColor: Theme.colors.sanctuarySaffron,
                                                                borderRadius: Theme.corners.tight,
                                                            }}
                                                        >
                                                            <Text sx={{ fontSize: Theme.typography.fontSize.sm, fontWeight: '700' as any, color: Theme.colors.white }}>
                                                                {letterGrade}
                                                            </Text>
                                                        </Box>
                                                        <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.slateGray }}>
                                                            {gpa.toFixed(1)} {t('grades.gpa')}
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
                                                    backgroundColor: Theme.colors.creamSilence,
                                                    borderRadius: Theme.corners.tight,
                                                    alignSelf: 'flex-start',
                                                }}
                                            >
                                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.sanctuarySaffron, fontWeight: '700' as any }}>
                                                    {t('grades.rankInClass', { rank: grade.rank })}
                                                </Text>
                                            </Box>
                                        )}

                                        {/* Feedback */}
                                        {grade.feedback && (
                                            <VStack sx={{ gap: Theme.spacing.xs }}>
                                                <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700' as any, color: Theme.colors.slateGray }}>
                                                    {t('grades.feedback')}:
                                                </Text>
                                                <Text sx={{ fontSize: Theme.typography.fontSize.sm, color: Theme.colors.charcoalTruth }}>
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
