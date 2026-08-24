import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';

import type React from 'react';
import type { StudentOverview } from '@repo/admin/guardian/types';

interface GuardianStudentsGridProps {
  students: StudentOverview[];
  onStudentPress: (student: StudentOverview) => void;
}

export const GuardianStudentsGrid: React.FC<GuardianStudentsGridProps> = ({
  students,
  onStudentPress,
}) => {
  const getAttendanceColorClass = (percentage: number) => {
    if (percentage >= 95) return 'text-success';
    if (percentage >= 85) return 'text-primary';
    return 'text-error';
  };

  return (
    <Box className="flex-row flex-wrap gap-4">
      {students.map((student) => (
        <Pressable
          key={student.studentId}
          onPress={() => onStudentPress(student)}
          className="active:opacity-85 w-full md:w-[48%]"
        >
          <Box className="p-4 rounded-xl mb-4 bg-white/60 border border-border">
            <Text className="font-semibold text-lg text-primary mb-1">{student.name}</Text>
            <Text className="text-secondary text-sm mb-3">
              Grade {student.grade} · {student.classroom}
            </Text>
            <HStack className="justify-between items-center">
              <Text className="text-secondary text-xs opacity-80">Attendance</Text>
              <Text
                className={`font-bold text-sm ${getAttendanceColorClass(student.attendance.percentage)}`}
              >
                {student.attendance.percentage.toFixed(1)}%
              </Text>
            </HStack>
          </Box>
        </Pressable>
      ))}
    </Box>
  );
};
