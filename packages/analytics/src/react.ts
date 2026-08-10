// React Components, Contexts, and Hooks for Analytics UI
export { AnalyticsChart, MultiSeriesChart } from './components/AnalyticsChart';
export {
  AnalyticsProvider,
  useAnalyticsContext,
} from './components/AnalyticsProvider';
export { GPAInsights } from './components/GPAInsights';
export { PerformanceDashboard } from './components/PerformanceDashboard';
export { useAnalytics } from './hooks/useAnalytics';
export {
  predictor,
  useClassPerformance,
  useClassPerformanceData,
  usePredictions,
  useStudentPerformance,
  useStudentPerformanceData,
} from './hooks/queries';
export { usePerformanceData } from './hooks/usePerformanceData';
