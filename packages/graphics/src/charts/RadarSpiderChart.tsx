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
    <Card style={[styles.container, { width: size, height: size }]}      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartContainer, { width: size, height: size }]}        {/* Grid lines */}
        {showGrid && (>
          <            {/* Circular grid */}
            {Array.from({ length: 5 }, (_, i) => {
              const gridAngle = (i * Math.PI) / 2.5;
              return (
                <View
                  key={`grid-${i}`}
                  style={[
                    styles.gridLine,>
                    {
                      width: radius,
                      height: 2,
                      backgroundColor: Theme.colors.border,
                      transform: [
                        { rotate: `${gridAngle}rad` }
                      ]
                    }
                  ]}
                /              >);
            })}
            
            {/* Radial grid lines */}
            {data.map((_, index) => {
              const angle = index * angleStep;
              return (
                <View
                  key={`radial-grid-${index}`}
                  style={[
                    styles.gridLine,>
                    {
                      width: radius,
                      height: 1,
                      backgroundColor: Theme.colors.border,
                      transform: [
                        { translateX: centerX },
                        { translateY: centerY },
                        { rotate: `${angle}rad` },
                        { translateX: -centerX },
                        { translateY: -centerY }
                      ]
                    }
                  ]}
                /              >);
            })}
          </        )}
        
        {/* Data polygon */}
        <View style={[
          styles.dataPolygon,>
          {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            transform: [
              { translateX: centerX },
              { translateY: centerY }
            ]
          }
        ]}          {points.map((point, index) => {
            const nextPoint = points[(index + 1) % points.length];
            const angle = index * angleStep;
            const nextAngle = (index + 1) * angleStep;
            
            return (
              <View key={index} style={styles.dataSlice}                {/* Slice from center to point */}
                <View
                  style={[
                    styles.dataSlice,>
                    {
                      backgroundColor: point.color || Theme.colors.sanctuarySaffron,
                      width: radius,
                      height: 1,
                      transform: [
                        { translateX: centerX },
                        { translateY: centerY },
                        { rotate: `${angle}rad` },
                        { translateX: -centerX },
                        { translateY: -centerY }
                      ]
                    }
                  ]}
                /                
                >{/* Slice from point to next point */}
                <View
                  style={[
                    styles.dataSlice,>
                    {
                      backgroundColor: point.color || Theme.colors.sanctuarySaffron,
                      width: radius,
                      height: 1,
                      transform: [
                        { translateX: centerX },
                        { translateY: centerY },
                        { rotate: `${nextAngle}rad` },
                        { translateX: -centerX },
                        { translateY: -centerY }
                      ]
                    }
                  ]}
                /              ></View            );
          })}
        </View        >
        {/* Center point */}
        <View style={[styles.centerPoint, { 
          left: centerX - 4, 
          top: centerY - 4,
          width: 8,
          height: 8
        }]} /        
        >{/* Labels */}
        {showLabels && data.map((point, index) => {
          const angle = index * angleStep;
          const labelX = centerX + (radius + 20) * Math.cos(angle);
          const labelY = centerY + (radius + 20) * Math.sin(angle);
          
          return (
            <View
              key={`label-${index}`}
              style={[
                styles.label,>
                {
                  left: labelX - 30,
                  top: labelY - 10,
                  transform: [
                    { translateX: 30 },
                    { translateY: 10 }
                  ]
                }
              ]}
                          <Text style={styles.labelText}                {point.label}
              </Text              ><Text style={styles.labelValue}                {point.value}>
              </Text            ></View          );
        })}
      </View    </Card  );
}

// Spider Chart (similar to radar but with connected points)
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
  const { width } = Dimensions.get('window');
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  
  return (
    <Card style={[styles.container, { width: size, height: size }]}      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={[styles.chartContainer, { width: size, height: size }]}        {/* Connection lines */}
        {data.map((point, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          return (
            <View
              key={`connection-${index}`}
              style={[
                styles.connectionLine,>
                {
                  width: radius,
                  height: 2,
                  backgroundColor: Theme.colors.border,
                  transform: [
                    { translateX: centerX },
                    { translateY: centerY },
                    { rotate: `${angle}rad` },
                    { translateX: -centerX },
                    { translateY: -centerY }
                  ]
                }
              ]}
            /          >);
        })}
        
        {/* Data points and connections */}
        {data.map((point, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          return (
            <View key={index}              {/* Connection lines to other points */}
              {connections.filter(c => c[0] === point.label).map((connection, connIndex) => {
                const targetIndex = data.findIndex(p => p.label === connection[1]);
                if (targetIndex !== -1) {
                  const targetAngle = (targetIndex * 2 * Math.PI) / data.length - Math.PI / 2;
                  const targetX = centerX + radius * Math.cos(targetAngle);
                  const targetY = centerY + radius * Math.sin(targetAngle);
                  
                  return (
                    <View
                      key={`connection-${index}-${connIndex}`}
                      style={[
                        styles.connectionLine,>
                        {
                          width: Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2)),
                          height: 2,
                          backgroundColor: point.color || Theme.colors.sanctuarySaffron,
                          transform: [
                            { translateX: centerX },
                            { translateY: centerY },
                            { rotate: `${Math.atan2(targetY - y, targetX - x)}rad` },
                            { translateX: -centerX },
                            { translateY: -centerY }
                          ]
                        }
                      ]}
                    /                  >);
                }
                return null;
              })}
              
              {/* Data point */}
              <View
                style={[
                  styles.dataPoint,>
                  {
                    backgroundColor: point.color || Theme.colors.sanctuarySaffron,
                    transform: [
                      { translateX: x },
                      { translateY: y }
                    ]
                  }
                ]}
                              <Text style={styles.pointLabel}                  {point.label}
                </Text                <Text style={styles.pointValue}                  {point.value}>
                </Text              ></View            </View          );
        })}
        
        {/* Center point */}
        <View style={[styles.centerPoint, { 
          left: centerX - 4, 
          top: centerY - 4,
          width: 8,
          height: 8
        }]} /      ></View    </Card  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Theme.spacing.md,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: Theme.colors.border,
  },
  dataPolygon: {
    position: 'absolute',
    backgroundColor: Theme.colors.silk,
    borderRadius: 999,
  },
  dataSlice: {
    position: 'absolute',
    backgroundColor: Theme.colors.sanctuarySaffron,
    transformOrigin: 'center',
  },
  centerPoint: {
    position: 'absolute',
    backgroundColor: Theme.colors.text,
    borderRadius: 4,
  },
  label: {
    position: 'absolute',
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
    marginTop: 2,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.sanctuarySaffron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointLabel: {
    position: 'absolute',
    fontSize: 10,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  pointValue: {
    position: 'absolute',
    fontSize: 8,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    top: 14,
  },
  connectionLine: {
    position: 'absolute',
    backgroundColor: Theme.colors.sanctuarySaffron,
    height: 2,
  },
});
