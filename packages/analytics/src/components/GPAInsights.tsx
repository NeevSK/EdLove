import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';
import { GPACalculator } from '../engine/GPACalculator';
import { formatGPA, getGradeColor } from '../utils/analyticsHelpers';

interface GPAInsightsProps {
  studentId: string;
  currentGPA: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  predictedGPA?: number;
  targetGPA?: number;
}

export function GPAInsights({ 
  studentId, 
  currentGPA, 
  trendDirection, 
  predictedGPA, 
  targetGPA = 3.0 
}: GPAInsightsProps) {
  const gpaCalculator = new GPACalculator();
  
  const gapToTarget = targetGPA - currentGPA;
  const isOnTrack = predictedGPA ? predictedGPA >= targetGPA : currentGPA >= targetGPA;
  
  const trendColor = trendDirection === 'improving' ? Theme.colors.success :
                   trendDirection === 'declining' ? Theme.colors.error :
                   Theme.colors.warning;

  return (
    <Card style={styles.container}      <Text style={styles.title}>GPA Insights</Text      
      ><VStack space="md"        {/* Current GPA */}
        <HStack style={styles.gpaRow}          <VStack flex={1}            <Text style={styles.gpaLabel}>Current GPA</Text            ><Text style={[styles.gpaValue, { color: getGradeColor(currentGPA >= 3.5 ? 'A' : currentGPA >= 2.5 ? 'B' : 'C') }]}              {formatGPA(currentGPA)}
            </Text          </VStack          
          {predictedGPA && (
            <VStack flex={1}              <Text style={styles.gpaLabel}>Predicted GPA</Text              ><Text style={[styles.gpaValue, { color: getGradeColor(predictedGPA >= 3.5 ? 'A' : predictedGPA >= 2.5 ? 'B' : 'C') }]}                {formatGPA(predictedGPA)}
              </Text            </VStack          )}
        </HStack>
        {/* Trend */}
        <View style={styles.trendContainer}          <Text style={styles.trendLabel}>Performance Trend</Text          ><Text style={[styles.trendValue, { color: trendColor }]}            {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
          </Text        ></View
        {/* Target Progress */}
        <View style={styles.progressContainer}          <Text style={styles.progressLabel}>Target: {formatGPA(targetGPA)}</Text          ><View style={styles.progressBar}            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${Math.min(100, (currentGPA / 4.0) * 100)}%`,
                  backgroundColor: isOnTrack ? Theme.colors.success : Theme.colors.warning
                }
              ]} 
            /          ></View          <Text style={styles.progressText}            {gapToTarget > 0 ? `${formatGPA(gapToTarget)} to target` : 'Target achieved!'}
          </Text        </View
        {/* Recommendations */}
        <View style={styles.recommendationsContainer}          <Text style={styles.recommendationsTitle}>Recommendations</Text          ><VStack space="xs"            {generateRecommendations(currentGPA, trendDirection, gapToTarget).map((rec, index) => (
              <Text key={index} style={styles.recommendationText}                " {rec}>
              </Text            ))}>
          </VStack        </View      </VStack    </Card  );
}

function generateRecommendations(
  currentGPA: number, 
  trendDirection: string, 
  gapToTarget: number
): string[] {
  const recommendations: string[] = [];
  
  if (trendDirection === 'declining') {
    recommendations.push('Focus on recent assignments to reverse declining trend');
    recommendations.push('Consider additional study support or tutoring');
  } else if (trendDirection === 'improving') {
    recommendations.push('Maintain current study habits and momentum');
  }
  
  if (gapToTarget > 0.5) {
    recommendations.push('Significant improvement needed to reach target GPA');
    recommendations.push('Focus on high-impact assignments and exams');
  } else if (gapToTarget > 0) {
    recommendations.push('Close to target - maintain consistent performance');
  }
  
  if (currentGPA < 2.0) {
    recommendations.push('Academic probation risk - seek immediate support');
  }
  
  return recommendations;
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  gpaRow: {
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  gpaLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  gpaValue: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  trendContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  trendLabel: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: Theme.spacing.md,
  },
  progressLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.border,
    borderRadius: 4,
    marginBottom: Theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  recommendationsContainer: {
    marginTop: Theme.spacing.md,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
});
