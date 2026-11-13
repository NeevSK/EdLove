/**
 * REPORT CARD COMPONENT
 *
 * Displays a student's report card with all their grades.
 */

import { View, Text, ScrollView } from 'react-native';
import { marksToGPA, type StudentGrade } from '@repo/analytics/stats';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
    <ScrollView className="flex-1 bg-phase-world">
      <View className="gap-10 p-6">
        {/* Student Info Header */}
        <View className="p-10 bg-templeGold rounded-generous shadow-xl shadow-templeGold/30 relative overflow-hidden">
          <View className="gap-8 relative z-10">
            <View className="gap-2">
              <Text className="text-[10px] font-black text-black opacity-40 uppercase tracking-[0.25em]">
                {t('grades.reportCard') || 'Report Card'}
              </Text>
              <Text className="text-5xl font-black text-black -ml-1">{studentName}</Text>
            </View>
            {grades.length > 0 && (
              <View className="flex-row items-center gap-12 mt-2">
                <View className="gap-1.5">
                  <Text className="text-[10px] font-black text-black opacity-40 uppercase tracking-[0.15em]">
                    {t('grades.averageMarks') || 'Avg Marks'}
                  </Text>
                  <Text className="text-4xl font-black text-black">{averageMarks.toFixed(1)}</Text>
                </View>
                {showGPA && (
                  <View className="gap-1.5">
                    <Text className="text-[10px] font-black text-black opacity-40 uppercase tracking-[0.15em]">
                      {t('grades.overallGPA') || 'Overall GPA'}
                    </Text>
                    <Text className="text-4xl font-black text-black">{overallGPA.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-black opacity-5" />
        </View>

        {/* Assignments List */}
        <View className="gap-6">
          <View className="gap-1 ml-1 mb-2">
            <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.25em]">
              {t('grades.academicPerformance') || 'Academic Performance'}
            </Text>
            <Text className="text-2xl font-black text-phaseText-primary">
              {t('grades.assignments') || 'Assignments'}
            </Text>
          </View>

          {grades.length === 0 ? (
            <View className="p-16 bg-phase-surface/50 rounded-generous items-center border border-phase-canvas justify-center">
              <Text className="text-phaseText-secondary font-black uppercase text-[10px] tracking-[0.2em] text-center">
                {t('grades.noAssignments') || 'No assignments recorded.'}
              </Text>
            </View>
          ) : (
            grades.map((grade) => {
              const { grade: letterGrade, gpa } = marksToGPA(grade.marks);
              const assignmentName = grade.assignment_id
                ? assignmentNames[grade.assignment_id] || t('grades.assignment') || 'Assignment'
                : t('grades.assignment') || 'Assignment';

              return (
                <View
                  key={grade.id}
                  className="p-7 bg-phase-surface/30 rounded-generous border border-phase-canvas shadow-sm overflow-hidden"
                  style={{
                    borderLeftWidth: 10,
                    borderLeftColor: '#E7C67F', // templeGold
                  }}
                >
                  <View className="gap-8">
                    {/* Assignment Header */}
                    <View className="flex-row items-center justify-between items-start">
                      <View className="gap-2 flex-1 pr-6">
                        <Text className="text-xl font-black text-phaseText-primary line-clamp-1">
                          {assignmentName}
                        </Text>
                        <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.15em] opacity-50">
                          {new Date(grade.created_at).toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>

                      {/* Grade Display */}
                      <View className="gap-2.5 items-end">
                        <View className="flex-row items-center gap-1 items-end">
                          <Text className="text-4xl font-black text-phaseText-primary leading-none -mb-1">
                            {grade.marks}
                          </Text>
                          <Text className="text-xs font-black text-phaseText-secondary mb-1 opacity-40">
                            /100
                          </Text>
                        </View>
                        {showGPA && (
                          <View className="flex-row items-center gap-3 items-center">
                            <View className="px-3 py-1 bg-templeGold shadow-sm shadow-templeGold/10 rounded-full">
                              <Text className="text-[11px] font-black text-black uppercase">
                                {letterGrade}
                              </Text>
                            </View>
                            <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-widest opacity-60">
                              {gpa.toFixed(1)} {t('grades.gpa') || 'GPA'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Rank & Feedback */}
                    <View className="flex-row items-center gap-4 flex-wrap">
                      {showRanks && grade.rank && (
                        <View className="px-5 py-2.5 bg-phaseText-primary rounded-full shadow-sm shadow-black/20 self-start">
                          <View className="flex-row items-center items-center gap-2">
                            <View className="w-1.5 h-1.5 rounded-full bg-templeGold" />
                            <Text className="text-[10px] font-black text-templeGold uppercase tracking-[0.15em]">
                              {t('grades.rankInClass', { rank: grade.rank }) ||
                                `Rank: #${grade.rank}`}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Feedback Area */}
                    {grade.feedback && (
                      <View className="gap-3 p-5 bg-phase-surface rounded-generous border border-dashed border-phase-canvas/60 shadow-inner">
                        <Text className="text-[10px] font-black text-phaseText-tertiary uppercase tracking-[0.2em] opacity-60">
                          {t('grades.teacherFeedback') || 'Teacher Feedback'}
                        </Text>
                        <Text className="text-base font-black italic text-phaseText-primary leading-relaxed opacity-90">
                          "{grade.feedback}"
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}
