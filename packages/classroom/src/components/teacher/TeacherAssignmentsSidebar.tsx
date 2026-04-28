import { Box, Heading, HStack, Pressable, Text, VStack } from '@repo/ui';
import type React from 'react';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submittedCount: number;
  totalCount: number;
}

interface TeacherAssignmentsSidebarProps {
  assignments: Assignment[];
  onAssignmentPress: (assignment: Assignment) => void;
}

export const TeacherAssignmentsSidebar: React.FC<TeacherAssignmentsSidebarProps> = ({
  assignments,
  onAssignmentPress,
}) => {
  if (assignments.length === 0) {
    return (
      <Box className="rounded-[32px] border border-phase-border/40 p-8 bg-phase-surface-secondary shadow-sm">
        <Text className="text-base font-black text-phase-text-primary tracking-tight">
          No active assignments need attention.
        </Text>
        <Text className="mt-2 text-sm leading-relaxed text-phase-text-tertiary font-medium">
          This sidebar stays ready for submissions and due-date pressure when the rhythm changes.
        </Text>
      </Box>
    );
  }

  return (
    <VStack className="gap-4">
      {assignments.map((assignment) => {
        const totalCount = assignment.totalCount || 0;
        const ratio = totalCount > 0 ? (assignment.submittedCount / totalCount) * 100 : 0;

        return (
          <Pressable
            key={assignment.id}
            onPress={() => onAssignmentPress(assignment)}
            className="w-full rounded-[32px] border border-phase-border/40 p-6 bg-phase-surface shadow-sm active:scale-[0.98] transition-all"
          >
            <Heading className="text-lg text-phase-text-primary font-black leading-tight tracking-tight">
              {assignment.title}
            </Heading>

            <HStack className="mt-5 items-center justify-between gap-3">
              <Text className="text-[10px] font-black text-phase-text-tertiary tracking-[0.25em] uppercase">
                Due{' '}
                {new Date(assignment.dueDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
              <Text className="text-[10px] font-black text-sanctuarySaffron tracking-[0.15em] uppercase">
                {assignment.submittedCount}/{assignment.totalCount} Turned In
              </Text>
            </HStack>

            {/* Progress Bar Container */}
            <Box className="mt-5 h-2.5 overflow-hidden rounded-full bg-phase-surface-secondary border border-phase-border/10">
              <Box
                className="h-full rounded-full bg-sanctuarySaffron shadow-sm"
                style={{ width: `${ratio}%` }}
              />
            </Box>
          </Pressable>
        );
      })}
    </VStack>
  );
};
