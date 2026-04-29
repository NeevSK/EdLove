export const EDUCATION_BENCHMARKS = [
  {
    institutionType: 'public',
    size: 'small',
    region: 'national',
    metrics: {
      averageGPA: 3.1,
      attendanceRate: 0.85,
      graduationRate: 0.78,
      studentSatisfaction: 0.72,
    },
  },
  {
    institutionType: 'public',
    size: 'medium',
    region: 'national',
    metrics: {
      averageGPA: 3.0,
      attendanceRate: 0.83,
      graduationRate: 0.76,
      studentSatisfaction: 0.7,
    },
  },
  {
    institutionType: 'public',
    size: 'large',
    region: 'national',
    metrics: {
      averageGPA: 2.9,
      attendanceRate: 0.81,
      graduationRate: 0.74,
      studentSatisfaction: 0.68,
    },
  },
  {
    institutionType: 'private',
    size: 'small',
    region: 'national',
    metrics: {
      averageGPA: 3.4,
      attendanceRate: 0.92,
      graduationRate: 0.88,
      studentSatisfaction: 0.85,
    },
  },
  {
    institutionType: 'private',
    size: 'medium',
    region: 'national',
    metrics: {
      averageGPA: 3.3,
      attendanceRate: 0.9,
      graduationRate: 0.86,
      studentSatisfaction: 0.83,
    },
  },
  {
    institutionType: 'private',
    size: 'large',
    region: 'national',
    metrics: {
      averageGPA: 3.2,
      attendanceRate: 0.88,
      graduationRate: 0.84,
      studentSatisfaction: 0.8,
    },
  },
];
export function getBenchmarkData(institutionType, size, region = 'national') {
  return (
    EDUCATION_BENCHMARKS.find(
      (benchmark) =>
        benchmark.institutionType === institutionType &&
        benchmark.size === size &&
        benchmark.region === region,
    ) || null
  );
}
export function compareWithBenchmark(yourMetrics, benchmark) {
  const metrics = [
    { name: 'averageGPA', label: 'Average GPA' },
    { name: 'attendanceRate', label: 'Attendance Rate' },
    { name: 'graduationRate', label: 'Graduation Rate' },
    { name: 'studentSatisfaction', label: 'Student Satisfaction' },
  ];
  return metrics.map(({ name, label }) => {
    const yours = yourMetrics[name];
    const benchmarkValue = benchmark.metrics[name];
    const difference = yours - benchmarkValue;
    const status = difference > 0.01 ? 'above' : difference < -0.01 ? 'below' : 'equal';
    return {
      metric: label,
      yours,
      benchmark: benchmarkValue,
      difference,
      status,
    };
  });
}
export function generateBenchmarkInsights(comparison) {
  const insights = [];
  const aboveMetrics = comparison.filter((c) => c.status === 'above');
  const belowMetrics = comparison.filter((c) => c.status === 'below');
  if (aboveMetrics.length >= 3) {
    insights.push(
      'Your institution is performing above benchmark in most areas. Excellent performance!',
    );
  } else if (aboveMetrics.length >= 2) {
    insights.push('Your institution shows strong performance in several key areas.');
  }
  if (belowMetrics.length >= 3) {
    insights.push(
      'Multiple areas below benchmark. Comprehensive improvement strategy recommended.',
    );
  } else if (belowMetrics.length >= 2) {
    insights.push('Some areas need attention to reach benchmark standards.');
  }
  belowMetrics.forEach((metric) => {
    insights.push(`Focus on improving ${metric.metric} to reach benchmark levels.`);
  });
  return insights;
}
