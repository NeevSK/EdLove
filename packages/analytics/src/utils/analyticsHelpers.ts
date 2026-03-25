export function calculatePercentile(value: number, dataset: number[]): number {
  if (dataset.length === 0) return 0;
  
  const sorted = [...dataset].sort((a, b) => a - b);
  const count = sorted.filter(x => x <= value).length;
  return (count / sorted.length) * 100;
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
}

export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + (val * (y[i] || 0)), 0);
  const sumX2 = x.reduce((sum, val) => sum + (val * val), 0);
  const sumY2 = y.reduce((sum, val) => sum + ((val || 0) * (val || 0)), 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

export function getGradeColor(grade: string): string {
  const colors: { [key: string]: string } = {
    'A': '#10b981', // green
    'B': '#3b82f6', // blue
    'C': '#f59e0b', // amber
    'D': '#f97316', // orange
    'F': '#ef4444', // red
    'S': '#8b5cf6', // violet
  };
  
  return colors[grade] || '#6b7280'; // gray
}

export function getPerformanceLevel(score: number): 'excellent' | 'good' | 'average' | 'below-average' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  if (score >= 60) return 'below-average';
  return 'poor';
}

export function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  const threshold = Math.abs(firstAvg) * 0.05; // 5% threshold
  
  if (difference > threshold) return 'increasing';
  if (difference < -threshold) return 'decreasing';
  return 'stable';
}
