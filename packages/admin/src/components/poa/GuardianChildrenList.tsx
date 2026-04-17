import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@repo/ui';
import { GuardianStudentsGrid } from '../guardian/GuardianStudentsGrid';
import { StudentOverview } from '../../guardian';

interface GuardianChildrenListProps {
  students: StudentOverview[];
  onStudentPress: (student: StudentOverview) => void;
  isDesktop?: boolean;
}

export const GuardianChildrenList: React.FC<GuardianChildrenListProps> = { { students, onStudentPress, isDesktop }) => {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionHeader,
          {
            color: theme.text.primary,
            fontWeight: '700',
            fontSize: isDesktop ? 20 : 16}]}
      >
        Your Students
      </Text>
      <GuardianStudentsGrid students={students} onStudentPress={onStudentPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24},
  sectionHeader: {
    marginBottom: 16}});
