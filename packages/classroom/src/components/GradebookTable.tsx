/**
 * GRADEBOOK TABLE COMPONENT
 * 
 * Displays a table of student grades for a classroom.
 */

import React, { useMemo, useCallback } from 'react';
import {
    VStack,
    HStack,
    Text,
    Box,
    Theme,
    useThemedColors,
} from '@repo/ui';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StudentGrade, ClassroomGradingSettings, marksToGPA, calculateRanks } from '@repo/core';

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
    const colors = useThemedColors();
    const { grading_mode, show_ranks } = gradingSettings;

    // Calculate ranks if needed
    const gradesWithRanks = show_ranks ? (calculateRanks(grades) as any[] as StudentGrade[]) : grades;

    // Sort by rank (if available) or by marks
    const sortedGrades = useMemo(() =>
        [...gradesWithRanks].sort((a, b) => {
            if (show_ranks && a.rank && b.rank) {
                return a.rank - b.rank;
            }
            return b.marks - a.marks;
        }),
        [gradesWithRanks, show_ranks]
    );

    const renderGradeDisplay = useCallback((grade: StudentGrade) => {
        const { grade: letterGrade, gpa } = marksToGPA(grade.marks);

        if (grading_mode === 'marks') {
            return (
                <Text sx={{ color: colors.text, fontWeight: '700' }}>
                    {grade.marks}/100
                </Text>
            );
        }

        if (grading_mode === 'gpa') {
            return (
                <VStack sx={{ gap: Theme.spacing.xs }}>
                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700', fontSize: Theme.typography.fontSize.lg }}>
                        {letterGrade}
                    </Text>
                    <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                        {gpa.toFixed(1)} {t('grading.gradebook.gpaLabel') || 'GPA'}
                    </Text>
                </VStack>
            );
        }

        // both mode
        return (
            <VStack sx={{ gap: Theme.spacing.xs }}>
                <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                    <Text sx={{ color: colors.text, fontWeight: '700' }}>
                        {grade.marks}
                    </Text>
                    <Text sx={{ color: colors.textTertiary }}>·</Text>
                    <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>
                        {letterGrade}
                    </Text>
                </HStack>
                <Text sx={{ color: colors.textSecondary, fontSize: Theme.typography.fontSize.xs }}>
                    {gpa.toFixed(1)} {t('grading.gradebook.gpaLabel') || 'GPA'}
                </Text>
            </VStack>
        );
    }, [grading_mode, t, colors]);

    // Memoized row renderer
    const renderGradeRow = useCallback(({ item: grade, index }: ListRenderItemInfo<StudentGrade>) => (
        <GradeRow
            grade={grade}
            index={index}
            totalItems={sortedGrades.length}
            studentName={studentNames[grade.student_id] || t('grading.gradebook.unknownStudent') || 'Unknown Student'}
            showRanks={show_ranks}
            renderGradeDisplay={renderGradeDisplay}
            colors={colors}
        />
    ), [sortedGrades.length, studentNames, show_ranks, t, renderGradeDisplay, colors]);

    // Key extractor
    const keyExtractor = useCallback((item: StudentGrade) => item.id, []);

    // Empty component
    const EmptyComponent = useCallback(() => (
        <Box sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}>
            <Text sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                {t('grading.gradebook.noGrades') || 'No grades recorded yet'}
            </Text>
        </Box>
    ), [t, colors]);

    return (
        <Box
            sx={{
                backgroundColor: colors.secondary,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: colors.border,
                ...Theme.shadows.sm,
                overflow: 'hidden',
            }}
        >
            <VStack>
                {/* Table Header */}
                <HStack
                    sx={{
                        gap: Theme.spacing.md,
                        padding: Theme.spacing.md,
                        backgroundColor: colors.tertiary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    }}
                >
                    <Box sx={{ flex: 2 }}>
                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' }}>
                            {t('grading.gradebook.studentHeader') || 'Student'}
                        </Text>
                    </Box>
                    <Box sx={{ flex: 2 }}>
                        <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' }}>
                            {grading_mode === 'marks'
                                ? t('grading.gradebook.marksHeader') || 'Marks'
                                : grading_mode === 'gpa'
                                    ? t('grading.gradebook.gradeHeader') || 'Grade'
                                    : t('grading.gradebook.marksGradeHeader') || 'Marks / Grade'}
                        </Text>
                    </Box>
                    {show_ranks && (
                        <Box sx={{ flex: 1, alignItems: 'center' }}>
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' }}>
                                {t('grading.gradebook.rankHeader') || 'Rank'}
                            </Text>
                        </Box>
                    )}
                </HStack>

                {/* Table Body with FlatList */}
                <FlatList
                    data={sortedGrades}
                    renderItem={renderGradeRow}
                    keyExtractor={keyExtractor}
                    ListEmptyComponent={EmptyComponent}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                />
            </VStack>
        </Box>
    );
}

// Memoized GradeRow component
interface GradeRowProps {
    grade: StudentGrade;
    index: number;
    totalItems: number;
    studentName: string;
    showRanks: boolean;
    renderGradeDisplay: (grade: StudentGrade) => React.ReactElement | null;
    colors: any;
}

const GradeRow = React.memo(({
    grade,
    index,
    totalItems,
    studentName,
    showRanks,
    renderGradeDisplay,
    colors
}: GradeRowProps) => (
    <HStack
        sx={{
            gap: Theme.spacing.md,
            padding: Theme.spacing.md,
            borderBottomWidth: index < totalItems - 1 ? 1 : 0,
            borderBottomColor: colors.border,
            backgroundColor: index % 2 === 0 ? colors.secondary : colors.tertiary,
        }}
    >
        <Box sx={{ flex: 2 }}>
            <Text sx={{ color: colors.text, fontWeight: '700' }}>
                {studentName}
            </Text>
        </Box>
        <Box sx={{ flex: 2 }}>
            <>{renderGradeDisplay(grade)}</>
        </Box>
        {showRanks && (
            <Box sx={{ flex: 1, alignItems: 'center' }}>
                <Box
                    sx={{
                        paddingHorizontal: Theme.spacing.sm,
                        paddingVertical: Theme.spacing.xs,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.full,
                    }}
                >
                    <Text
                        sx={{
                            fontSize: Theme.typography.fontSize.xs,
                            fontWeight: '700',
                            color: Theme.colors.white
                        }}
                    >
                        #{grade.rank}
                    </Text>
                </Box>
            </Box>
        )}
    </HStack>
), (prevProps, nextProps) => {
    return (
        prevProps.grade.id === nextProps.grade.id &&
        prevProps.grade.marks === nextProps.grade.marks &&
        prevProps.grade.rank === nextProps.grade.rank &&
        prevProps.studentName === nextProps.studentName &&
        prevProps.showRanks === nextProps.showRanks &&
        prevProps.colors === nextProps.colors
    );
});
