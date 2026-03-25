import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@repo/ui';
import { Intent } from '@repo/core';
import { StudentOverview } from '../../guardian';

interface GuardianChildrenListProps {
  students: StudentOverview[];
  onStudentPress: (student: StudentOverview) => void;
  isDesktop?: boolean;
}

export const GuardianChildrenList: React.FC<GuardianChildrenListProps> = ({ students, onStudentPress, isDesktop }) => {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text 
        style={[
          styles.sectionHeader,
          { 
            color: theme.text.primary,
            fontWeight: '700',
            fontSize: isDesktop ? 20 : 16
          }
        ]}
      >
        Your Students
      </Text>
      <Intent 
        intent="dashboard.guardian.students_grid" 
        props={{ 
          students,
          onStudentPress 
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
});
