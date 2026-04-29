/**
 * GRADEBOOK TABLE COMPONENT
 *
 * Displays a table of student grades for a classroom.
 */

import {
  type ClassroomGradingSettings,
  calculateRanks,
  marksToGPA,
  type StudentGrade,
} from '@repo/analytics';
import { Box, HStack, Text, VStack } from '@repo/ui';
import { FlatList } from '@repo/ui/primitives';

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
  const gradesWithRanks = useMemo(
    () => (show_ranks ? (calculateRanks(grades as any) as StudentGrade[]) : grades),
    [grades, show_ranks],
  );

  // Sort by rank (if available) or by marks
  const sortedGrades = useMemo(
    () =>
      [...gradesWithRanks].sort((a, b) => {
        if (show_ranks && a.rank && b.rank) {
          return a.rank - b.rank;
        }
        return b.marks - a.marks;
      }),
    [gradesWithRanks, show_ranks],
  );

  const renderGradeDisplay = useCallback(
    (grade: StudentGrade) => {
      const { grade: letterGrade, gpa } = marksToGPA(grade.marks);

      if (grading_mode === 'marks') {
        return (
          <Text className="text-phaseText-primary font-black text-lg">
            {grade.marks} <Text className="text-[10px] opacity-40 font-black">/ 100</Text>
          </Text>
        );
      }

      if (grading_mode === 'gpa') {
        return (
          <VStack className="gap-0.5">
            <Text className="text-phaseText-primary font-black text-xl">{letterGrade}</Text>
            <Text className="text-phaseText-secondary font-black uppercase text-[9px] tracking-widest opacity-50">
              {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
            </Text>
          </VStack>
        );
      }

      // both mode
      return (
        <VStack className="gap-0.5">
          <HStack className="gap-2 items-center">
            <Text className="text-phaseText-primary font-black text-lg">{grade.marks}</Text>
            <Box className="w-1.5 h-1.5 rounded-full bg-templeGold" />
            <Text className="text-templeGold font-black text-lg">{letterGrade}</Text>
          </HStack>
          <Text className="text-phaseText-secondary font-black uppercase text-[9px] tracking-widest opacity-50">
            {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
          </Text>
        </VStack>
      );
    },
    [grading_mode, t],
  );

  // Memoized row renderer
  const renderGradeRow = useCallback(
    ({ item: grade, index }: { item: StudentGrade; index: number }) => (
      <GradeRow
        grade={grade}
        index={index}
        totalItems={sortedGrades.length}
        studentName={
          studentNames[grade.student_id] || t('grades.unknownStudent') || 'Unknown Student'
        }
        showRanks={!!show_ranks}
        renderGradeDisplay={renderGradeDisplay}
      />
    ),
    [sortedGrades.length, studentNames, show_ranks, t, renderGradeDisplay],
  );

  // Key extractor
  const keyExtractor = useCallback((item: StudentGrade) => item.id, []);

  // Empty component
  const EmptyComponent = useCallback(
    () => (
      <Box className="p-16 items-center justify-center">
        <Text className="text-phaseText-secondary font-black uppercase text-[10px] tracking-[0.2em] text-center">
          {t('grades.noGrades') || 'No grades recorded yet'}
        </Text>
      </Box>
    ),
    [t],
  );

  return (
    <Box className="bg-phase-surface rounded-generous border border-phase-canvas shadow-sm overflow-hidden">
      <VStack>
        {/* Table Header */}
        <HStack className="gap-4 px-6 py-5 bg-phase-canvas/50 border-b border-phase-canvas items-center">
          <Box className="flex-[2.5]">
            <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
              {t('grades.student') || 'Student'}
            </Text>
          </Box>
          <Box className="flex-[2]">
            <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
              {grading_mode === 'marks'
                ? t('grades.marks') || 'Marks'
                : grading_mode === 'gpa'
                  ? t('grades.grade') || 'Grade'
                  : t('grades.marksGrade') || 'Marks / Grade'}
            </Text>
          </Box>
          {show_ranks && (
            <Box className="flex-1 items-center">
              <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
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
}

const GradeRow = React.memo(
  ({ grade, index, totalItems, studentName, showRanks, renderGradeDisplay }: GradeRowProps) => (
    <HStack
      className={`gap-4 px-6 py-5 items-center ${index < totalItems - 1 ? 'border-b border-phase-canvas' : ''} ${index % 2 === 0 ? '' : 'bg-phase-canvas/20'}`}
    >
      <Box className="flex-[2.5]">
        <Text className="text-phaseText-primary font-black text-base">{studentName}</Text>
      </Box>
      <Box className="flex-[2]">{renderGradeDisplay(grade)}</Box>
      {showRanks && (
        <Box className="flex-1 items-center">
          <Box className="px-3 py-1.5 bg-templeGold shadow-sm rounded-full">
            <Text className="text-xs font-black text-black">#{grade.rank}</Text>
          </Box>
        </Box>
      )}
    </HStack>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.grade.marks === nextProps.grade.marks &&
      prevProps.grade.rank === nextProps.grade.rank &&
      prevProps.studentName === nextProps.studentName &&
      prevProps.showRanks === nextProps.showRanks
    );
  },
);
