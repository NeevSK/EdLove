import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';
import { SimpleBarChart } from '@repo/graphics';
import { useStudentPerformance, useClassPerformance, usePredictions } from '../hooks/useAnalytics';
import { StudentPerformanceMetrics } from '../types/AnalyticsTypes';
import { GPAInsights } from './GPAInsights';
import { formatGPA, getGradeColor, getPerformanceLevel } from '../utils/analyticsHelpers';

interface PerformanceDashboardProps {
  metrics: StudentPerformanceMetrics;
  insights?: string[];
  recommendations?: string[];
}

export function PerformanceDashboard({ 
  metrics, 
  insights = [], 
  recommendations = [] 
}: PerformanceDashboardProps) {
  const performanceLevel = getPerformanceLevel(metrics.averageMarks);
  
  const chartData = [
    { label: 'GPA', value: parseFloat(formatGPA(metrics.currentGPA)), color: getGradeColor('A') },
    { label: 'Avg Marks', value: metrics.averageMarks, color: getGradeColor('B') },
    { label: 'Attendance', value: metrics.attendanceImpact * 100, color: getGradeColor('C') },
    { label: 'Submission', value: metrics.submissionRate * 100, color: getGradeColor('B') },
  ];

  const subjectData = Object.entries(metrics.subjectPerformance).map(([subject, score]) => ({
    label: subject,
    value: score as number,
    color: getGradeColor((score as number) >= 80 ? 'A' : (score as number) >= 70 ? 'B' : 'C')
  }));

  return (
    <ScrollView style={styles.container}      <VStack space="md"        {/* Header Card */}>
        <Card style={styles.headerCard}          <Text style={styles.studentTitle}>Student Performance</Text          ><Text style={styles.studentSubtitle}>ID: {metrics.studentId}</Text          
          ><HStack style={styles.metricsRow}            <VStack flex={1} alignItems="center"              <Text style={styles.metricValue}>{formatGPA(metrics.currentGPA)}</Text              ><Text style={styles.metricLabel}>Current GPA</Text            ></VStack            ><VStack flex={1} alignItems="center"              <Text style={styles.metricValue}>{metrics.averageMarks.toFixed(1)}%</Text              ><Text style={styles.metricLabel}>Average Marks</Text            ></VStack            <VStack flex={1} alignItems="center"              <Text style={styles.metricValue}>#{metrics.rankInClass}</Text              <Text style={styles.metricLabel}>Class Rank</Text            </VStack          </HStack          
          <View style={styles.trendContainer}            <Text style={[>
              styles.trendText,>
              { color: metrics.trendDirection === 'improving' ? Theme.colors.success : 
                       metrics.trendDirection === 'declining' ? Theme.colors.error : 
                       Theme.colors.warning }
            ]}              Trend: {metrics.trendDirection.charAt(0).toUpperCase() + metrics.trendDirection.slice(1)}
            </Text          </View        </Card
        {/* Performance Chart */}
        <Card          <SimpleBarChart 
            >title="Performance Overview"
            data={[>
              { label: 'GPA', value: metrics.currentGPA, color: getGradeColor(formatGPA(metrics.currentGPA)) },
              { label: 'Avg Marks', value: metrics.averageMarks, color: getGradeColor(Math.round(metrics.averageMarks).toString()) },
              { label: 'Rank', value: metrics.rankInClass, color: Theme.colors.gurudeviBlue }
            ]}
            height={150}
          /        ></Card
        {/* Subject Performance */}
        <Card          <SimpleBarChart 
            >title="Subject Performance"
            data={subjectData}
            height={120}
          /        ></Card>
        {/* Insights */}
        {insights.length > 0 && (
          <Card            <Text >style={styles.sectionTitle}>Insights</Text            ><VStack space="sm"              {insights.map((insight, index) => (
                <Text key={index} style={styles.insightText}                  " {insight}>
                </Text              ))}>
            </VStack          </Card        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card            <Text >style={styles.sectionTitle}>Recommendations</Text            ><VStack space="sm"              {recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationText}                  {index + 1}. {recommendation}>
                </Text              >))}>
            </VStack          ></Card        )}
      </VStack    </ScrollView  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerCard: {
    padding: Theme.spacing.lg,
  },
  studentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  studentSubtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
  },
  metricsRow: {
    marginBottom: Theme.spacing.md,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  insightText: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  recommendationText: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
});
