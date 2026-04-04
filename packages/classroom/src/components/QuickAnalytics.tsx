import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VStack, HStack, Card, Theme, useThemedColors } from '@repo/ui';
import { marksToGPA } from '@repo/analytics';
import { SimpleBarChart, ProgressRing } from '@repo/graphics';

interface AnalyticsWidgetProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  showGrade?: boolean;
  marks?: number;
}

function AnalyticsWidget({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color = Theme.colors.gurudeviBlue,
  showGrade = false,
  marks 
}: AnalyticsWidgetProps) {
  const gradeInfo = showGrade && marks !== undefined ? marksToGPA(marks) : null;
  const colors = useThemedColors();

  return (
    <Card sx={{ padding: Theme.spacing.md, marginBottom: Theme.spacing.sm }}>
      <VStack sx={{ gap: Theme.spacing.xs }}>
        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {trend && (
            <Text style={[
              styles.trend,
              { color: trend === 'up' ? Theme.colors.sageGreen : trend === 'down' ? Theme.colors.emberRed : Theme.colors.templeGold }
            ]}>
              {trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'}
            </Text>
          )}
        </HStack>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
        )}
        
        {gradeInfo && (
          <HStack sx={{ justifyContent: 'space-between', marginTop: Theme.spacing.xs }}>
            <Text style={[styles.gradeText, { color: colors.text }]}>Grade: {gradeInfo.grade}</Text>
            <Text style={[styles.gpaText, { color: colors.text }]}>GPA: {gradeInfo.gpa.toFixed(2)}</Text>
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

interface QuickAnalyticsProps {
  studentId?: string;
  classId?: string;
  marks?: number;
  averageGPA?: number;
  attendanceRate?: number;
  rank?: number;
}

export default function QuickAnalytics({ 
  studentId, 
  classId, 
  marks, 
  averageGPA = 0, 
  attendanceRate = 0, 
  rank = 0 
}: QuickAnalyticsProps) {
  const currentGrade = marks !== undefined ? marksToGPA(marks) : null;
  const colors = useThemedColors();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.primary }]}>
      <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.md }}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>📊 Quick Analytics</Text>
        
        <VStack sx={{ gap: Theme.spacing.sm }}>
          <AnalyticsWidget
            title="Current Grade"
            value={currentGrade ? `${currentGrade.grade} (${marks}%)` : 'N/A'}
            showGrade={true}
            marks={marks}
            color={currentGrade ? getGradeColor(currentGrade.grade) : colors.textSecondary}
          />
          <AnalyticsWidget
            title="Average GPA"
            value={averageGPA.toFixed(2)}
            subtitle="This semester"
            trend={averageGPA > 3.0 ? 'up' : averageGPA < 2.0 ? 'down' : 'stable'}
            color={averageGPA >= 3.0 ? Theme.colors.sageGreen : averageGPA < 2.0 ? Theme.colors.emberRed : Theme.colors.templeGold}
          />
          <AnalyticsWidget
            title="Class Rank"
            value={`#${rank || 'N/A'}`}
            subtitle={`of ${rank ? rank + 20 : 'N/A'} students`}
            color={Theme.colors.gurudeviBlue}
          />
          <AnalyticsWidget
            title="Attendance Rate"
            value={`${(attendanceRate * 100).toFixed(1)}%`}
            subtitle="This month"
            trend={attendanceRate > 0.9 ? 'up' : attendanceRate < 0.7 ? 'down' : 'stable'}
            color={attendanceRate > 0.9 ? Theme.colors.sageGreen : attendanceRate < 0.7 ? Theme.colors.emberRed : Theme.colors.templeGold}
          />
        </VStack>

        <Card sx={{ padding: Theme.spacing.md }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📈 Progress Overview</Text>
          <VStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
            <ProgressRing
              value={averageGPA}
              max={4.0}
              size={120}
              color={averageGPA >= 3.0 ? Theme.colors.sageGreen : averageGPA < 2.0 ? Theme.colors.emberRed : Theme.colors.templeGold}
            />
            <Text style={[styles.progressLabel, { color: colors.text }]}>GPA Progress: {((averageGPA / 4.0) * 100).toFixed(0)}%</Text>
          </VStack>
        </Card>

        <Card sx={{ padding: Theme.spacing.md }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🚀 Quick Actions</Text>
          <VStack sx={{ gap: Theme.spacing.sm }}>
            <Text style={styles.actionText}>📤 View detailed gradebook</Text>
            <Text style={styles.actionText}>📊 Track performance trends</Text>
            <Text style={styles.actionText}>🎯 Set GPA goals</Text>
            <Text style={styles.actionText}>📄 Download progress report</Text>
          </VStack>
        </Card>

        <Card sx={{ padding: Theme.spacing.md }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💡 Performance Tips</Text>
          <VStack sx={{ gap: Theme.spacing.xs }}>
            {averageGPA < 2.0 && (
              <Text style={[styles.tipText, { color: colors.text }]}>• Focus on improving attendance and assignment completion</Text>
            )}
            {attendanceRate < 0.8 && (
              <Text style={[styles.tipText, { color: colors.text }]}>• Better attendance strongly correlates with higher grades</Text>
            )}
            {rank > 0 && rank <= 5 && (
              <Text style={[styles.tipText, { color: colors.text }]}>• Great job! You're in top 5 of the class</Text>
            )}
            {averageGPA >= 3.5 && (
              <Text style={[styles.tipText, { color: colors.text }]}>• Excellent performance! Consider advanced coursework</Text>
            )}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}

function getGradeColor(grade: string): string {
  const colors: { [key: string]: string } = {
    'A': Theme.colors.sageGreen,
    'B': Theme.colors.gurudeviBlue,
    'C': Theme.colors.templeGold,
    'S': Theme.colors.starlightGray,
    'F': Theme.colors.emberRed,
  };
  
  return colors[grade] || Theme.colors.starlightGray;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as any,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as any,
  },
  trend: {
    fontSize: 14,
    fontWeight: '600' as any,
  },
  value: {
    fontSize: 20,
    fontWeight: '700' as any,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
  },
  gradeText: {
    fontSize: 14,
  },
  gpaText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as any,
    marginBottom: Theme.spacing.sm,
  },
  actionText: {
    fontSize: 16,
    color: Theme.colors.gurudeviBlue,
    marginBottom: Theme.spacing.xs,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
});
