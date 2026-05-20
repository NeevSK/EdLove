import { useSchoolLegacyHistory } from '@repo/profile';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Box, HStack, Icon, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { Award, Book, Calendar, School, ShieldAlert, TrendingUp, Users } from 'lucide-react-native';
import React from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';

type SchoolLegacyRecord = {
  id: string;
  academic_year: string;
  avg_performance?: number | null;
  total_students: number;
  total_staff: number;
  graduation_rate?: number | null;
  milestones: string[];
  leadership?: { principal_name?: string | null } | null;
};

interface SchoolLegacyTimelineProps {
  schoolId: string;
}

export default function SchoolLegacyTimeline({ schoolId }: SchoolLegacyTimelineProps) {
  const { data: history, isLoading } = useSchoolLegacyHistory(schoolId);

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
        <Icon as={Book} size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          The institutional memory is currently being written.
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <VStack space="lg" className="pb-10">
        {history.map((record: SchoolLegacyRecord, index: number) => (
          <Animated.View key={record.id} entering={FadeInRight.delay(index * 100)}>
            <Box className="p-6 rounded-[32px] bg-white/3 border border-white/5 overflow-hidden">
              {/* Glossy Background Accent */}
              <Box className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />

              <HStack className="justify-between items-start mb-4">
                <VStack className="gap-1 flex-1">
                  <HStack className="gap-2 items-center">
                    <Icon as={Calendar} size={14} className="text-indigo-400" />
                    <Text className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">
                      {record.academic_year}
                    </Text>
                  </HStack>
                  <Text className="text-xl text-sacredWhite font-black tracking-tight">
                    Institutional Legacy
                  </Text>
                </VStack>

                <Box className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 items-center">
                  <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest mb-0.5">
                    Avg Performance
                  </Text>
                  <Text className="text-lg text-indigo-400 font-black">
                    {record.avg_performance ? `${record.avg_performance}%` : 'N/A'}
                  </Text>
                </Box>
              </HStack>

              <VStack className="gap-4">
                <HStack className="justify-between gap-4">
                  <HStack className="gap-4">
                    <VStack className="items-center">
                      <HStack space="xs" items-center>
                        <Icon as={Users} size={10} className="text-mistGray/40" />
                        <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                          Students
                        </Text>
                      </HStack>
                      <Text className="text-xs text-sacredWhite font-bold">
                        {record.total_students}
                      </Text>
                    </VStack>
                    <VStack className="items-center">
                      <HStack space="xs" items-center>
                        <Icon as={ShieldAlert} size={10} className="text-mistGray/40" />
                        <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                          Staff
                        </Text>
                      </HStack>
                      <Text className="text-xs text-indigo-400 font-bold">
                        {record.total_staff}
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack className="items-end">
                    <HStack space="xs" items-center>
                      <Icon as={TrendingUp} size={10} className="text-indigo-400" />
                      <Text className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">
                        Grad Rate
                      </Text>
                    </HStack>
                    <Text className="text-xs text-sacredWhite/60 font-medium">
                      {record.graduation_rate ? `${record.graduation_rate}%` : 'N/A'}
                    </Text>
                  </VStack>
                </HStack>

                {record.milestones.length > 0 && (
                  <VStack className="gap-2 mt-2">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Institutional Milestones
                    </Text>
                    <HStack className="flex-wrap gap-2">
                      {record.milestones.map((milestone: string, i: number) => (
                        <Box
                          key={i}
                          className="bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"
                        >
                          <HStack space="xs" items-center>
                            <Icon as={Award} size={10} className="text-indigo-400" />
                            <Text className="text-[10px] text-indigo-300 font-bold">
                              {milestone}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {record.leadership && (
                  <HStack className="gap-3 items-center bg-white/2 p-3 rounded-2xl border border-white/5">
                    <Box className="w-8 h-8 rounded-full bg-mistGray/5 items-center justify-center">
                      <Icon as={ShieldAlert} size={14} className="text-mistGray/40" />
                    </Box>
                    <VStack className="gap-0.5">
                      <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                        Leadership
                      </Text>
                      <Text className="text-xs text-mistGray/60 font-bold">
                        {record.leadership.principal_name || 'Unknown Principal'}
                      </Text>
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </Box>
          </Animated.View>
        ))}
      </VStack>
    </ScrollView>
  );
}
