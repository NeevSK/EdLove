import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { VStack, HStack, Card, Theme, colors } from '@repo/ui';
import { useClassPerformance, usePredictions, useStudentPerformance } from '@repo/analytics/hooks';
import { GPAInsights, PerformanceDashboard } from '@repo/analytics/ui';

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
          <Text style={styles.title}>{'\uD83D\uDCCA'} Analytics Dashboard</Text>
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
              <Text style={styles.sectionTitle}>{'\uD83D\uDCC8'} Class Performance</Text>
              
              <HStack style={styles.metricsRow}>
                <VStack style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.metricValue}>{classPerformance.averageGPA.toFixed(2)}</Text>
                  <Text style={styles.metricLabel}>Average GPA</Text>
                </VStack>
                <VStack style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.metricValue}>{classPerformance.totalStudents}</Text>
                  <Text style={styles.metricLabel}>Total Students</Text>
                </VStack>
                <VStack style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.metricValue}>{classPerformance.topPerformers.length}</Text>
                  <Text style={styles.metricLabel}>Top Performers</Text>
                </VStack>
              </HStack>

              <Text style={styles.sectionTitle}>{'\u26A0\uFE0F'} At-Risk Students</Text>
              {classPerformance.atRiskStudents.length > 0 ? (
                <VStack space="xs">
                  {classPerformance.atRiskStudents.slice(0, 5).map((sId: string, index: number) => (
                    <Text key={index} style={styles.atRiskText}>
                      {'\u2022'} Student {sId}
                    </Text>
                  ))}
                  {classPerformance.atRiskStudents.length > 5 && (
                    <Text style={styles.moreText}>
                      ...and {classPerformance.atRiskStudents.length - 5} more
                    </Text>
                  )}
                </VStack>
              ) : (
                <Text style={styles.noRiskText}>{'\u2705'} No at-risk students identified</Text>
              )}

              <Text style={styles.sectionTitle}>{'\uD83D\uDCA1'} Key Insights</Text>
              <VStack space="xs">
                {classPerformance.insights.map((insight: string, index: number) => (
                  <Text key={index} style={styles.insightText}>
                    {'\u2022'} {insight}
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
          <Text style={styles.sectionTitle}>{'\uD83C\uDFAF'} Quick Actions</Text>
          <VStack space="sm">
            <Text style={styles.actionText}>
              {'\uD83D\uDCE4'} Generate detailed performance reports
            </Text>
            <Text style={styles.actionText}>
              {'\uD83D\uDC65'} Schedule parent-teacher conferences
            </Text>
            <Text style={styles.actionText}>
              {'\uD83D\uDCC8'} View benchmark comparisons
            </Text>
            <Text style={styles.actionText}>
              {'\uD83D\uDEA8'} Set up at-risk alerts
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
    backgroundColor: '#FCF9F2'},
  headerCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md},
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2318',
    marginBottom: Theme.spacing.xs},
  subtitle: {
    fontSize: 16,
    color: '#6B6480',
    marginBottom: Theme.spacing.md},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A2318',
    marginBottom: Theme.spacing.sm},
  metricsRow: {
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg},
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A2318',
    textAlign: 'center'},
  metricLabel: {
    fontSize: 12,
    color: '#6B6480',
    textAlign: 'center'},
  atRiskText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: Theme.spacing.xs},
  moreText: {
    fontSize: 14,
    color: '#6B6480',
    fontStyle: 'italic'},
  noRiskText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600'},
  insightText: {
    fontSize: 14,
    color: '#2A2318',
    lineHeight: 20},
  actionText: {
    fontSize: 16,
    color: colors.gurudeviBlue,
    marginBottom: Theme.spacing.xs}});
