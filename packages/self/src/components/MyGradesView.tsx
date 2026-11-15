import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStudentGrades } from '@repo/self/hooks/useStudentGrades';
import { Button , WorldSkeleton } from '@repo/ui/components/native';
import { BookOpen, MessageSquare } from '@repo/ui/icons';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface MyGradesViewProps {
  userId?: string;
}

const GRADE_THRESHOLD_EXCELLENT = 75;
const GRADE_THRESHOLD_PASSING = 50;

const getGradeColorClass = (grade: number): string => {
  if (grade >= GRADE_THRESHOLD_EXCELLENT) return 'text-emeraldGreen';
  if (grade >= GRADE_THRESHOLD_PASSING) return 'text-sanctuarySaffron';
  return 'text-emberRed';
};

const getGradeBgClass = (grade: number): string => {
  if (grade >= GRADE_THRESHOLD_EXCELLENT) return 'bg-emeraldGreen/10 border-emeraldGreen/20';
  if (grade >= GRADE_THRESHOLD_PASSING) return 'bg-sanctuarySaffron/10 border-sanctuarySaffron/20';
  return 'bg-emberRed/10 border-emberRed/20';
};

export default function MyGradesView({ userId }: MyGradesViewProps) {
  const { t } = useTranslation();
  const { grades, isLoading, error, refreshData } = useStudentGrades(userId);

  if (isLoading) {
    return (
      <View className="gap-4 flex-1">
        <WorldSkeleton height={96} />
        <WorldSkeleton height={96} />
        <WorldSkeleton height={96} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-10 bg-white/3 rounded-3xl items-center border border-dashed border-emberRed/30 gap-4">
        <Text className="text-emberRed text-sm font-bold text-center">{error}</Text>
        <Button
          label="Try again"
          variant="secondary"
          onPress={() => void refreshData()}
          accessibilityHint="Attempts to load your latest grades again"
        />
      </View>
    );
  }

  if (!grades.length) {
    return (
      <View className="p-10 bg-white/3 rounded-3xl items-center border border-dashed border-white/5">
        <BookOpen size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          {t('student.noGradesYet') || 'No graded submissions yet.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="gap-4 pb-10">
        {grades.map((item, i) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(i * 50)}>
            <View
              className="p-5 rounded-3xl border border-white/5 bg-white/3 overflow-hidden shadow-sm"
              accessible
              accessibilityLabel={`${item.assignments?.title ?? t('student.unknownAssignment')}, grade ${item.grade}`}
            >
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 gap-2">
                  <View className="gap-0.5">
                    <Text
                      className="text-sacredWhite font-black text-sm tracking-tight"
                      numberOfLines={1}
                    >
                      {item.assignments?.title ?? t('student.unknownAssignment')}
                    </Text>
                    <Text className="text-[10px] text-mistGray/40 font-black uppercase tracking-widest">
                      {item.classrooms?.name ?? 'Unknown Path'}
                    </Text>
                  </View>

                  {!!item.feedback && (
                    <View className="flex-row items-start gap-2 mt-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <MessageSquare size={12} className="text-mistGray/20 mt-1" />
                      <Text
                        className="text-xs text-mistGray/60 font-medium leading-relaxed italic"
                        numberOfLines={3}
                      >
                        {item.feedback}
                      </Text>
                    </View>
                  )}

                  <Text className="text-[9px] text-mistGray/20 font-medium">
                    Submitted {new Date(item.submitted_at).toLocaleDateString()}
                  </Text>
                </View>

                <View className="items-center gap-2">
                  <View
                    className={`w-14 h-14 rounded-2xl items-center justify-center border ${getGradeBgClass(item.grade)}`}
                  >
                    <Text className={`text-xl font-black ${getGradeColorClass(item.grade)}`}>
                      {item.grade}
                    </Text>
                  </View>
                  <View className="bg-white/5 px-2 py-0.5 rounded-md">
                    <Text className="text-[8px] text-mistGray/30 font-black uppercase tracking-widest">
                      Grade
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
