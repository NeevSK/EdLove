import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VStack, HStack, Card, Theme } from '@repo/ui';

interface RadarPoint {
  label: string;
  value: number;
  color?: string;
}

interface RadarChartProps {
  title: string;
  data: RadarPoint[];
  maxValue?: number;
  size?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  animationDuration?: number;
}

export function RadarChart({
  title,
  data,
  maxValue = 100,
  size = 300,
  showLabels = true,
  showGrid = true,
  animationDuration = 1000
}: RadarChartProps) {
  const { width } = Dimensions.get('window');
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  
  // Calculate angles for each point
  const angleStep = (2 * Math.PI) / data.length;
  const points = data.map((point, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, label: point.label, value: point.value, color: point.color };
  });

  return (
    <Card style={[styles.container, { width: size, height: size }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        {/* Grid lines */}
        {showGrid && (
          <View style={StyleSheet.absoluteFill}>
            {/* Circular grid */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
              <View
                key={`grid-circle-${i}`}
                style={[
                  styles.gridCircle,
                  {
                    width: radius * 2 * scale,
                    height: radius * 2 * scale,
                    borderRadius: radius * scale,
                    left: centerX - radius * scale,
                    top: centerY - radius * scale,
                    borderColor: Theme.colors.border,
                    borderWidth: 1,
                  }
                ]}
              />
            ))}
            
            {/* Radial grid lines */}
            {data.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2;
              return (
                <View
                  key={`radial-grid-${index}`}
                  style={[
                    styles.gridLine,
                    {
                      width: radius,
                      height: 1,
                      left: centerX,
                      top: centerY,
                      backgroundColor: Theme.colors.border,
                      transform: [
                        { rotate: `${angle}rad` },
                        { translateX: radius / 2 }
                      ]
                    }
                  ]}
                />
              );
            })}
          </View>
        )}
        
        {/* Data polygon - Simplified representation for React Native using lines */}
        <View style={StyleSheet.absoluteFill}>
          {points.map((point, index) => {
            const nextPoint = points[(index + 1) % points.length];
            // Calculate distance between points for line length
            const dist = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
            
            return (
              <View 
                key={`data-line-${index}`}
                style={[
                  styles.dataLine,
                  {
                    width: dist,
                    height: 2,
                    left: point.x,
                    top: point.y,
                    backgroundColor: point.color || Theme.colors.sanctuarySaffron,
                    transform: [
                      { rotate: `${angle}rad` },
                      { translateX: dist / 2 }
                    ]
                  }
                ]}
              />
            );
          })}
        </View>

        {/* Labels */}
        {showLabels && points.map((point, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const labelX = centerX + (radius + 20) * Math.cos(angle);
          const labelY = centerY + (radius + 20) * Math.sin(angle);
          
          return (
            <View
              key={`label-${index}`}
              style={[
                styles.label,
                {
                  left: labelX - 40,
                  top: labelY - 15,
                  width: 80,
                }
              ]}
            >
              <Text style={styles.labelText}>{point.label}</Text>
              <Text style={styles.labelValue}>{point.value}</Text>
            </View>
          );
        })}
        
        {/* Center point */}
        <View style={[styles.centerPoint, { 
          left: centerX - 4, 
          top: centerY - 4,
          width: 8,
          height: 8,
          backgroundColor: Theme.colors.text
        }]} />
      </View>
    </Card>
  );
}

// Spider Chart (similar to radar but emphasizing connections)
interface SpiderChartProps {
  title: string;
  data: RadarPoint[];
  connections?: string[][];
  maxValue?: number;
  size?: number;
  showLabels?: boolean;
}

export function SpiderChart({
  title,
  data,
  connections = [],
  maxValue = 100,
  size = 300,
  showLabels = true
}: SpiderChartProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  
  const angleStep = (2 * Math.PI) / data.length;
  const points = data.map((point, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, label: point.label, value: point.value, color: point.color };
  });

  return (
    <Card style={[styles.container, { width: size, height: size }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartContainer, { width: size, height: size }]}>
        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          return (
            <View
              key={`axis-${index}`}
              style={[
                styles.gridLine,
                {
                  width: radius,
                  height: 1,
                  left: centerX,
                  top: centerY,
                  backgroundColor: Theme.colors.border,
                  transform: [
                    { rotate: `${angle}rad` },
                    { translateX: radius / 2 }
                  ]
                }
              ]}
            />
          );
        })}
        
        {/* Connection lines from props */}
        {connections.map((conn, index) => {
          const startPoint = points.find(p => p.label === conn[0]);
          const endPoint = points.find(p => p.label === conn[1]);
          
          if (!startPoint || !endPoint) return null;
          
          const dist = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
          
          return (
            <View
              key={`connection-${index}`}
              style={[
                styles.connectionLine,
                {
                  width: dist,
                  height: 2,
                  left: startPoint.x,
                  top: startPoint.y,
                  backgroundColor: Theme.colors.sanctuarySaffron,
                  opacity: 0.6,
                  transform: [
                    { rotate: `${angle}rad` },
                    { translateX: dist / 2 }
                  ]
                }
              ]}
            />
          );
        })}
        
        {/* Data points */}
        {points.map((point, index) => (
          <View key={`point-container-${index}`} style={StyleSheet.absoluteFill} pointerEvents="none">
            <View
              style={[
                styles.dataPoint,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: point.color || Theme.colors.sanctuarySaffron,
                }
              ]}
            />
            {showLabels && (
              <View
                style={[
                  styles.pointLabelContainer,
                  {
                    left: point.x - 40,
                    top: point.y - 30,
                    width: 80,
                  }
                ]}
              >
                <Text style={styles.pointLabel}>{point.label}</Text>
                <Text style={styles.pointValue}>{point.value}</Text>
              </View>
            )}
          </View>
        ))}
        
        {/* Center point */}
        <View style={[styles.centerPoint, { 
          left: centerX - 4, 
          top: centerY - 4,
          width: 8,
          height: 8,
          backgroundColor: Theme.colors.text
        }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
  },
  gridCircle: {
    position: 'absolute',
  },
  dataLine: {
    position: 'absolute',
  },
  connectionLine: {
    position: 'absolute',
  },
  centerPoint: {
    position: 'absolute',
    borderRadius: 4,
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  labelValue: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pointLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pointLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  pointValue: {
    fontSize: 9,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});
