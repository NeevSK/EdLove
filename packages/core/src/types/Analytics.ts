// Moved from packages/analytics/src/types/AnalyticsTypes.ts (2026-11-11): @repo/core owns every contract.

export interface StudentPerformanceMetrics {
  studentId: string;
  currentGPA: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  averageMarks: number;
  rankInClass: number;
  totalStudents: number;
  subjectPerformance: { [subject: string]: number };
  attendanceImpact: number;
  submissionRate: number;
  predictedGPA?: number;
  confidence?: number;
}

export interface ClassAnalytics {
  classId: string;
  totalStudents: number;
  averageGPA: number;
  averageMarks: number;
  gradeDistribution: { [grade: string]: number };
  topPerformers: string[];
  atRiskStudents: string[];
  attendanceCorrelation: number;
  submissionCorrelation: number;
  insights: string[];
}

export interface PredictionRequest {
  studentId: string;
  predictionType: 'gpa' | 'dropout_risk' | 'performance_trend';
  timeHorizon: 'month' | 'quarter' | 'semester' | 'year';
  factors?: string[];
}

export interface PredictionResult {
  prediction: number;
  confidence: number;
  factors: { name: string; impact: number; description: string }[];
  recommendations: string[];
  lastUpdated: string;
}

export interface BenchmarkData {
  institutionType: 'public' | 'private' | 'charter';
  size: 'small' | 'medium' | 'large';
  region: string;
  metrics: {
    averageGPA: number;
    attendanceRate: number;
    graduationRate: number;
    studentSatisfaction: number;
  };
}

export interface TenantMetrics {
  id: string;
  metrics: { [key: string]: number };
}

export interface LiveMetrics {
  active_users: number;
  api_requests_per_minute: number;
  error_rate: number;
  system_health: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  resource_usage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export interface CustomReportConfig {
  id: string;
  name: string;
}
