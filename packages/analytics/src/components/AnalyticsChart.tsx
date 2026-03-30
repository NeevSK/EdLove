import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@repo/ui';
import { SimpleBarChart, SimpleLineChart, SimplePieChart, ProgressRing } from '@repo/graphics';

interface AnalyticsChartProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  type?: 'bar' | 'line' | 'pie' | 'progress';
  height?: number;
  showValues?: boolean;
  maxValue?: number;
}

export function AnalyticsChart({ 
  title, 
  data, 
  type = 'bar', 
  height = 200,
  showValues = true,
  maxValue 
}: AnalyticsChartProps) {
  switch (type) {
    case 'bar':
      return (
        <SimpleBarChart
          title={title}
          data={data}
          height={height}
          showValues={showValues}
        /      );
    
    case 'line':
      return (
        <SimpleLineChart
          title={title}
          data={data.map(d => ({ x: d.label, y: d.value }))}
          height={height}
          color={data[0]?.color}
        /      );
    
    case 'pie':
      return (
        <SimplePieChart
          title={title}
          data={data}
          size={height}
        /      );
    
    case 'progress':
      const progressValue = data[0]?.value || 0;
      const progressMax = maxValue || 100;
      return (
        <View style={[styles.container, { height }]}          {title && <Text style={styles.title}>{title}</Text>}
          <ProgressRing
            value={progressValue}
            max={progressMax}
            size={Math.min(height, 150)}
            color={data[0]?.color}
            showLabel={true}
          /          <Text style={styles.progressLabel}            {data[0]?.label}: {progressValue}/{progressMax}
          </Text        </View      );
    
    default:
      return null;
  }
}

// Enhanced analytics chart with multiple series
interface MultiSeriesChartProps {
  title: string;
  series: {
    name: string;
    data: { x: string; y: number }[];
    color?: string;
  }[];
  type?: 'line' | 'bar';
  height?: number;
}

export function MultiSeriesChart({ 
  title, 
  series, 
  type = 'line', 
  height = 250 
}: MultiSeriesChartProps) {
  return (
    <View style={[styles.container, { height }]}      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.multiChartContainer}        {series.map((s, index) => (
          <View key={index} style={styles.seriesContainer}            <Text style={[styles.seriesLabel, { color: s.color || Theme.colors.gurudeviBlue }]}              {s.name}
            </Text            {type === 'line' ? (
              <SimpleLineChart
                data={s.data}
                height={height - 60}
                color={s.color}
              /            ) : (
              <SimpleBarChart
                data={s.data.map(d => ({ label: d.x, value: d.y, color: s.color }))}
                height={height - 60}
                showValues={false}
              /            )}
          </View        ))}
      </View    </View  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  multiChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seriesContainer: {
    flex: 1,
    alignItems: 'center',
  },
  seriesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    flex: 1,
  },
  pieSlice: {
    alignItems: 'center',
    margin: Theme.spacing.xs,
  },
  pieSegment: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: Theme.spacing.xs,
  },
  pieLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
});
