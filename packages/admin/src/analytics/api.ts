import { multiTenantAnalyticsEngine } from '@/analytics/engine';
import type {
  Anomaly,
  BenchmarkInsights,
  BenchmarkReport,
  CustomReportConfig,
  DateRange,
  EducationSector,
  Insight,
  LiveMetrics,
  MetricDefinition,
  Prediction,
  ReportResult,
  TenantComparison,
  TenantMetrics,
  Trend,
} from '@/analytics/types';

export interface MultiTenantAnalyticsAPI {
  // Data aggregation
  aggregateTenantMetrics(tenantIds: string[], timeRange: DateRange): Promise<TenantMetrics[]>;
  compareTenantPerformance(
    tenantIds: string[],
    metrics: MetricDefinition[],
    industry: EducationSector,
  ): Promise<TenantComparison[]>;
  generateBenchmarkReports(
    tenantIds: string[],
    industry: EducationSector,
  ): Promise<BenchmarkReport[]>;

  // Real-time analytics
  getLiveMetrics(tenantId: string): Promise<LiveMetrics>;
  createCustomReport(config: CustomReportConfig): Promise<ReportResult>;
  scheduleReport(reportConfig: CustomReportConfig, schedule: any): Promise<string>;

  // Pattern recognition
  detectAnomalies(tenantId: string, metrics: MetricDefinition[]): Promise<Anomaly[]>;
  identifyTrends(tenantId: string, timeRange: DateRange): Promise<Trend[]>;
  predictOutcomes(historicalData: any): Promise<Prediction[]>;

  // Recommendations
  generateRecommendations(tenantId: string, context: any): Promise<Insight[]>;
  benchmarkPerformance(tenantId: string, industry: EducationSector): Promise<BenchmarkInsights>;
}

export const multiTenantAnalyticsAPI: MultiTenantAnalyticsAPI = {
  // Data aggregation
  async aggregateTenantMetrics(
    tenantIds: string[],
    timeRange: DateRange,
  ): Promise<TenantMetrics[]> {
    return await multiTenantAnalyticsEngine.aggregateTenantMetrics(tenantIds, timeRange);
  },

  async compareTenantPerformance(
    tenantIds: string[],
    metrics: MetricDefinition[],
    industry: EducationSector,
  ): Promise<TenantComparison[]> {
    return await multiTenantAnalyticsEngine.compareTenantPerformance(tenantIds, metrics, industry);
  },

  async generateBenchmarkReports(
    tenantIds: string[],
    industry: EducationSector,
  ): Promise<BenchmarkReport[]> {
    return await multiTenantAnalyticsEngine.generateBenchmarkReports(tenantIds, industry);
  },

  // Real-time analytics
  async getLiveMetrics(tenantId: string): Promise<LiveMetrics> {
    return await multiTenantAnalyticsEngine.getLiveMetrics(tenantId);
  },

  async createCustomReport(config: CustomReportConfig): Promise<ReportResult> {
    return await multiTenantAnalyticsEngine.createCustomReport(config);
  },

  async scheduleReport(reportConfig: CustomReportConfig, schedule: any): Promise<string> {
    return await multiTenantAnalyticsEngine.scheduleReport(reportConfig, schedule);
  },

  // Pattern recognition
  async detectAnomalies(tenantId: string, metrics: MetricDefinition[]): Promise<Anomaly[]> {
    return await multiTenantAnalyticsEngine.detectAnomalies(tenantId, metrics);
  },

  async identifyTrends(tenantId: string, timeRange: DateRange): Promise<Trend[]> {
    return await multiTenantAnalyticsEngine.identifyTrends(tenantId, timeRange);
  },

  async predictOutcomes(historicalData: any): Promise<Prediction[]> {
    return await multiTenantAnalyticsEngine.predictOutcomes('tenant-id', historicalData);
  },

  // Recommendations
  async generateRecommendations(tenantId: string, context: any): Promise<Insight[]> {
    return await multiTenantAnalyticsEngine.generateRecommendations(tenantId, context);
  },

  async benchmarkPerformance(
    tenantId: string,
    industry: EducationSector,
  ): Promise<BenchmarkInsights> {
    return await multiTenantAnalyticsEngine.benchmarkPerformance(tenantId, industry);
  },
};
