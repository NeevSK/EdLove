/**
 * REPORT CARD COMPONENT
 * 
 * Displays a student's report card with all their grades.
 * Features:
 * - Student info header
 * - List of assignments with grades
 * - Overall GPA calculation
 * - Uses SanctuaryCard for each assignment
 */

import React, { useMemo } from 'react';
import {
    VStack,
    HStack,
    Text,
    Heading,
    Box,
    ScrollView,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { StudentGrade } from '../../types/Grade';
import { marksToGPA } from '../../utils/grading';
import { Theme } from '../../constants/Theme';

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
            <VStack space="lg" p="$4">
                {/* Student Info Header */}
                <Box
                    p="$5"
                    sx={{
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.generous,
                        ...Theme.shadows.md,
                    }}
                >
                    <VStack space="sm">
                        <Text size="sm" color={Theme.colors.white} opacity={0.9}>
                            {t('grades.reportCard')}
                        </Text>
                        <Heading size="xl" color={Theme.colors.white}>
                            {studentName}
                        </Heading>
                        {grades.length > 0 && (
                            <HStack space="lg" mt="$2">
                                <VStack space="xs">
                                    <Text size="xs" color={Theme.colors.white} opacity={0.9}>
                                        {t('grades.averageMarks')}
                                    </Text>
                                    <Text size="xl" bold color={Theme.colors.white}>
                                        {averageMarks.toFixed(1)}
                                    </Text>
                                </VStack>
                                {showGPA && (
                                    <VStack space="xs">
                                        <Text size="xs" color={Theme.colors.white} opacity={0.9}>
                                            {t('grades.overallGPA')}
                                        </Text>
                                        <Text size="xl" bold color={Theme.colors.white}>
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
                    <Heading size="md" color={Theme.colors.charcoalTruth}>
                        {t('grades.assignments')}
                    </Heading>

                    {grades.length === 0 ? (
                        <Box
                            p="$8"
                            sx={{
                                backgroundColor: Theme.colors.lotusWhite,
                                borderRadius: Theme.corners.comfortable,
                                alignItems: 'center',
                            }}
                        >
                            <Text color={Theme.colors.slateGray} textAlign="center">
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
                                    p="$4"
                                    sx={{
                                        backgroundColor: Theme.colors.lotusWhite,
                                        borderRadius: Theme.corners.comfortable,
                                        ...Theme.shadows.sm,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.sanctuarySaffron,
                                    }}
                                >
                                    <VStack space="md">
                                        {/* Assignment Header */}
                                        <HStack space="md" justifyContent="space-between" alignItems="flex-start">
                                            <VStack space="xs" sx={{ flex: 1 }}>
                                                <Text size="md" bold color={Theme.colors.charcoalTruth}>
                                                    {assignmentName}
                                                </Text>
                                                <Text size="xs" color={Theme.colors.slateGray}>
                                                    {new Date(grade.graded_at).toLocaleDateString()}
                                                </Text>
                                            </VStack>

                                            {/* Grade Display */}
                                            <VStack space="xs" alignItems="flex-end">
                                                <HStack space="xs" alignItems="center">
                                                    <Text size="2xl" bold color={Theme.colors.charcoalTruth}>
                                                        {grade.marks}
                                                    </Text>
                                                    <Text size="sm" color={Theme.colors.slateGray}>
                                                        /100
                                                    </Text>
                                                </HStack>
                                                {showGPA && (
                                                    <HStack space="xs" alignItems="center">
                                                        <Box
                                                            px="$2"
                                                            py="$1"
                                                            sx={{
                                                                backgroundColor: Theme.colors.sanctuarySaffron,
                                                                borderRadius: Theme.corners.tight,
                                                            }}
                                                        >
                                                            <Text size="sm" bold color={Theme.colors.white}>
                                                                {letterGrade}
                                                            </Text>
                                                        </Box>
                                                        <Text size="sm" color={Theme.colors.slateGray}>
                                                            {gpa.toFixed(1)} {t('grades.gpa')}
                                                        </Text>
                                                    </HStack>
                                                )}
                                            </VStack>
                                        </HStack>

                                        {/* Rank Badge */}
                                        {showRanks && grade.rank && (
                                            <Box
                                                px="$3"
                                                py="$2"
                                                sx={{
                                                    backgroundColor: Theme.colors.creamSilence,
                                                    borderRadius: Theme.corners.tight,
                                                    alignSelf: 'flex-start',
                                                }}
                                            >
                                                <Text size="sm" color={Theme.colors.sanctuarySaffron} bold>
                                                    {t('grades.rankInClass', { rank: grade.rank })}
                                                </Text>
                                            </Box>
                                        )}

                                        {/* Feedback */}
                                        {grade.feedback && (
                                            <VStack space="xs">
                                                <Text size="xs" bold color={Theme.colors.slateGray}>
                                                    {t('grades.feedback')}:
                                                </Text>
                                                <Text size="sm" color={Theme.colors.charcoalTruth}>
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
