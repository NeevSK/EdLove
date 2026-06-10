import type { ClassAnalytics, StudentPerformanceMetrics } from '../types/AnalyticsTypes';

export class InsightGenerator {
  /**
   * Generate automated insights from analytics data
   */
  generateStudentInsights(metrics: StudentPerformanceMetrics): string[] {
    const insights: string[] = [];

    // GPA-based insights
    if (metrics.currentGPA >= 3.7) {
      insights.push('Exceptional academic performance. Consider advanced coursework.');
    } else if (metrics.currentGPA >= 3.0) {
      insights.push('Strong performance with room for growth.');
    } else if (metrics.currentGPA >= 2.0) {
      insights.push('Satisfactory performance. Additional support may be beneficial.');
    } else {
      insights.push('Performance needs immediate attention and intervention.');
    }

    // Trend-based insights
    if (metrics.trendDirection === 'improving') {
      insights.push('Positive performance trend detected. Keep up the momentum!');
    } else if (metrics.trendDirection === 'declining') {
      insights.push('Declining performance trend. Early intervention recommended.');
    }

    // Attendance correlation insights
    if (metrics.attendanceImpact > 0.8) {
      insights.push(
        'Strong correlation between attendance and performance. Maintain consistent attendance.',
      );
    } else if (metrics.attendanceImpact < 0.3) {
      insights.push('Low attendance correlation. Other factors may be affecting performance.');
    }

    // Submission rate insights
    if (metrics.submissionRate < 0.8) {
      insights.push('Assignment completion rate needs improvement.');
    }

    // Subject-specific insights
    const weakSubjects = Object.entries(metrics.subjectPerformance)
      .filter(([_, score]) => score < 70)
      .map(([subject]) => subject);

    if (weakSubjects.length > 0) {
      insights.push(`Focus needed in: ${weakSubjects.join(', ')}`);
    }

    return insights;
  }

  generateClassInsights(analytics: ClassAnalytics): string[] {
    const insights: string[] = [];

    // Overall performance insights
    if (analytics.averageGPA >= 3.5) {
      insights.push('Class is performing exceptionally well overall.');
    } else if (analytics.averageGPA < 2.5) {
      insights.push('Class performance is below expectations. Consider curriculum review.');
    }

    // Grade distribution insights
    const failingStudents = analytics.gradeDistribution.F || 0;
    const failingPercentage = (failingStudents / analytics.totalStudents) * 100;

    if (failingPercentage > 20) {
      insights.push(`High failure rate (${failingPercentage.toFixed(1)}%). Intervention needed.`);
    }

    // Top performers vs at-risk ratio
    const ratio = analytics.topPerformers.length / Math.max(1, analytics.atRiskStudents.length);
    if (ratio < 1) {
      insights.push(
        'More at-risk students than top performers. Balanced intervention strategy needed.',
      );
    }

    // Correlation insights
    if (analytics.attendanceCorrelation > 0.8) {
      insights.push(
        'Strong attendance-performance correlation. Attendance initiatives recommended.',
      );
    }

    if (analytics.submissionCorrelation > 0.8) {
      insights.push(
        'Assignment completion strongly impacts performance. Emphasize timely submissions.',
      );
    }

    return insights;
  }

  generateRecommendations(metrics: StudentPerformanceMetrics): string[] {
    const recommendations: string[] = [];

    // Academic recommendations
    if (metrics.currentGPA < 2.0) {
      recommendations.push('Schedule meeting with academic advisor immediately');
      recommendations.push('Join study groups for challenging subjects');
      recommendations.push('Consider tutoring services');
    } else if (metrics.currentGPA < 3.0) {
      recommendations.push('Focus on weak subject areas');
      recommendations.push('Improve study habits and time management');
    }

    // Trend-based recommendations
    if (metrics.trendDirection === 'declining') {
      recommendations.push('Identify and address causes of performance decline');
      recommendations.push('Increase study time and seek help early');
    }

    // Attendance recommendations
    if (metrics.attendanceImpact < 0.5 && metrics.submissionRate < 0.8) {
      recommendations.push('Improve class attendance and assignment completion');
    }

    // Subject-specific recommendations
    const weakSubjects = Object.entries(metrics.subjectPerformance)
      .filter(([_, score]) => score < 70)
      .map(([subject]) => subject);

    weakSubjects.forEach((subject) => {
      recommendations.push(`Seek additional support in ${subject}`);
    });

    return recommendations;
  }
}
