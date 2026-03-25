import { BenchmarkData } from '../types/AnalyticsTypes';

export const EDUCATION_BENCHMARKS: BenchmarkData[] = [
  {
    institutionType: 'public',
    size: 'small',
    region: 'national',
    metrics: {
      averageGPA: 3.1,
      attendanceRate: 0.85,
      graduationRate: 0.78,
      studentSatisfaction: 0.72
    }
  },
  {
    institutionType: 'public',
    size: 'medium',
    region: 'national',
    metrics: {
      averageGPA: 3.0,
      attendanceRate: 0.83,
      graduationRate: 0.76,
      studentSatisfaction: 0.70
    }
  },
  {
    institutionType: 'public',
    size: 'large',
    region: 'national',
    metrics: {
      averageGPA: 2.9,
      attendanceRate: 0.81,
      graduationRate: 0.74,
      studentSatisfaction: 0.68
    }
  },
  {
    institutionType: 'private',
    size: 'small',
    region: 'national',
    metrics: {
      averageGPA: 3.4,
      attendanceRate: 0.92,
      graduationRate: 0.88,
      studentSatisfaction: 0.85
    }
  },
  {
    institutionType: 'private',
    size: 'medium',
    region: 'national',
    metrics: {
      averageGPA: 3.3,
      attendanceRate: 0.90,
      graduationRate: 0.86,
      studentSatisfaction: 0.83
    }
  },
  {
    institutionType: 'private',
    size: 'large',
    region: 'national',
    metrics: {
      averageGPA: 3.2,
      attendanceRate: 0.88,
      graduationRate: 0.84,
      studentSatisfaction: 0.80
    }
  }
];

export function getBenchmarkData(
  institutionType: 'public' | 'private' | 'charter',
  size: 'small' | 'medium' | 'large',
  region: string = 'national'
): BenchmarkData | null {
  return EDUCATION_BENCHMARKS.find(benchmark => 
    benchmark.institutionType === institutionType &&
    benchmark.size === size &&
    benchmark.region === region
  ) || null;
}

export function compareWithBenchmark(
  yourMetrics: { averageGPA: number; attendanceRate: number; graduationRate: number; studentSatisfaction: number },
  benchmark: BenchmarkData
): { metric: string; yours: number; benchmark: number; difference: number; status: 'above' | 'below' | 'equal' }[] {
  const metrics = [
    { name: 'averageGPA', label: 'Average GPA' },
    { name: 'attendanceRate', label: 'Attendance Rate' },
    { name: 'graduationRate', label: 'Graduation Rate' },
    { name: 'studentSatisfaction', label: 'Student Satisfaction' }
  ];

  return metrics.map(({ name, label }) => {
    const yours = yourMetrics[name as keyof typeof yourMetrics];
    const benchmarkValue = benchmark.metrics[name as keyof typeof benchmark.metrics];
    const difference = yours - benchmarkValue;
    const status = difference > 0.01 ? 'above' : difference < -0.01 ? 'below' : 'equal';

    return {
      metric: label,
      yours,
      benchmark: benchmarkValue,
      difference,
      status
    };
  });
}

export function generateBenchmarkInsights(comparison: { metric: string; status: 'above' | 'below' | 'equal' }[]): string[] {
  const insights: string[] = [];
  
  const aboveMetrics = comparison.filter(c => c.status === 'above');
  const belowMetrics = comparison.filter(c => c.status === 'below');
  
  if (aboveMetrics.length >= 3) {
    insights.push('Your institution is performing above benchmark in most areas. Excellent performance!');
  } else if (aboveMetrics.length >= 2) {
    insights.push('Your institution shows strong performance in several key areas.');
  }
  
  if (belowMetrics.length >= 3) {
    insights.push('Multiple areas below benchmark. Comprehensive improvement strategy recommended.');
  } else if (belowMetrics.length >= 2) {
    insights.push('Some areas need attention to reach benchmark standards.');
  }
  
  belowMetrics.forEach(metric => {
    insights.push(`Focus on improving ${metric.metric} to reach benchmark levels.`);
  });
  
  return insights;
}
