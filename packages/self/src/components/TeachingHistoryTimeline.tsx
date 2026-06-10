import { useTeacherProfessionalHistory } from '@repo/profile';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Box, HStack, Icon, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { Award, BookOpen, Calendar, School, Users } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

type TeachingHistoryRecord = {
  id: string;
  academic_year: string;
  designation: string;
  avg_classroom_performance?: number | null;
  school_name?: string | null;
  subjects: string[];
  classrooms_count: number;
  students_count: number;
  achievements: string[];
};

interface TeachingHistoryTimelineProps {
  userId: string;
}

export default function TeachingHistoryTimeline({ userId }: TeachingHistoryTimelineProps) {
  const { data: history, isLoading } = useTeacherProfessionalHistory(userId);

  if (isLoading) {
    return (
      <VStack space="md">
        <SkeletonCard height={100} />
        <SkeletonCard height={100} />
      </VStack>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Box className="p-10 bg-white/3 rounded-3xl items-center border border-dashed border-white/5">
        <Icon as={BookOpen} size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          Your professional saga is just beginning.
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <VStack space="lg" className="pb-10">
        {history.map((record: TeachingHistoryRecord, index: number) => (
          <Animated.View key={record.id} entering={FadeInRight.delay(index * 100)}>
            <Box className="p-6 rounded-[32px] bg-white/3 border border-white/5 overflow-hidden">
              {/* Glossy Background Accent */}
              <Box className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl" />

              <HStack className="justify-between items-start mb-4">
                <VStack className="gap-1 flex-1">
                  <HStack className="gap-2 items-center">
                    <Icon as={Calendar} size={14} className="text-violet-400" />
                    <Text className="text-[10px] text-violet-400 font-black uppercase tracking-widest">
                      {record.academic_year}
                    </Text>
                  </HStack>
                  <Text className="text-xl text-sacredWhite font-black tracking-tight">
                    {record.designation}
                  </Text>
                </VStack>

                <Box className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 items-center">
                  <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest mb-0.5">
                    Avg Class Perf
                  </Text>
                  <Text className="text-lg text-violet-400 font-black">
                    {record.avg_classroom_performance
                      ? `${record.avg_classroom_performance}%`
                      : 'N/A'}
                  </Text>
                </Box>
              </HStack>

              <VStack className="gap-4">
                <HStack className="gap-3 items-center bg-white/2 p-3 rounded-2xl border border-white/5">
                  <Box className="w-8 h-8 rounded-full bg-mistGray/5 items-center justify-center">
                    <Icon as={School} size={14} className="text-mistGray/40" />
                  </Box>
                  <VStack className="gap-0.5">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Institution
                    </Text>
                    <Text className="text-xs text-mistGray/60 font-bold">
                      {record.school_name || 'Sovereign Learning Center'}
                    </Text>
                  </VStack>
                </HStack>

                <HStack className="justify-between gap-4">
                  <VStack className="flex-1 gap-1">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Expertise
                    </Text>
                    <Text className="text-xs text-sacredWhite/80 font-medium">
                      {record.subjects.join(', ') || 'General Education'}
                    </Text>
                  </VStack>

                  <HStack className="gap-4">
                    <VStack className="items-center">
                      <HStack space="xs" items-center>
                        <Icon as={BookOpen} size={10} className="text-mistGray/40" />
                        <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                          Classes
                        </Text>
                      </HStack>
                      <Text className="text-xs text-sacredWhite font-bold">
                        {record.classrooms_count}
                      </Text>
                    </VStack>
                    <VStack className="items-center">
                      <HStack space="xs" items-center>
                        <Icon as={Users} size={10} className="text-mistGray/40" />
                        <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                          Students
                        </Text>
                      </HStack>
                      <Text className="text-xs text-violet-400 font-bold">
                        {record.students_count}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>

                {record.achievements.length > 0 && (
                  <VStack className="gap-2 mt-2">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Key Milestones
                    </Text>
                    <HStack className="flex-wrap gap-2">
                      {record.achievements.map((achievement: string, i: number) => (
                        <Box
                          key={i}
                          className="bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20"
                        >
                          <HStack space="xs" items-center>
                            <Icon as={Award} size={10} className="text-violet-400" />
                            <Text className="text-[10px] text-violet-300 font-bold">
                              {achievement}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Box>
          </Animated.View>
        ))}
      </VStack>
    </ScrollView>
  );
}
