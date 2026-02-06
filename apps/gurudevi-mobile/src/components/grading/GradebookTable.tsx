/**
 * GRADEBOOK TABLE COMPONENT
 * 
 * Displays a table of student grades for a classroom.
 * Features:
 * - Table header: Student | Marks | Grade | Rank
 * - Row for each student with their grade information
 * - Display based on grading mode setting
 * - Wrapped in SanctuaryCard for consistent styling
 */

import React from 'react';
import {
    VStack,
    HStack,
    Text,
    Box,
    ScrollView,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { StudentGrade, ClassroomGradingSettings } from '../../types/Grade';
import { marksToGPA, calculateRanks } from '../../utils/grading';
import { Theme } from '../../constants/Theme';

interface GradebookTableProps {
    grades: StudentGrade[];
    gradingSettings: ClassroomGradingSettings;
    studentNames: { [studentId: string]: string };
}

export default function GradebookTable({
    grades,
    gradingSettings,
    studentNames,
}: GradebookTableProps) {
    const { t } = useTranslation();
    const { grading_mode, show_ranks } = gradingSettings;

    // Calculate ranks if needed
    const gradesWithRanks = show_ranks ? calculateRanks(grades) : grades;

    // Sort by rank (if available) or by marks
    const sortedGrades = [...gradesWithRanks].sort((a, b) => {
        if (show_ranks && a.rank && b.rank) {
            return a.rank - b.rank;
        }
        return b.marks - a.marks;
    });

    const renderGradeDisplay = (grade: StudentGrade) => {
        const { grade: letterGrade, gpa } = marksToGPA(grade.marks);

        if (grading_mode === 'marks') {
            return (
                <Text color={Theme.colors.charcoalTruth} bold>
                    {grade.marks}/100
                </Text>
            );
        }

        if (grading_mode === 'gpa') {
            return (
                <VStack space="xs">
                    <Text color={Theme.colors.sanctuarySaffron} bold size="lg">
                        {letterGrade}
                    </Text>
                    <Text color={Theme.colors.slateGray} size="xs">
                        {gpa.toFixed(1)} {t('grades.gpa')}
                    </Text>
                </VStack>
            );
        }

        // both mode
        return (
            <VStack space="xs">
                <HStack space="xs" alignItems="center">
                    <Text color={Theme.colors.charcoalTruth} bold>
                        {grade.marks}
                    </Text>
                    <Text color={Theme.colors.slateGray}>·</Text>
                    <Text color={Theme.colors.sanctuarySaffron} bold>
                        {letterGrade}
                    </Text>
                </HStack>
                <Text color={Theme.colors.slateGray} size="xs">
                    {gpa.toFixed(1)} {t('grades.gpa')}
                </Text>
            </VStack>
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: Theme.colors.lotusWhite,
                borderRadius: Theme.corners.generous,
                ...Theme.shadows.md,
                overflow: 'hidden',
            }}
        >
            <VStack>
                {/* @ts-ignore */}
                {/* Table Header */}
                <HStack
                    space="md"
                    p="$4"
                    sx={{
                        backgroundColor: Theme.colors.sandStone,
                        borderBottomWidth: 1,
                        borderBottomColor: Theme.colors.stoneGray,
                    }}
                >
                    <Box sx={{ flex: 2 }}>
                        <Text size="sm" bold color={Theme.colors.charcoalTruth}>
                            {t('grades.student')}
                        </Text>
                    </Box>
                    <Box sx={{ flex: 2 }}>
                        <Text size="sm" bold color={Theme.colors.charcoalTruth}>
                            {grading_mode === 'marks'
                                ? t('grades.marks')
                                : grading_mode === 'gpa'
                                    ? t('grades.grade')
                                    : t('grades.marksGrade')}
                        </Text>
                    </Box>
                    {show_ranks && (
                        <Box sx={{ flex: 1, alignItems: 'center' }}>
                            <Text size="sm" bold color={Theme.colors.charcoalTruth}>
                                {t('grades.rank')}
                            </Text>
                        </Box>
                    )}
                </HStack>

                {/* Table Body */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack>
                        {sortedGrades.length === 0 ? (
                            <Box p="$8" alignItems="center">
                                <Text color={Theme.colors.slateGray} textAlign="center">
                                    {t('grades.noGrades')}
                                </Text>
                            </Box>
                        ) : (
                            sortedGrades.map((grade, index) => (
                                <HStack
                                    key={grade.id}
                                    space="md"
                                    p="$4"
                                    sx={{
                                        borderBottomWidth: index < sortedGrades.length - 1 ? 1 : 0,
                                        borderBottomColor: Theme.colors.sandStone,
                                    }}
                                >
                                    <Box sx={{ flex: 2 }}>
                                        <Text color={Theme.colors.charcoalTruth}>
                                            {studentNames[grade.student_id] || t('grades.unknownStudent')}
                                        </Text>
                                    </Box>
                                    <Box sx={{ flex: 2 }}>
                                        {renderGradeDisplay(grade)}
                                    </Box>
                                    {show_ranks && (
                                        <Box sx={{ flex: 1, alignItems: 'center' }}>
                                            <Box
                                                px="$2"
                                                py="$1"
                                                sx={{
                                                    backgroundColor: Theme.colors.sanctuarySaffron,
                                                    borderRadius: Theme.corners.tight,
                                                }}
                                            >
                                                <Text
                                                    size="sm"
                                                    bold
                                                    color={Theme.colors.white}
                                                >
                                                    #{grade.rank}
                                                </Text>
                                            </Box>
                                        </Box>
                                    )}
                                </HStack>
                            ))
                        )}
                    </VStack>
                </ScrollView>
            </VStack>
        </Box>
    );
}
