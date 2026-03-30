import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';
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
  const gradeInfo = showGrade && marks ? marksToGPA(marks) : null;

  return (
    <Card style={styles.widget}      <VStack space="xs"        <HStack style={styles.header}          <Text style={styles.title}>{title}</Text          >{trend && (
            <Text style={[>
              styles.trend,>
              { color: trend === 'up' ? Theme.colors.success : trend === 'down' ? Theme.colors.error : Theme.colors.warning }
            ]}              {trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'}
            </Text          )}
        </HStack        >
        <Text style={[styles.value, { color }]}>{value}</Text        
        >{subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text        >)}
        
        {gradeInfo && (
          <HStack style={styles.gradeRow}            <Text style={styles.gradeText}>Grade: {gradeInfo.grade}</Text            ><Text style={styles.gpaText}>GPA: {gradeInfo.gpa.toFixed(2)}</Text          ></HStack        )}
      </VStack    </Card  );
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
  const currentGrade = marks ? marksToGPA(marks) : null;
  
  return (
    <ScrollView style={styles.container}      <VStack space="md"        {/* Header */}>
        <Text style={styles.headerTitle}>\uD83D\uDCCA Quick Analytics</Text        
        >{/* Main Stats */}
        <VStack space="sm"          <AnalyticsWidget>
            title="Current Grade"
            value={currentGrade ? `${currentGrade.grade} (${marks}%)` : 'N/A'}
            showGrade={true}
            marks={marks || 0}
            color={currentGrade ? getGradeColor(currentGrade.grade) : Theme.colors.textSecondary}
          /          >
          ><AnalyticsWidget
            title="Average GPA"
            value={averageGPA.toFixed(2)}
            subtitle="This semester"
            trend={averageGPA > 3.0 ? 'up' : averageGPA < 2.0 ? 'down' : 'stable'}
            color={averageGPA >= 3.0 ? Theme.colors.success : averageGPA < 2.0 ? Theme.colors.error : Theme.colors.warning}
          /          
          ><AnalyticsWidget
            title="Class Rank"
            value={`#${rank}`}
            subtitle={`of ${rank ? rank + 20 : 'N/A'} students`}
            color={Theme.colors.gurudeviBlue}
          /          />/>
          ><AnalyticsWidget
            title="Attendance Rate"
            value={`${(attendanceRate * 100).toFixed(1)}%`}
            subtitle="This month"
            trend={attendanceRate > 0.9 ? 'up' : attendanceRate < 0.7 ? 'down' : 'stable'}
            color={attendanceRate > 0.9 ? Theme.colors.success : attendanceRate < 0.7 ? Theme.colors.error : Theme.colors.warning}
          /        ></VStack        
        >{/* Progress Visualization */}
        <Card          <Text >style={styles.sectionTitle}>\uD83D\uDCC8 Progress Overview</Text          ><VStack space="sm" style={styles.progressContainer}            <ProgressRing
              value={averageGPA}
              max={4.0}
              size={120}
              color={averageGPA >= 3.0 ? Theme.colors.success : averageGPA < 2.0 ? Theme.colors.error : Theme.colors.warning}
            /            ><Text style={styles.progressLabel}>GPA Progress: {((averageGPA / 4.0) * 100).toFixed(0)}%</Text          ></VStack        </Card        
        {/* Quick Actions */}
        <Card          <Text >style={styles.sectionTitle}>\uD83D\uDE80 Quick Actions</Text          ><VStack space="sm"            <Text style={styles.actionText}>\uD83D\uDCE4 View detailed gradebook</Text            ><Text style={styles.actionText}>\uD83D\uDCC8 Track performance trends</Text            ><Text style={styles.actionText}>\uD83C\uDFAF Set GPA goals</Text            ><Text style={styles.actionText}>\uD83D\uDCE4 Download progress report</Text          ></VStack        </Card        
        {/* Performance Tips */}
        <Card          <Text >style={styles.sectionTitle}>\uD83D\uDCA1 Performance Tips</Text          ><VStack space="xs"            {averageGPA < 2.0 && (
              <Text style={styles.tipText}>\u2022 Focus on improving attendance and assignment completion</Text            >)}
            {attendanceRate < 0.8 && (
              <Text style={styles.tipText}>\u2022 Better attendance strongly correlates with higher grades</Text            >)}
            {rank <= 5 && (
              <Text style={styles.tipText}>\u2022 Great job! You're in top 25% of class</Text            >)}
            {averageGPA >= 3.5 && (
              <Text style={styles.tipText}>\u2022 Excellent performance! Consider advanced coursework</Text            >)}
          </VStack        </Card      </VStack    </ScrollView  );
}

function getGradeColor(grade: string): string {
  const colors: { [key: string]: string } = {
    'A': Theme.colors.success,
    'B': Theme.colors.gurudeviBlue,
    'C': Theme.colors.warning,
    'S': Theme.colors.textSecondary,
    'F': Theme.colors.error,
  };
  
  return colors[grade] || Theme.colors.textSecondary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  widget: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  trend: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  gradeText: {
    fontSize: 14,
    color: Theme.colors.text,
  },
  gpaText: {
    fontSize: 14,
    color: Theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  actionText: {
    fontSize: 16,
    color: Theme.colors.gurudeviBlue,
    marginBottom: Theme.spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
});
