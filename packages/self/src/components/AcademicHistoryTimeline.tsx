import { View, Text, ScrollView } from 'react-native';
import { useStudentAcademicHistory } from '@repo/profile';
import { WorldSkeleton } from '@repo/ui/components/native';
import { Calendar, GraduationCap, School } from '@repo/ui/icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

type AcademicRecord = {
  id: string;
  academic_year: string;
  grade_number?: number | null;
  avg_grade?: number | null;
  school_id: string;
  subject?: string | null;
  assignments_submitted: number;
  assignments_total: number;
  highest_grade?: number | null;
};

interface AcademicHistoryTimelineProps {
  userId: string;
}

export default function AcademicHistoryTimeline({ userId }: AcademicHistoryTimelineProps) {
  const { data: history, isLoading } = useStudentAcademicHistory(userId);

  if (isLoading) {
    return (
      <View space="md">
        <WorldSkeleton height={100} />
        <WorldSkeleton height={100} />
      </View>
    );
  }

  if (!history || history.length === 0) {
    return (
      <View className="p-10 bg-white/3 rounded-3xl items-center border border-dashed border-white/5">
        <GraduationCap size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          Your academic journey is just beginning.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View space="lg" className="pb-10">
        {history.map((record: AcademicRecord, index: number) => (
          <Animated.View key={record.id} entering={FadeInRight.delay(index * 100)}>
            <View className="p-6 rounded-[32px] bg-white/3 border border-white/5 overflow-hidden">
              {/* Glossy Background Accent */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-emeraldGreen/5 rounded-full blur-3xl" />

              <View className="flex-row items-center justify-between items-start mb-4">
                <View className="gap-1 flex-1">
                  <View className="flex-row items-center gap-2 items-center">
                    <Calendar size={14} className="text-emeraldGreen" />
                    <Text className="text-[10px] text-emeraldGreen font-black uppercase tracking-widest">
                      {record.academic_year}
                    </Text>
                  </View>
                  <Text className="text-xl text-sacredWhite font-black tracking-tight">
                    Grade {record.grade_number}
                  </Text>
                </View>

                <View className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 items-center">
                  <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest mb-0.5">
                    Avg Score
                  </Text>
                  <Text className="text-lg text-emeraldGreen font-black">{record.avg_grade}%</Text>
                </View>
              </View>

              <View className="gap-4">
                <View className="flex-row items-center gap-3 items-center bg-white/2 p-3 rounded-2xl border border-white/5">
                  <View className="w-8 h-8 rounded-full bg-mistGray/5 items-center justify-center">
                    <School size={14} className="text-mistGray/40" />
                  </View>
                  <View className="gap-0.5">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Institution
                    </Text>
                    <Text className="text-xs text-mistGray/60 font-bold">
                      {/* In a real app, we'd join with School name */}
                      {record.school_id.split('-')[0]}... Educational Sanctuary
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-1 gap-1">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Growth Path
                    </Text>
                    <Text className="text-xs text-sacredWhite/80 font-medium">
                      {record.subject || 'Holistic Development'}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="items-center">
                      <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                        Tasks
                      </Text>
                      <Text className="text-xs text-sacredWhite font-bold">
                        {record.assignments_submitted}/{record.assignments_total}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                        Peak
                      </Text>
                      <Text className="text-xs text-emeraldGreen font-bold">
                        {record.highest_grade}%
                      </Text>
                    </View>
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
