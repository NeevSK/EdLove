import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';
import { useStudentPerformance, useClassPerformance, usePredictions } from '@repo/analytics';
import { PerformanceDashboard } from '@repo/analytics/components';
import { GPAInsights } from '@repo/analytics/components';

interface EnhancedAnalyticsDashboardProps {
  schoolId?: string;
  classId?: string;
  studentId?: string;
}

export default function EnhancedAnalyticsDashboard({ 
  schoolId, 
  classId, 
  studentId 
}: EnhancedAnalyticsDashboardProps) {
  // Student-focused analytics
  const { data: studentPerformance } = useStudentPerformance(
    studentId || '', 
    classId || ''
  );

  // Class-focused analytics
  const { data: classPerformance } = useClassPerformance(classId || '');

  // Predictions
  const { data: predictions } = usePredictions({
    studentId: studentId || '',
    predictionType: 'gpa',
    timeHorizon: 'semester'
  });

  return (
    <ScrollView style={styles.container}>
      <VStack space="md">
        {/* Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.title}>📊 Analytics Dashboard</Text>
          <Text style={styles.subtitle}>
            {studentId ? 'Student Performance' : 
             classId ? 'Class Analytics' : 
             'School Overview'}
          </Text>
        </Card>

        {/* Student Performance View */}
        {studentId && studentPerformance && (
          <Card>
            <PerformanceDashboard 
              metrics={studentPerformance}
              insights={[]} // Will be populated by InsightGenerator
              recommendations={[]} // Will be populated by InsightGenerator
            />
          </Card>
        )}

        {/* Class Performance View */}
        {classId && classPerformance && (
          <Card>
            <VStack space="md">
              <Text style={styles.sectionTitle}>📈 Class Performance</Text>
              
              <HStack style={styles.metricsRow}>
                <VStack flex={1} alignItems="center">
                  <Text style={styles.metricValue}>{classPerformance.averageGPA.toFixed(2)}</Text>
                  <Text style={styles.metricLabel}>Average GPA</Text>
                </VStack>
                <VStack flex={1} alignItems="center">
                  <Text style={styles.metricValue}>{classPerformance.totalStudents}</Text>
                  <Text style={styles.metricLabel}>Total Students</Text>
                </VStack>
                <VStack flex={1} alignItems="center">
                  <Text style={styles.metricValue}>{classPerformance.topPerformers.length}</Text>
                  <Text style={styles.metricLabel}>Top Performers</Text>
                </VStack>
              </HStack>

              <Text style={styles.sectionTitle}>⚠️ At-Risk Students</Text>
              {classPerformance.atRiskStudents.length > 0 ? (
                <VStack space="xs">
                  {classPerformance.atRiskStudents.slice(0, 5).map((studentId: string, index: number) => (
                    <Text key={index} style={styles.atRiskText}>
                      • Student {studentId}
                    </Text>
                  ))}
                  {classPerformance.atRiskStudents.length > 5 && (
                    <Text style={styles.moreText}>
                      ...and {classPerformance.atRiskStudents.length - 5} more
                    </Text>
                  )}
                </VStack>
              ) : (
                <Text style={styles.noRiskText}>✅ No at-risk students identified</Text>
              )}

              <Text style={styles.sectionTitle}>💡 Key Insights</Text>
              <VStack space="xs">
                {classPerformance.insights.map((insight: string, index: number) => (
                  <Text key={index} style={styles.insightText}>
                    • {insight}
                  </Text>
                ))}
              </VStack>
            </VStack>
          </Card>
        )}

        {/* GPA Insights */}
        {studentId && studentPerformance && (
          <GPAInsights
            studentId={studentId}
            currentGPA={studentPerformance.currentGPA}
            trendDirection={studentPerformance.trendDirection}
            predictedGPA={predictions?.prediction}
          />
        )}

        {/* Quick Stats */}
        <Card>
          <Text style={styles.sectionTitle}>🎯 Quick Actions</Text>
          <VStack space="sm">
            <Text style={styles.actionText}>
              📤 Generate detailed performance reports
            </Text>
            <Text style={styles.actionText}>
              👥 Schedule parent-teacher conferences
            </Text>
            <Text style={styles.actionText}>
              📈 View benchmark comparisons
            </Text>
            <Text style={styles.actionText}>
              🚨 Set up at-risk alerts
            </Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  metricsRow: {
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  atRiskText: {
    fontSize: 14,
    color: Theme.colors.error,
    marginBottom: Theme.spacing.xs,
  },
  moreText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  noRiskText: {
    fontSize: 14,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  actionText: {
    fontSize: 16,
    color: Theme.colors.gurudeviBlue,
    marginBottom: Theme.spacing.xs,
  },
});
