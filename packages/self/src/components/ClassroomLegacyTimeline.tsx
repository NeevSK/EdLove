import { View, Text, ScrollView } from 'react-native';
import { useClassroomLegacyHistory } from '@repo/profile';
import { WorldSkeleton } from '@repo/ui/components/native';
import { Award, Calendar, School, User, Users } from '@repo/ui/icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

type ClassroomLegacyRecord = {
  id: string;
  academic_year: string;
  avg_performance?: number | null;
  teacher_name?: string | null;
  student_count: number;
  top_achievements: string[];
};

interface ClassroomLegacyTimelineProps {
  classroomId: string;
}

export default function ClassroomLegacyTimeline({ classroomId }: ClassroomLegacyTimelineProps) {
  const { data: history, isLoading } = useClassroomLegacyHistory(classroomId);

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
        <School size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          The classroom lineage is waiting to be explored.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View space="lg" className="pb-10">
        {history.map((record: ClassroomLegacyRecord, index: number) => (
          <Animated.View key={record.id} entering={FadeInRight.delay(index * 100)}>
            <View className="p-6 rounded-[32px] bg-white/3 border border-white/5 overflow-hidden">
              {/* Glossy Background Accent */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

              <View className="flex-row items-center justify-between items-start mb-4">
                <View className="gap-1 flex-1">
                  <View className="flex-row items-center gap-2 items-center">
                    <Calendar size={14} className="text-emerald-400" />
                    <Text className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                      {record.academic_year}
                    </Text>
                  </View>
                  <Text className="text-xl text-sacredWhite font-black tracking-tight">
                    Cohort Legacy
                  </Text>
                </View>

                <View className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 items-center">
                  <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest mb-0.5">
                    Cohort Perf
                  </Text>
                  <Text className="text-lg text-emerald-400 font-black">
                    {record.avg_performance ? `${record.avg_performance}%` : 'N/A'}
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                <View className="flex-row items-center gap-3 items-center bg-white/2 p-3 rounded-2xl border border-white/5">
                  <View className="w-8 h-8 rounded-full bg-mistGray/5 items-center justify-center">
                    <User size={14} className="text-mistGray/40" />
                  </View>
                  <View className="gap-0.5">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Lead Teacher
                    </Text>
                    <Text className="text-xs text-mistGray/60 font-bold">
                      {record.teacher_name || 'Sovereign Mentor'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between gap-4">
                  <View className="items-center">
                    <View className="flex-row items-center" space="xs" items-center>
                      <Users size={10} className="text-mistGray/40" />
                      <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                        Students
                      </Text>
                    </View>
                    <Text className="text-xs text-sacredWhite font-bold">
                      {record.student_count}
                    </Text>
                  </View>
                </View>

                {record.top_achievements.length > 0 && (
                  <View className="gap-2 mt-2">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Top Cohort Achievements
                    </Text>
                    <View className="flex-row items-center flex-wrap gap-2">
                      {record.top_achievements.map((achievement: string, i: number) => (
                        <View
                          key={i}
                          className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                        >
                          <View className="flex-row items-center" space="xs" items-center>
                            <Award size={10} className="text-emerald-400" />
                            <Text className="text-[10px] text-emerald-300 font-bold">
                              {achievement}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
