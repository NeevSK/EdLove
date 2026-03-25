import React from 'react';
import { 
  BarChart as GiftedBarChart,
  LineChart as GiftedLineChart,
  PieChart as GiftedPieChart,
  LineChart as GiftedAreaChart,
  BarChart as GiftedStackedBarChart,
  LineChart as GiftedScatterChart
} from 'react-native-gifted-charts';

// Re-export with proper typing
export const BarChart = GiftedBarChart;
export const LineChart = GiftedLineChart;
export const PieChart = GiftedPieChart;
export const AreaChart = GiftedAreaChart;
export const StackedBarChart = GiftedStackedBarChart;
export const ScatterChart = GiftedScatterChart;

// Note: Radar and Bubble charts may not be available in react-native-gifted-charts
// These can be added later if needed through custom implementations

// Export types from the library
export type BarChartProps = React.ComponentProps<typeof GiftedBarChart>;
export type LineChartProps = React.ComponentProps<typeof GiftedLineChart>;
export type PieChartProps = React.ComponentProps<typeof GiftedPieChart>;
export type AreaChartProps = React.ComponentProps<typeof GiftedAreaChart>;
export type StackedBarChartProps = React.ComponentProps<typeof GiftedStackedBarChart>;
export type ScatterChartProps = React.ComponentProps<typeof GiftedScatterChart>;
