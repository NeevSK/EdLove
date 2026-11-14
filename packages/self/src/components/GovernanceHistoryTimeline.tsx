import { View, Text, ScrollView } from 'react-native';
import { usePrincipalGovernanceHistory } from '@repo/profile';
import { WorldSkeleton } from '@repo/ui/components/native';
import { Award, Calendar, School, Shield, TrendingUp, UserPlus, Users } from '@repo/ui/icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

type GovernanceRecord = {
  id: string;
  academic_year: string;
  capacity: string;
  institutional_growth_score?: number | null;
  school_name?: string | null;
  staff_count: number;
  student_count: number;
  key_initiatives: string[];
};

interface GovernanceHistoryTimelineProps {
  userId: string;
}

export default function GovernanceHistoryTimeline({ userId }: GovernanceHistoryTimelineProps) {
  const { data: history, isLoading } = usePrincipalGovernanceHistory(userId);

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
        <Shield size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          Your leadership saga is just beginning.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View space="lg" className="pb-10">
        {history.map((record: GovernanceRecord, index: number) => (
          <Animated.View key={record.id} entering={FadeInRight.delay(index * 100)}>
            <View className="p-6 rounded-[32px] bg-white/3 border border-white/5 overflow-hidden">
              {/* Glossy Background Accent */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />

              <View className="flex-row items-center justify-between items-start mb-4">
                <View className="gap-1 flex-1">
                  <View className="flex-row items-center gap-2 items-center">
                    <Calendar size={14} className="text-amber-400" />
                    <Text className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                      {record.academic_year}
                    </Text>
                  </View>
                  <Text className="text-xl text-sacredWhite font-black tracking-tight">
                    {record.capacity}
                  </Text>
                </View>

                <View className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 items-center">
                  <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest mb-0.5">
                    Growth Score
                  </Text>
                  <Text className="text-lg text-amber-400 font-black">
                    {record.institutional_growth_score
                      ? `+${record.institutional_growth_score}%`
                      : 'N/A'}
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                <View className="flex-row items-center gap-3 items-center bg-white/2 p-3 rounded-2xl border border-white/5">
                  <View className="w-8 h-8 rounded-full bg-mistGray/5 items-center justify-center">
                    <School size={14} className="text-mistGray/40" />
                  </View>
                  <View className="gap-0.5">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Institution Led
                    </Text>
                    <Text className="text-xs text-mistGray/60 font-bold">
                      {record.school_name || 'Sovereign Academy'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-row items-center gap-4">
                    <View className="items-center">
                      <View className="flex-row items-center" space="xs" items-center>
                        <UserPlus size={10} className="text-mistGray/40" />
                        <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                          Staff
                        </Text>
                      </View>
                      <Text className="text-xs text-sacredWhite font-bold">
                        {record.staff_count}
                      </Text>
                    </View>
                    <View className="items-center">
                      <View className="flex-row items-center" space="xs" items-center>
                        <Users size={10} className="text-mistGray/40" />
                        <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                          Students
                        </Text>
                      </View>
                      <Text className="text-xs text-amber-400 font-bold">
                        {record.student_count}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <View className="flex-row items-center" space="xs" items-center>
                      <TrendingUp size={10} className="text-amber-400" />
                      <Text className="text-[8px] text-amber-400 font-black uppercase tracking-widest">
                        Vitality
                      </Text>
                    </View>
                    <Text className="text-xs text-sacredWhite/60 font-medium">
                      Architect of Growth
                    </Text>
                  </View>
                </View>

                {record.key_initiatives.length > 0 && (
                  <View className="gap-2 mt-2">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Governance Initiatives
                    </Text>
                    <View className="flex-row items-center flex-wrap gap-2">
                      {record.key_initiatives.map((initiative: string, i: number) => (
                        <View
                          key={i}
                          className="bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20"
                        >
                          <View className="flex-row items-center" space="xs" items-center>
                            <Award size={10} className="text-amber-400" />
                            <Text className="text-[10px] text-amber-300 font-bold">
                              {initiative}
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
