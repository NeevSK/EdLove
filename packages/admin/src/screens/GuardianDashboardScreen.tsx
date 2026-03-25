import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { useTheme } from '@repo/ui';
import { Intent } from '@repo/core';
import { guardianAPI, type GuardianDashboard, type StudentOverview } from '../guardian';

interface GuardianDashboardScreenProps {
  guardianId: string;
  onStudentPress: (student: StudentOverview) => void;
  onNotificationPress: (notification: any) => void;
  onEventPress: (event: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * GuardianDashboardScreen: A Protocol-Oriented Authority (POA) shell.
 * 
 * This screen no longer contains monolithic UI logic. Instead, it expresses 
 * "Intents" which are resolved by the platform ecosystem.
 */
export const GuardianDashboardScreen: React.FC<GuardianDashboardScreenProps> = ({
  guardianId,
  onStudentPress,
  onNotificationPress,
  onEventPress
}) => {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<GuardianDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDesktop = screenWidth > 1024;

  useEffect(() => {
    loadDashboard();
  }, [guardianId]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await guardianAPI.getGuardianDashboard(guardianId);
      setDashboard(dashboardData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}>
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}>
        <Text style={[styles.errorText, { color: theme.accent.danger }]}>
          Failed to load dashboard
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}>
      {/* Header Intent */}
      <Intent 
        intent="dashboard.guardian.header" 
        props={{ studentCount: dashboard.students.length, isDesktop }} 
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          isDesktop && styles.contentContainerDesktop
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Students Section (POA Intent) */}
        <Intent 
          intent="dashboard.guardian.children_list" 
          props={{ 
            students: dashboard.students,
            onStudentPress,
            isDesktop
          }} 
        />

        {/* Notifications and Events Row (POA) */}
        {isDesktop ? (
          <View style={styles.desktopRow}>
            <View style={[styles.desktopColumn, { flex: 1 }]}>
              <Text 
                style={[
                  styles.sectionHeader,
                  { 
                    color: theme.text.primary,
                    fontFamily: 'System',
                    fontWeight: '700',
                    fontSize: 18
                  }
                ]}
              >
                Recent Notifications
              </Text>
              <Intent 
                intent="dashboard.guardian.notifications" 
                props={{ 
                  notifications: dashboard.notifications,
                  onNotificationPress,
                  limit: 5
                }} 
              />
            </View>

            <View style={[styles.desktopColumn, { flex: 1, marginLeft: 20 }]}>
              <Text 
                style={[
                  styles.sectionHeader,
                  { 
                    color: theme.text.primary,
                    fontFamily: 'System',
                    fontWeight: '700',
                    fontSize: 18
                  }
                ]}
              >
                Upcoming Events
              </Text>
              <Intent 
                intent="dashboard.guardian.events" 
                props={{ 
                  events: dashboard.upcomingEvents,
                  onEventPress,
                  limit: 5
                }} 
              />
            </View>
          </View>
        ) : (
          <>
            {/* Mobile Notifications (POA) */}
            <View style={styles.section}>
              <Text 
                style={[
                  styles.sectionHeader,
                  { 
                    color: theme.text.primary,
                    fontFamily: 'System',
                    fontWeight: '700',
                    fontSize: 16
                  }
                ]}
              >
                Recent Notifications
              </Text>
              <Intent 
                intent="dashboard.guardian.notifications" 
                props={{ 
                  notifications: dashboard.notifications,
                  onNotificationPress,
                  limit: 3
                }} 
              />
            </View>

            {/* Mobile Events (POA) */}
            <View style={styles.section}>
              <Text 
                style={[
                  styles.sectionHeader,
                  { 
                    color: theme.text.primary,
                    fontFamily: 'System',
                    fontWeight: '700',
                    fontSize: 16
                  }
                ]}
              >
                Upcoming Events
              </Text>
              <Intent 
                intent="dashboard.guardian.events" 
                props={{ 
                  events: dashboard.upcomingEvents,
                  onEventPress,
                  limit: 3
                }} 
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Mobile-first responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerDesktop: {
    padding: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  
  // Students
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
  
  // Attendance
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
  
  // Grades
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
  
  // Assignments
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
  
  // Notifications
  notificationsList: {
    gap: 8,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: 4,
  },
  notificationMessage: {
    marginBottom: 4,
    opacity: 0.8,
  },
  notificationTime: {
    opacity: 0.6,
    fontSize: 10,
  },
  
  // Events
  eventsList: {
    gap: 8,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  eventDateDay: {
    marginBottom: 2,
  },
  eventDateMonth: {
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    marginBottom: 4,
  },
  eventTime: {
    opacity: 0.7,
  },
  rsvpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rsvpText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Desktop Layout
  desktopRow: {
    flexDirection: 'row',
    gap: 20,
  },
  desktopColumn: {
    marginBottom: 24,
  },
  
  // Loading and Error States
  loadingText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    fontWeight: '600',
  },
});
