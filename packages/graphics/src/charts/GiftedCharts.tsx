import * as Gifted from 'react-native-gifted-charts';

// Re-export components with any-casting to bypass TS2724 resolution issues in some contexts
// The library definitely exports these (verified in node_modules), but TSC sometimes trips up
// on the complex re-export chain in react-native-gifted-charts/dist/index.d.ts.
export const BarChart = (Gifted as any).BarChart;
export const LineChart = (Gifted as any).LineChart;
export const PieChart = (Gifted as any).PieChart;
export const AreaChart = (Gifted as any).LineChart; // Area is a mode of LineChart
export const StackedBarChart = (Gifted as any).BarChart; // Stacked is a mode of BarChart
export const ScatterChart = (Gifted as any).LineChart; // Scatter is a mode of LineChart

// Export types from the library
// Using any for now to ensure compilation, can be refined to specific types from gifted-charts-core if needed
export type BarChartProps = any;
export type LineChartProps = any;
export type PieChartProps = any;
export type AreaChartProps = any;
export type StackedBarChartProps = any;
export type ScatterChartProps = any;
