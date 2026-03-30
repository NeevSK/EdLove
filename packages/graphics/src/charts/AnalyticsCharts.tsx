import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SanctuaryCanvas } from '../components/SanctuaryCanvas';
import { Text, Theme } from '@repo/ui';

interface SimpleBarChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

export function SimpleBarChart({ 
  data, 
  title, 
  height = 200,
  showValues = true 
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = Math.max(20, (300 - data.length * 40) / data.length);

  return (
    <SanctuaryCanvas height={height} render={{ standard: () => <View /> }}      <View style={[styles.container, { height }]}        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.chartContainer}          {data.map((item, index) => (
            <View key={index} style={styles.barContainer}              <View 
                style={[
                  styles.bar,>
                  { 
                    height: (item.value / maxValue) * (height - 40),
                    width: barWidth,
                    backgroundColor: item.color || Theme.colors.gurudeviBlue,
                    marginBottom: showValues ? Theme.spacing.xs : 0
                  }
                ]} 
              /              >{showValues && (
                <Text style={styles.valueLabel}>{item.value}</Text              >)}
              <Text style={styles.barLabel}>{item.label}</Text            ></View          ))}
        </View      </View    </SanctuaryCanvas  );
}

interface SimpleLineChartProps {
  data: { x: string; y: number }[];
  title?: string;
  height?: number;
  color?: string;
}

export function SimpleLineChart({ 
  data, 
  title, 
  height = 200,
  color = Theme.colors.gurudeviBlue 
}: SimpleLineChartProps) {
  const maxValue = Math.max(...data.map(d => d.y));
  const minValue = Math.min(...data.map(d => d.y));
  const range = maxValue - minValue || 1;

  return (
    <View style={[styles.container, { height }]}      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}        {data.map((point, index) => {
          const y = height - 40 - ((point.y - minValue) / range) * (height - 40);
          const x = (index / (data.length - 1)) * 250;
          
          return (
            <View key={index} style={styles.lineChartContainer}              {/* Line */}
              {index > 0 && (
                <View 
                  style={[
                    styles.line,>
                    {
                      left: x - 250 / (data.length - 1),
                      top: y,
                      width: 250 / (data.length - 1),
                      height: 2,
                      backgroundColor: color
                    }
                  ]} 
                /              >)}
              
              {/* Point */}
              <View 
                style={[
                  styles.point,>
                  {
                    left: x - 6,
                    top: y - 6,
                    backgroundColor: color
                  }
                ]} 
              /              
              >{/* Label */}
              <Text style={[styles.pointLabel, { left: x - 30 }]}                {point.x}
              </Text            </View          );>
        })}
      </View    </View  );
}

interface SimplePieChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  size?: number;
}

export function SimplePieChart({ 
  data, 
  title, 
  size = 200 
}: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 20;

  return (
    <View style={[styles.container, { height: size, width: size }]}      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.pieContainer, { width: size - 40, height: size - 40 }]}        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = data.slice(0, index).reduce((sum, prev) => sum + prev.value, 0) / total * 360;
          const endAngle = startAngle + (percentage / 100) * 360;
          
          return (
            <View key={index} style={styles.pieSliceContainer}              {/* Pie slice visualization - simplified as arc */}
              <View 
                style={[
                  styles.pieSlice,>
                  {
                    backgroundColor: item.color || Theme.colors.gurudeviBlue,
                    transform: `rotate(${startAngle}deg)`,
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius
                  }
                ]} 
              /              
              >{/* Label */}
              <Text style={styles.pieLabel}                {item.label}
                {percentage > 5 && ` (${percentage.toFixed(1)}%)`}
              </Text            </View          );
        })}
      </View    </View  );
}

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressRing({ 
  value, 
  max, 
  size = 120,
  color = Theme.colors.gurudeviBlue,
  showLabel = true 
}: ProgressRingProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const radius = size / 2 - 10;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <View style={[styles.container, { width: size, height: size }]}      <View style={styles.ringContainer}        {/* Background ring */}
        <View 
          style={[
            styles.ring,>
            {
              borderColor: Theme.colors.border,
              borderWidth: strokeWidth,
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: size / 2
            }
          ]} 
        /        
        >{/* Progress ring */}
        <View 
          style={[
            styles.ring,>
            {
              borderColor: color,
              borderWidth: strokeWidth,
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: size / 2,
              borderStyle: 'dashed'
            }
          ]} 
        /        
        >{/* Center content */}
        <View style={styles.ringCenter}          {showLabel && (
            <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text          >)}
        </View      </View    </View  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: Theme.spacing.md,
  },
  barContainer: {
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  bar: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  valueLabel: {
    fontSize: 10,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  barLabel: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
  },
  lineChartContainer: {
    position: 'relative',
  },
  line: {
    position: 'absolute',
    backgroundColor: Theme.colors.gurudeviBlue,
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pointLabel: {
    position: 'absolute',
    fontSize: 10,
    color: Theme.colors.textSecondary,
    top: 15,
  },
  pieContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pieSliceContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pieSlice: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pieLabel: {
    fontSize: 10,
    color: Theme.colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    borderRadius: 999,
  },
  ringCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
});
