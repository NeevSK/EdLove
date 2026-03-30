import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Theme } from '@repo/ui';
import { type StudentOverview } from '../../guardian';

interface GuardianStudentsGridProps {
  students: StudentOverview[];
  onStudentPress: (student: StudentOverview) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const GuardianStudentsGrid: React.FC<GuardianStudentsGridProps> = ({
  students,
  onStudentPress
}) => {
  const theme = useTheme();
  const isDesktop = screenWidth > 1024;

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return Theme.colors.sageGreen;
    if (percentage >= 85) return theme.accent.action;
    return theme.accent.danger;
  };

  const getGradeColor = (grade: string) => {
    const gradeNum = parseFloat(grade);
    if (gradeNum >= 90) return Theme.colors.sageGreen;
    if (gradeNum >= 80) return theme.accent.action;
    if (gradeNum >= 70) return Theme.colors.templeGold;
    return theme.accent.danger;
  };

  const renderStudentCard = (student: StudentOverview) => (
    <TouchableOpacity
      key={student.studentId}
      style={[
        styles.studentCard,>
        {
          backgroundColor: theme.glass.surface.bg,
          borderColor: theme.glass.surface.border,
          borderWidth: 1,
        }
      ]}
      onPress={() => onStudentPress(student)}
          <View style={styles.studentHeader}        <Text 
          style={[
            styles.studentName,>
            { 
              color: theme.text.primary, 
              fontFamily: 'System',
              fontWeight: '600',
              fontSize: isDesktop ? 18 : 16
            }
          ]}
                  {student.name}
        </Text        <Text 
          style={[
            styles.studentInfo,
            { 
              color: theme.text.secondary, 
              fontFamily: 'System',
              fontSize: isDesktop ? 14 : 12
            }
          ]}
                  Grade {student.grade} " {student.classroom}
        </Text      </View
      {/* Attendance Summary */}
      <View style={styles.section}        <Text 
          style={[
            styles.sectionTitle,>
            { 
              color: theme.text.primary,
              fontFamily: 'System',
              fontWeight: '600',
              fontSize: isDesktop ? 14 : 12
            }
          ]}
                  Attendance
        </Text        <div style={styles.attendanceStats}          <View style={styles.attendanceItem}            <Text 
              style={[
                styles.attendanceNumber,
                { 
                  color: getAttendanceColor(student.attendance.percentage),
                  fontFamily: 'System',
                  fontWeight: '700',
                  fontSize: isDesktop ? 20 : 16
                }
              ]}
                          {student.attendance.percentage.toFixed(1)}%
            </Text            <Text 
              style={[
                styles.attendanceLabel,
                { 
                  color: theme.text.secondary,
                  fontFamily: 'System',
                  fontSize: isDesktop ? 12 : 10
                }
              ]}
                          Present
            </Text          </View          <View style={styles.attendanceBreakdown}            <Text 
              style={[
                styles.attendanceDetail,
                { 
                  color: theme.text.secondary,
                  fontFamily: 'System',
                  fontSize: isDesktop ? 11 : 9
                }
              ]}
                          {student.attendance.present} present " {student.attendance.absent} absent " {student.attendance.late} late
            </Text          </View        </div      </View
      {/* Recent Grades */}
      <View style={styles.section}        <Text 
          style={[
            styles.sectionTitle,>
            { 
              color: theme.text.primary,
              fontFamily: 'System',
              fontWeight: '600',
              fontSize: isDesktop ? 14 : 12
            }
          ]}
                  Recent Grades
        </Text        {student.grades.latest.slice(0, 3).map((grade, index) => (
          <View key={index} style={styles.gradeItem}            <Text 
              style={[
                styles.gradeSubject,>
                { 
                  color: theme.text.primary,
                  fontFamily: 'System',
                  fontSize: isDesktop ? 12 : 10
                }
              ]}
                          {grade.subject}
            </Text            <Text 
              style={[
                styles.gradeValue,
                { 
                  color: getGradeColor(grade.grade),
                  fontFamily: 'System',
                  fontWeight: '600',
                  fontSize: isDesktop ? 14 : 12
                }
              ]}
                          {grade.grade}
            </Text          </View        ))}
        <Text 
          style={[
            styles.averageGrade,>
            { 
              color: theme.text.secondary,
              fontFamily: 'System',
              fontSize: isDesktop ? 11 : 9
            }
          ]}
                  Average: {student.grades.average.toFixed(1)}%
        </Text      </View
      {/* Upcoming Assignments */}
      {student.upcomingAssignments.length > 0 && (
        <View style={styles.section}          <Text 
            style={[
              styles.sectionTitle,>
              { 
                color: theme.text.primary,
                fontFamily: 'System',
                fontWeight: '600',
                fontSize: isDesktop ? 14 : 12
              }
            ]}
                      Upcoming Assignments
          </Text          {student.upcomingAssignments.slice(0, 2).map((assignment) => (
            <View key={assignment.id} style={styles.assignmentItem}              <Text 
                style={[
                  styles.assignmentTitle,>
                  { 
                    color: theme.text.primary,
                    fontFamily: 'System',
                    fontSize: isDesktop ? 12 : 10
                  }
                ]}
                              {assignment.title}
              </Text              <Text 
                style={[
                  styles.assignmentDue,
                  { 
                    color: theme.text.secondary,
                    fontFamily: 'System',
                    fontSize: isDesktop ? 10 : 8
                  }
                ]}
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </Text            </View          ))}
        </View      )}
    </TouchableOpacity  );

  return (
    <View style={[
      styles.studentsGrid,
      isDesktop && styles.studentsGridDesktop>
    ]}      {students.map(renderStudentCard)}
    </View  );
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
  studentHeader: {
    marginBottom: 16,
  },
  studentName: {
    marginBottom: 4,
  },
  studentInfo: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceItem: {
    alignItems: 'center',
  },
  attendanceNumber: {
    marginBottom: 2,
  },
  attendanceLabel: {
    textTransform: 'uppercase',
    fontSize: 8,
  },
  attendanceBreakdown: {
    flex: 1,
    marginLeft: 16,
  },
  attendanceDetail: {
    textAlign: 'right',
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gradeSubject: {
    flex: 1,
  },
  gradeValue: {
    fontWeight: '600',
  },
  averageGrade: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  assignmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  assignmentTitle: {
    flex: 1,
  },
  assignmentDue: {
    opacity: 0.7,
  },
});
