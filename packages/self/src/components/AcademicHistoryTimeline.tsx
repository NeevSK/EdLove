import { useStudentAcademicHistory } from '@repo/profile';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { Box, HStack, Icon, ScrollView, Text, VStack } from '@repo/ui/primitives';
import { Calendar, GraduationCap, School } from 'lucide-react-native';
import React from 'react';
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
      <VStack space="md">
        <SkeletonCard height={100} />
        <SkeletonCard height={100} />
      </VStack>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Box className="p-10 bg-white/3 rounded-3xl items-center border border-dashed border-white/5">
        <Icon as={GraduationCap} size={32} className="text-mistGray/10 mb-4" />
        <Text className="text-mistGray/40 text-sm font-bold text-center">
          Your academic journey is just beginning.
        </Text>
      </Box>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <VStack space="lg" className="pb-10">
        {history.map((record: AcademicRecord, index: number) => (
          <Animated.View key={record.id} entering={FadeInRight.delay(index * 100)}>
            <Box className="p-6 rounded-[32px] bg-white/3 border border-white/5 overflow-hidden">
              {/* Glossy Background Accent */}
              <Box className="absolute -top-10 -right-10 w-40 h-40 bg-emeraldGreen/5 rounded-full blur-3xl" />

              <HStack className="justify-between items-start mb-4">
                <VStack className="gap-1 flex-1">
                  <HStack className="gap-2 items-center">
                    <Icon as={Calendar} size={14} className="text-emeraldGreen" />
                    <Text className="text-[10px] text-emeraldGreen font-black uppercase tracking-widest">
                      {record.academic_year}
                    </Text>
                  </HStack>
                  <Text className="text-xl text-sacredWhite font-black tracking-tight">
                    Grade {record.grade_number}
                  </Text>
                </VStack>

                <Box className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 items-center">
                  <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest mb-0.5">
                    Avg Score
                  </Text>
                  <Text className="text-lg text-emeraldGreen font-black">{record.avg_grade}%</Text>
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
                      {/* In a real app, we'd join with School name */}
                      {record.school_id.split('-')[0]}... Educational Sanctuary
                    </Text>
                  </VStack>
                </HStack>

                <HStack className="justify-between gap-4">
                  <VStack className="flex-1 gap-1">
                    <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">
                      Growth Path
                    </Text>
                    <Text className="text-xs text-sacredWhite/80 font-medium">
                      {record.subject || 'Holistic Development'}
                    </Text>
                  </VStack>

                  <HStack className="gap-4">
                    <VStack className="items-center">
                      <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                        Tasks
                      </Text>
                      <Text className="text-xs text-sacredWhite font-bold">
                        {record.assignments_submitted}/{record.assignments_total}
                      </Text>
                    </VStack>
                    <VStack className="items-center">
                      <Text className="text-[8px] text-mistGray/40 font-black uppercase tracking-widest">
                        Peak
                      </Text>
                      <Text className="text-xs text-emeraldGreen font-bold">
                        {record.highest_grade}%
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          </Animated.View>
        ))}
      </VStack>
    </ScrollView>
  );
}
