import { Box, Text } from '@repo/ui/primitives';
import type React from 'react';
import type { StudentOverview } from '@/guardian';
import { GuardianStudentsGrid } from '@/components/guardian/GuardianStudentsGrid';

interface GuardianChildrenListProps {
  students: StudentOverview[];
  onStudentPress: (student: StudentOverview) => void;
}

export const GuardianChildrenList: React.FC<GuardianChildrenListProps> = ({
  students,
  onStudentPress,
}) => {
  return (
    <Box className="mb-6">
      <Text className="text-primary font-bold text-base md:text-xl mb-4">Your Students</Text>
      <GuardianStudentsGrid students={students} onStudentPress={onStudentPress} />
    </Box>
  );
};
