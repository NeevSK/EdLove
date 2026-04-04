import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { VStack, HStack, Card, Text, Theme, useThemedColors } from '@repo/ui';
import { SimpleBarChart } from '@repo/graphics';
import type { StudentPerformanceMetrics } from '../types/AnalyticsTypes';
import { formatGPA, getGradeColor, getPerformanceLevel } from '../utils/analyticsHelpers';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface PerformanceDashboardProps {
  metrics: StudentPerformanceMetrics;
  insights?: string[];
  recommendations?: string[];
}

// —————————————————————————————————————————————————————————————————————————————
// COMPONENT
// —————————————————————————————————————————————————————————————————————————————

export function PerformanceDashboard({ 
  metrics, 
  insights = [], 
  recommendations = [] 
}: PerformanceDashboardProps) {
  const colors = useThemedColors();
  const performanceLevel = getPerformanceLevel(metrics.averageMarks);
  
  const subjectData = Object.entries(metrics.subjectPerformance).map(([subject, score]) => ({
    label: subject,
    value: score as number,
    color: getGradeColor((score as number) >= 80 ? 'A' : (score as number) >= 70 ? 'B' : 'C')
  }));

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <VStack space="md" sx={{ padding: Theme.spacing.md }}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Text sx={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
            Student Performance
          </Text>
          <Text sx={{ fontSize: 14, color: colors.textSecondary, marginBottom: Theme.spacing.md }}>
            ID: {metrics.studentId}
          </Text>
          
          <HStack style={styles.metricsRow}>
            <VStack sx={{ flex: 1, alignItems: 'center' }}>
              <Text sx={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                {formatGPA(metrics.currentGPA)}
              </Text>
              <Text sx={{ fontSize: 12, color: colors.textSecondary }}>Current GPA</Text>
            </VStack>
            <VStack sx={{ flex: 1, alignItems: 'center' }}>
              <Text sx={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                {metrics.averageMarks.toFixed(1)}%
              </Text>
              <Text sx={{ fontSize: 12, color: colors.textSecondary }}>Average Marks</Text>
            </VStack>
            <VStack sx={{ flex: 1, alignItems: 'center' }}>
              <Text sx={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                #{metrics.rankInClass}
              </Text>
              <Text sx={{ fontSize: 12, color: colors.textSecondary }}>Class Rank</Text>
            </VStack>
          </HStack>
          
          <View style={styles.trendContainer}>
            <Text 
              sx={{ 
                fontSize: 14, 
                fontWeight: '600',
                color: metrics.trendDirection === 'improving' ? colors.success : 
                       metrics.trendDirection === 'declining' ? colors.error : 
                       colors.warning 
              }}
            >
              Trend: {metrics.trendDirection.charAt(0).toUpperCase() + metrics.trendDirection.slice(1)} ({performanceLevel})
            </Text>
          </View>
        </Card>

        {/* Performance Chart */}
        <Card style={{ padding: Theme.spacing.md }}>
          <SimpleBarChart 
            title="Performance Overview"
            data={[
              { label: 'GPA', value: metrics.currentGPA, color: colors.primary },
              { label: 'Avg Marks', value: metrics.averageMarks, color: colors.secondary },
              { label: 'Rank', value: metrics.rankInClass, color: colors.action }
            ]}
            height={180}
          />
        </Card>

        {/* Subject Performance */}
        <Card style={{ padding: Theme.spacing.md }}>
          <SimpleBarChart 
            title="Subject Performance"
            data={subjectData}
            height={150}
          />
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <Card style={{ padding: Theme.spacing.md }}>
             <Text sx={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: Theme.spacing.sm }}>
               Insights
             </Text>
             <VStack space="sm">
               {insights.map((insight, index) => (
                 <Text key={index} sx={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                   • {insight}
                 </Text>
               ))}
             </VStack>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card style={{ padding: Theme.spacing.md }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: Theme.spacing.sm }}>
              Recommendations
            </Text>
            <VStack space="sm">
              {recommendations.map((recommendation, index) => (
                <Text key={index} sx={{ fontSize: 14, color: colors.text, lineHeight: 20 }}>
                  {index + 1}. {recommendation}
                </Text>
              ))}
            </VStack>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: Theme.spacing.lg,
  },
  metricsRow: {
    marginBottom: Theme.spacing.md,
    justifyContent: 'space-around',
    width: '100%',
  },
  trendContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  }
});
