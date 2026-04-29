import { Card, HStack, VStack } from '@repo/ui';
import { Theme } from '@repo/ui/theme';

import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

interface HeatmapData {
  x: number;
  y: number;
  value: number;
  label?: string;
}

interface HeatmapChartProps {
  title: string;
  data: HeatmapData[];
  gridSize?: number;
  colorScale?: string[];
  showLabels?: boolean;
  showLegend?: boolean;
}

export function HeatmapChart({
  title,
  data,
  gridSize = 10,
  colorScale = [
    '#f7fafc',
    '#dbeafe',
    '#a7f3d',
    '#fde68a',
    '#fbbf24',
    '#f87171',
    '#dc2626',
    '#b91c1c',
  ],
  showLabels = true,
  showLegend = true,
}: HeatmapChartProps) {
  const { width } = Dimensions.get('window');
  const cellSize = Math.min(40, (width - 100) / gridSize);
  const maxValue = Math.max(...data.map((d) => d.value));

  // Create grid data
  const grid = Array.from({ length: gridSize }, (_, y) =>
    Array.from({ length: gridSize }, (_, x) => {
      const point = data.find((d) => d.x === x && d.y === y);
      return {
        x,
        y,
        value: point?.value || 0,
        label: point?.label,
      };
    }),
  );

  const getColor = (value: number) => {
    const index = Math.min(
      Math.floor((value / maxValue) * (colorScale.length - 1)),
      colorScale.length - 1,
    );
    return colorScale[index];
  };

  return (
    <Card style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <VStack space="sm">
        {/* Heatmap Grid */}
        <View style={styles.heatmapContainer}>
          {grid.map((row, y) => (
            <HStack key={`row-${y}`} style={styles.row}>
              {row.map((cell, x) => (
                <View
                  key={`cell-${x}-${y}`}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: getColor(cell.value),
                      width: cellSize,
                      height: cellSize,
                      borderWidth: 1,
                      borderColor: Theme.colors.border,
                    },
                  ]}
                >
                  {showLabels && cell.label && <Text style={styles.cellLabel}>{cell.label}</Text>}
                </View>
              ))}
            </HStack>
          ))}
        </View>

        {/* Legend */}
        {showLegend && (
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Intensity Scale</Text>
            <HStack style={styles.legendItems}>
              {colorScale.map((color, index) => (
                <HStack key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: color }]} />
                  <Text style={styles.legendLabel}>
                    {Math.round((index / (colorScale.length - 1)) * maxValue)}
                  </Text>
                </HStack>
              ))}
            </HStack>
          </View>
        )}
      </VStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  heatmapContainer: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  cellLabel: {
    fontSize: 10,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  legend: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.corners.comfortable,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  legendLabel: {
    fontSize: 12,
    color: Theme.colors.text,
  },
});
