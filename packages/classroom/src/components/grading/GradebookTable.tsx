/**
 * GRADEBOOK TABLE COMPONENT
 *
 * Displays a table of student grades for a classroom.
 */

import { View, Text } from 'react-native';
import {
  type ClassroomGradingSettings,
  calculateRanks,
  marksToGPA,
  type StudentGrade,
} from '@repo/analytics/stats';
import { FlashList } from '@shopify/flash-list';

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
          <View className="gap-0.5">
            <Text className="text-phaseText-primary font-black text-xl">{letterGrade}</Text>
            <Text className="text-phaseText-secondary font-black uppercase text-[9px] tracking-widest opacity-50">
              {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
            </Text>
          </View>
        );
      }

      // both mode
      return (
        <View className="gap-0.5">
          <View className="flex-row items-center gap-2 items-center">
            <Text className="text-phaseText-primary font-black text-lg">{grade.marks}</Text>
            <View className="w-1.5 h-1.5 rounded-full bg-templeGold" />
            <Text className="text-templeGold font-black text-lg">{letterGrade}</Text>
          </View>
          <Text className="text-phaseText-secondary font-black uppercase text-[9px] tracking-widest opacity-50">
            {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
          </Text>
        </View>
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
      <View className="p-16 items-center justify-center">
        <Text className="text-phaseText-secondary font-black uppercase text-[10px] tracking-[0.2em] text-center">
          {t('grades.noGrades') || 'No grades recorded yet'}
        </Text>
      </View>
    ),
    [t],
  );

  return (
    <View className="bg-phase-surface rounded-generous border border-phase-canvas shadow-sm overflow-hidden">
      <View>
        {/* Table Header */}
        <View className="flex-row items-center gap-4 px-6 py-5 bg-phase-canvas/50 border-b border-phase-canvas items-center">
          <View className="flex-[2.5]">
            <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
              {t('grades.student') || 'Student'}
            </Text>
          </View>
          <View className="flex-[2]">
            <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
              {grading_mode === 'marks'
                ? t('grades.marks') || 'Marks'
                : grading_mode === 'gpa'
                  ? t('grades.grade') || 'Grade'
                  : t('grades.marksGrade') || 'Marks / Grade'}
            </Text>
          </View>
          {show_ranks && (
            <View className="flex-1 items-center">
              <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em]">
                {t('grades.rank') || 'Rank'}
              </Text>
            </View>
          )}
        </View>

        {/* Table Body with SanctuaryFlashList */}
        <FlashList
          data={sortedGrades}
          renderItem={renderGradeRow}
          keyExtractor={keyExtractor}
          ListEmptyComponent={EmptyComponent}
        />
      </View>
    </View>
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
    <View
      className={`flex-row items-center gap-4 px-6 py-5 ${index < totalItems - 1 ? 'border-b border-phase-canvas' : ''} ${index % 2 === 0 ? '' : 'bg-phase-canvas/20'}`}
    >
      <View className="flex-[2.5]">
        <Text className="text-phaseText-primary font-black text-base">{studentName}</Text>
      </View>
      <View className="flex-[2]">{renderGradeDisplay(grade)}</View>
      {showRanks && (
        <View className="flex-1 items-center">
          <View className="px-3 py-1.5 bg-templeGold shadow-sm rounded-full">
            <Text className="text-xs font-black text-black">#{grade.rank}</Text>
          </View>
        </View>
      )}
    </View>
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
