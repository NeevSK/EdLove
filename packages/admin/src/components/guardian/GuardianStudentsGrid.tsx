import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme, useTheme } from '@repo/ui';
import { type StudentOverview } from '../../guardian';

interface GuardianStudentsGridProps {
  students: StudentOverview[];
  onStudentPress: (student: StudentOverview) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const GuardianStudentsGrid: React.FC<GuardianStudentsGridProps> = ({ students, onStudentPress }) => {
  const theme = useTheme();
  const isDesktop = screenWidth > 1024;

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return Theme.colors.sageGreen;
    if (percentage >= 85) return theme.accent.action;
    return theme.accent.danger;
  };

  return (
    <View style={[styles.studentsGrid, isDesktop && styles.studentsGridDesktop]}>
      {students.map((student) => (
        <TouchableOpacity
          key={student.studentId}
          style={[
            styles.studentCard,
            {
              backgroundColor: theme.glass.surface.bg,
              borderColor: theme.glass.surface.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => onStudentPress(student)}
          activeOpacity={0.85}
        >
          <Text style={[styles.studentName, { color: theme.text.primary }]}>{student.name}</Text>
          <Text style={[styles.studentInfo, { color: theme.text.secondary }]}>
            Grade {student.grade} · {student.classroom}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.metric, { color: theme.text.secondary }]}>Attendance</Text>
            <Text style={[styles.metricValue, { color: getAttendanceColor(student.attendance.percentage) }]}>
              {student.attendance.percentage.toFixed(1)}%
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  studentsGrid: {
    gap: 16,
  },
  studentsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  studentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: screenWidth > 1024 ? '48%' : '100%',
  },
  studentName: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: screenWidth > 1024 ? 18 : 16,
    marginBottom: 4,
  },
  studentInfo: {
    fontFamily: 'System',
    fontSize: screenWidth > 1024 ? 14 : 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metric: {
    fontFamily: 'System',
    fontSize: 12,
    opacity: 0.8,
  },
  metricValue: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 14,
  },
});
