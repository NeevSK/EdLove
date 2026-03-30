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
import { StudentGrade, ClassroomGradingSettings, marksToGPA, calculateRanks } from '@repo/analytics';

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
    const gradesWithRanks = useMemo(() =
        show_ranks ? (calculateRanks(grades) as any[] as StudentGrade[]) : grades,
        [grades, show_ranks]
    );

    // Sort by rank (if available) or by marks
    const sortedGrades = useMemo(() =
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
                <Text sx={{ color: Theme.colors.inkTruth, fontWeight: '700' }}
                    {grade.marks}/>100
                </Text>
            );
        }

        if (grading_mode === 'gpa') {
            return (
                <VStack space="xs"
                    <Text sx={{ color: Theme.colors.starlightGray, fontWeight: '700' }} size="lg">
                        {letterGrade}
                    </Text>
                    <Text sx={{ color: Theme.colors.starlightGray }} size="xs"
                        {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}>
                    </Text>
                </VStack>
            );
        }

        // both mode
        return (
            <VStack space="xs"
                <HStack space="xs" sx={{ alignItems: 'center' }}>
                    <Text sx={{ color: Theme.colors.inkTruth, fontWeight: '700' }}
                        {grade.marks}>
                    </Text>
                    <Text sx={{ color: Theme.colors.starlightGray }}>\u00B7</Text
                    ><Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}
                        {letterGrade}
                    </Text>
                </HStack>
                <Text sx={{ color: Theme.colors.starlightGray }} size="xs"
                    {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}>
                </Text>
            </VStack>
        );
    }, [grading_mode, t]);

    // Memoized row renderer
    const renderGradeRow = useCallback(({ item: grade, index }: ListRenderItemInfo<StudentGrade>) => (
        <GradeRow
            grade={grade}
            index={index}
            totalItems={sortedGrades.length}
            studentName={studentNames[grade.student_id] || t('grades.unknownStudent') || 'Unknown Student'}
            showRanks={show_ranks}
            renderGradeDisplay={renderGradeDisplay}
        /
    >), [sortedGrades.length, studentNames, show_ranks, t, renderGradeDisplay]);

    // Key extractor
    const keyExtractor = useCallback((item: StudentGrade) => item.id, []);

    // Empty component
    const EmptyComponent = useCallback(() => (
        <Box space="xl" sx={{ padding: Theme.spacing.xl, alignItems: 'center' }}
            <Text sx={{ color: Theme.colors.starlightGray, textAlign: 'center' }}>
                {t('grades.noGrades') || 'No grades recorded yet'}
            </Text>
        </Box>
    ), [t]);

    return (
        <Box
            sx={{
                backgroundColor: Theme.colors.sacredWhite,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: Theme.colors.linen,
                ...Theme.shadows.md,
                overflow: 'hidden',>
            }}
        
            <VStack
                {/* Table Header */}>
                <HStack
                    space="md"
                    sx={{
                        padding: Theme.spacing.md,
                        backgroundColor: Theme.colors.linen,
                        borderBottomWidth: 1,
                        borderBottomColor: Theme.colors.mistGray,>
                    }}
                
                    <Box sx={{ flex: 2 }}
                        <Text size="sm" sx={{ fontWeight: '700', color: Theme.colors.inkTruth }}>
                            {t('grades.student') || 'Student'}
                        </Text>
                    </Box>
                    <Box sx={{ flex: 2 }}
                        <Text size="sm" sx={{ fontWeight: '700', color: Theme.colors.inkTruth }}>
                            {grading_mode === 'marks'
                                ? t('grades.marks') || 'Marks'
                                : grading_mode === 'gpa'
                                    ? t('grades.grade') || 'Grade'
                                    : t('grades.marksGrade') || 'Marks / Grade'}
                        </Text>
                    </Box>
                    {show_ranks && (
                        <Box sx={{ flex: 1, alignItems: 'center' }}
                            <Text size="sm" sx={{ fontWeight: '700', color: Theme.colors.inkTruth }}>
                                {t('grades.rank') || 'Rank'}
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
                /
            ></VStack
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
}

const GradeRow = React.memo(({
    grade,
    index,
    totalItems,
    studentName,
    showRanks,
    renderGradeDisplay,
}: GradeRowProps) => (
    <HStack
        space="md"
        sx={{
            padding: Theme.spacing.md,
            borderBottomWidth: index < totalItems - 1 ? 1 : 0,
            borderBottomColor: Theme.colors.linen,
            backgroundColor: index % 2 === 0 ? Theme.colors.sacredWhite : Theme.colors.silk,>
        }}
    
        <Box sx={{ flex: 2 }}
            <Text sx={{ color: Theme.colors.inkTruth }}>
                {studentName}
            </Text>
        </Box>
        <Box sx={{ flex: 2 }}
            <>{renderGradeDisplay(grade)}</
        </Box>
        {showRanks && (
            <Box sx={{ flex: 1, alignItems: 'center' }}
                <Box
                    sx={{
                        paddingHorizontal: Theme.spacing.sm,
                        paddingVertical: Theme.spacing.xs,
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.tight,>
                    }}
                
                    <Text
                        size="sm"
                        sx={{
                            fontWeight: '700',
                            color: Theme.colors.white>
                        }}
                    
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
        prevProps.showRanks === nextProps.showRanks
    );
});
