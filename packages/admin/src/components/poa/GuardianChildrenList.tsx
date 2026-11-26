import { View, Text } from 'react-native';
import type React from 'react';
import type { GuardianStudentOverview } from '@repo/core/logic/schemas/guardian.schema';
import { GuardianStudentsGrid } from '@repo/admin/components/guardian/GuardianStudentsGrid';

interface GuardianChildrenListProps {
  students: GuardianStudentOverview[];
  onStudentPress: (student: GuardianStudentOverview) => void;
}

export const GuardianChildrenList: React.FC<GuardianChildrenListProps> = ({
  students,
  onStudentPress,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-primary font-bold text-base md:text-xl mb-4">Your Students</Text>
      <GuardianStudentsGrid students={students} onStudentPress={onStudentPress} />
    </View>
  );
};
