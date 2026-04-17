import { supabase } from '@repo/core';

export type MetricDefinition = 
  | 'attendance_rate'
  | 'grade_average'
  | 'enrollment_count'
  | 'staff_turnover'
  | 'resource_utilization'
  | 'parent_engagement'
  | 'document_processing_time'
  | 'revenue_per_student'
  | 'operational_efficiency'
  | 'compliance_score';

export type DateRange = { 
  startDate: string;
  endDate: string;
};

export type TenantMetrics = { 
  tenantId: string;
  tenantName: string;
  tenantKind: 'internal' | 'customer' | 'demo' | 'sandbox';
  metrics: Record<MetricDefinition, number>;
  period: DateRange;
  benchmarks?: Record<MetricDefinition, number>;
};

export type TenantComparison = { 
  metric: MetricDefinition;
  tenants: Array<{
    tenantId: string;
    tenantName: string;
    value: number;
    rank: number;
    percentile: number;
  }>;
  industry: EducationSector;
  period: DateRange;
};

export type BenchmarkReport = { 
  industry: EducationSector;
  metric: MetricDefinition;
  benchmarks: {
    industry_average: number;
    top_quartile: number;
    bottom_quartile: number;
    median: number;
  };
  tenant_performance: {
    value: number;
    rank: number;
    percentile: number;
    improvement_suggestions: string[];
  };
  period: DateRange;
};

export type LiveMetrics = { 
  timestamp: string;
  active_users: number;
  concurrent_sessions: number;
  api_requests_per_minute: number;
  error_rate: number;
  system_health: 'healthy' | 'warning' | 'critical';
  resource_usage: {
    cpu: number;
    memory: number;
    storage: number;
  };
};

export type CustomReportConfig = { 
  id: string;
  name: string;
  description: string;
  metrics: MetricDefinition[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  schedule?: ScheduleConfig;
};

export type ReportFilter = { 
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
};

export type ScheduleConfig = { 
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:mm
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
};

export type ReportResult = { 
  id: string;
  configId: string;
  data: any[];
  metadata: {
    generatedAt: string;
    period: DateRange;
    recordCount: number;
    executionTime: number;
  };
  visualizations: ChartData[];
};

export type ChartData = { 
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  data: any[];
  config: ChartConfig;
};

export type ChartConfig = { 
  xAxis?: string;
  yAxis?: string;
  colorScheme?: string[];
  interactive?: boolean;
  responsive?: boolean;
  legend?: boolean;
  tooltip?: boolean;
};

export type EducationSector = 
  | 'elementary'
  | 'middle_school'
  | 'high_school'
  | 'higher_education'
  | 'vocational'
  | 'special_education';

export type Anomaly = { 
  id: string;
  tenantId: string;
  metric: MetricDefinition;
  type: 'spike' | 'drop' | 'trend' | 'outlier';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  value: number;
  expected_range: {
    min: number;
    max: number;
  };
  recommendations: string[];
};

export type Trend = { 
  metric: MetricDefinition;
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number; // 0-1
  period: DateRange;
  confidence: number; // 0-1
  projection?: {
    next_period: number;
    next_month: number;
    next_quarter: number;
  };
};

export type Prediction = { 
  metric: MetricDefinition;
  model: string;
  accuracy: number; // 0-1
  confidence: number; // 0-1
  timeframe: string;
  prediction: number;
  factors: Array<{
    factor: string;
    impact: number;
    correlation: number;
  }>;
  generatedAt: string;
};

export type Insight = { 
  id: string;
  tenantId: string;
  type: 'performance' | 'efficiency' | 'compliance' | 'engagement' | 'financial';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendations: string[];
  supporting_data: any;
  generatedAt: string;
  expiresAt?: string;
};

export type BenchmarkInsights = { 
  industry: EducationSector;
  tenant_performance: {
    overall_rank: number;
    total_tenants: number;
    percentile: number;
    strengths: MetricDefinition[];
    weaknesses: MetricDefinition[];
    opportunities: string[];
  };
  industry_trends: Array<{
    metric: MetricDefinition;
    trend: 'improving' | 'declining' | 'stable';
    drivers: string[];
  }>;
  recommendations: Array<{
    category: 'strategic' | 'operational' | 'financial' | 'compliance';
    action: string;
    expected_impact: string;
    timeline: string;
  }>;
};

// Mobile-first responsive chart configurations
export interface ResponsiveChartConfig {
  mobile: {
    height: number;
    width: number;
    fontSize: {
      title: number;
      axis: number;
      legend: number;
    };
    padding: number;
  };
  tablet: {
    height: number;
    width: number;
    fontSize: {
      title: number;
      axis: number;
      legend: number;
    };
    padding: number;
  };
  desktop: {
    height: number;
    width: number;
    fontSize: {
      title: number;
      axis: number;
      legend: number;
    };
    padding: number;
  };
}

// Web-specific analytics features
export interface WebAnalyticsFeatures {
  realTimeUpdates: boolean;
  interactiveCharts: boolean;
  drillDownCapabilities: boolean;
  exportFormats: ('png' | 'svg' | 'pdf' | 'excel')[];
  collaborationTools: {
    sharedDashboards: boolean;
    annotations: boolean;
    comments: boolean;
  };
  advancedFilters: {
    dateRangePicker: boolean;
    multiSelect: boolean;
    customQueries: boolean;
  };
}
