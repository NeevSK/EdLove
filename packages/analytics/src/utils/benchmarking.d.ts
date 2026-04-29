import type { BenchmarkData } from '../types/AnalyticsTypes';
export declare const EDUCATION_BENCHMARKS: BenchmarkData[];
export declare function getBenchmarkData(
  institutionType: 'public' | 'private' | 'charter',
  size: 'small' | 'medium' | 'large',
  region?: string,
): BenchmarkData | null;
export declare function compareWithBenchmark(
  yourMetrics: {
    averageGPA: number;
    attendanceRate: number;
    graduationRate: number;
    studentSatisfaction: number;
  },
  benchmark: BenchmarkData,
): {
  metric: string;
  yours: number;
  benchmark: number;
  difference: number;
  status: 'above' | 'below' | 'equal';
}[];
export declare function generateBenchmarkInsights(
  comparison: {
    metric: string;
    status: 'above' | 'below' | 'equal';
  }[],
): string[];
//# sourceMappingURL=benchmarking.d.ts.map
