import {
  Badge,
  BadgeText,
  Box,
  Calendar,
  ChevronRight,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';

import type React from 'react';

interface Classroom {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  nextSession: string;
}

interface TeacherClassroomListProps {
  classrooms: Classroom[];
  onClassroomPress: (classroom: Classroom) => void;
}

export const TeacherClassroomList: React.FC<TeacherClassroomListProps> = ({
  classrooms,
  onClassroomPress,
}) => {
  if (classrooms.length === 0) {
    return (
      <Box className="rounded-[32px] border border-sanctuary-border bg-sanctuary-surface-secondary/30 p-12">
        <VStack className="max-w-md gap-5">
          <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-sanctuary-text-tertiary">
            Sanctuary Registry
          </Text>
          <Heading className="text-xl text-sanctuary-text font-black tracking-tight leading-tight">
            Your sanctuaries will gather here.
          </Heading>
          <Text className="text-sm leading-relaxed text-sanctuary-text-tertiary">
            Create or join a classroom to begin the teacher workspace flow. All your teaching
            signals will be centralized here.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <HStack className="flex-wrap gap-6">
      {classrooms.map((classroom) => (
        <Pressable
          key={classroom.id}
          onPress={() => onClassroomPress(classroom)}
          className="w-full lg:w-[calc(50%-12px)] active:scale-[0.99] transition-all duration-300"
        >
          <Box className="rounded-[32px] border border-sanctuary-border bg-sanctuary-surface p-7 overflow-hidden relative">
            <Box className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sanctuarySaffron/5 opacity-[0.03]" />

            <VStack className="gap-8">
              <HStack className="items-start justify-between">
                <VStack className="flex-1 gap-2.5">
                  <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-sanctuary-text-tertiary">
                    {classroom.subject}
                  </Text>
                  <Heading className="text-xl text-sanctuary-text font-black tracking-tighter leading-tight">
                    {classroom.name}
                  </Heading>
                </VStack>
                <Badge className="rounded-xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/20 px-3 py-1.5 h-auto">
                  <BadgeText className="text-[10px] font-black text-sanctuarySaffron uppercase tracking-[0.1em]">
                    {classroom.studentCount} Pupils
                  </BadgeText>
                </Badge>
              </HStack>

              <Box className="border-t border-sanctuary-border/30 pt-6">
                <HStack className="items-center justify-between">
                  <VStack className="gap-1.5">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuary-text-tertiary">
                      Next Cycle
                    </Text>
                    <HStack className="items-center gap-2">
                      <Icon as={Calendar} size="xs" className="text-sanctuarySaffron" />
                      <Text className="text-xs font-black text-sanctuary-text tracking-tight">
                        {classroom.nextSession}
                      </Text>
                    </HStack>
                  </VStack>
                  <HStack className="items-center gap-2">
                    <Text className="text-[10px] font-black uppercase tracking-[0.25em] text-sanctuarySaffron">
                      Enter Workspace
                    </Text>
                    <Icon as={ChevronRight} size="xs" className="text-sanctuarySaffron" />
                  </HStack>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </Pressable>
      ))}
    </HStack>
  );
};
