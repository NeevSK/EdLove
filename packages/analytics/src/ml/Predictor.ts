import type { PredictionRequest, PredictionResult } from '@repo/analytics/types/AnalyticsTypes';

export interface DatabaseClient {
  from: (table: string) => any;
}

export class Predictor {
  private db: DatabaseClient;

  constructor(db: DatabaseClient) {
    this.db = db;
  }
  /**
   * Generate predictions using ML models
   */
  async predict(request: PredictionRequest): Promise<PredictionResult> {
    switch (request.predictionType) {
      case 'gpa':
        return this.predictGPA(request);
      case 'dropout_risk':
        return this.predictDropoutRisk(request);
      case 'performance_trend':
        return this.predictPerformanceTrend(request);
      default:
        throw new Error(`Unsupported prediction type: ${request.predictionType}`);
    }
  }

  private async predictGPA(request: PredictionRequest): Promise<PredictionResult> {
    // Fetch historical data
    const { data: historicalGrades, error } = await this.db
      .from('grades')
      .select('marks, graded_at')
      .eq('student_id', request.studentId)
      .order('graded_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!historicalGrades || historicalGrades.length < 3) {
      return {
        prediction: 0,
        confidence: 0,
        factors: [],
        recommendations: ['Insufficient historical data for prediction'],
        lastUpdated: new Date().toISOString(),
      };
    }

    // Simple linear regression for demonstration
    const trend = this.calculateTrend(historicalGrades);
    const currentAverage =
      historicalGrades.reduce((sum: number, g: any) => sum + g.marks, 0) / historicalGrades.length;

    // Predict based on trend and time horizon
    const timeMultiplier = this.getTimeMultiplier(request.timeHorizon);
    const predictedMarks = Math.max(0, Math.min(100, currentAverage + trend * timeMultiplier));

    // Convert to GPA (simplified)
    const predictedGPA = this.marksToGPA(predictedMarks);

    return {
      prediction: predictedGPA,
      confidence: Math.min(0.95, 0.5 + historicalGrades.length * 0.02),
      factors: [
        {
          name: 'Historical Trend',
          impact: Math.abs(trend) / 10,
          description:
            trend > 0 ? 'Improving performance over time' : 'Declining performance over time',
        },
        {
          name: 'Current Performance',
          impact: currentAverage / 100,
          description: `Current average: ${currentAverage.toFixed(1)}%`,
        },
        {
          name: 'Data Quality',
          impact: historicalGrades.length / 20,
          description: `${historicalGrades.length} data points available`,
        },
      ],
      recommendations: this.generateGPARecommendations(trend, currentAverage),
      lastUpdated: new Date().toISOString(),
    };
  }

  private async predictDropoutRisk(request: PredictionRequest): Promise<PredictionResult> {
    // Fetch comprehensive student data
    const { data: _studentData } = await this.db
      .from('student_profiles')
      .select('*')
      .eq('student_id', request.studentId)
      .single();

    const { data: attendanceData } = await this.db
      .from('attendance')
      .select('status, date')
      .eq('student_id', request.studentId);

    const { data: gradesData } = await this.db
      .from('grades')
      .select('marks')
      .eq('student_id', request.studentId);

    // Calculate risk factors
    const presentAttendance = attendanceData?.filter((a: any) => a?.status === 'present') || [];
    const attendanceRate =
      attendanceData && attendanceData.length > 0
        ? presentAttendance.length / attendanceData.length
        : 0;

    const totalMarks = gradesData?.reduce((sum: number, g: any) => sum + (g?.marks ?? 0), 0) ?? 0;
    const averageGrade = gradesData && gradesData.length > 0 ? totalMarks / gradesData.length : 0;

    // Risk scoring (simplified)
    let riskScore = 0;

    if (attendanceRate < 0.7) riskScore += 0.3;
    if (averageGrade < 50) riskScore += 0.4;
    if (attendanceRate < 0.5) riskScore += 0.2;
    if (averageGrade < 35) riskScore += 0.1;

    return {
      prediction: riskScore,
      confidence: 0.75,
      factors: [
        {
          name: 'Attendance Rate',
          impact: (1 - attendanceRate) * 0.4,
          description: `${(attendanceRate * 100).toFixed(1)}% attendance`,
        },
        {
          name: 'Academic Performance',
          impact: (1 - averageGrade / 100) * 0.4,
          description: `Average grade: ${averageGrade.toFixed(1)}%`,
        },
        {
          name: 'Engagement Metrics',
          impact: 0.2,
          description: 'Based on assignment submission and participation',
        },
      ],
      recommendations: this.generateDropoutRecommendations(riskScore, attendanceRate, averageGrade),
      lastUpdated: new Date().toISOString(),
    };
  }

  private async predictPerformanceTrend(request: PredictionRequest): Promise<PredictionResult> {
    const { data: grades } = await this.db
      .from('grades')
      .select('marks, graded_at, assignment_id')
      .eq('student_id', request.studentId)
      .order('graded_at', { ascending: true });

    if (!grades || grades.length < 5) {
      return {
        prediction: 0,
        confidence: 0,
        factors: [],
        recommendations: ['Need more historical data for trend analysis'],
        lastUpdated: new Date().toISOString(),
      };
    }

    // Calculate moving averages
    const windowSize = Math.min(5, Math.floor(grades.length / 2));
    const movingAverages = this.calculateMovingAverages(grades, windowSize);

    // Detect trend
    const recentTrend = this.calculateTrendFromMovingAverages(movingAverages.slice(-3));
    const overallTrend = this.calculateTrendFromMovingAverages(movingAverages);

    // Predict future trend
    const predictedTrend = recentTrend * 0.7 + overallTrend * 0.3;

    return {
      prediction: predictedTrend,
      confidence: Math.min(0.9, 0.6 + grades.length / 50),
      factors: [
        {
          name: 'Recent Performance',
          impact: Math.abs(recentTrend) / 10,
          description: recentTrend > 0 ? 'Recently improving' : 'Recently declining',
        },
        {
          name: 'Overall Trend',
          impact: Math.abs(overallTrend) / 10,
          description: overallTrend > 0 ? 'Generally improving' : 'Generally declining',
        },
        {
          name: 'Consistency',
          impact: this.calculateConsistency(movingAverages),
          description: 'Performance consistency over time',
        },
      ],
      recommendations: this.generateTrendRecommendations(predictedTrend),
      lastUpdated: new Date().toISOString(),
    };
  }

  private calculateTrend(grades: { marks: number; graded_at: string }[]): number {
    if (grades.length < 2) return 0;

    const firstHalf = grades.slice(Math.ceil(grades.length / 2));
    const secondHalf = grades.slice(0, Math.ceil(grades.length / 2));

    const firstAvg = firstHalf.reduce((sum, g) => sum + g.marks, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, g) => sum + g.marks, 0) / secondHalf.length;

    return secondAvg - firstAvg;
  }

  private getTimeMultiplier(horizon: string): number {
    switch (horizon) {
      case 'month':
        return 0.1;
      case 'quarter':
        return 0.3;
      case 'semester':
        return 0.6;
      case 'year':
        return 1.0;
      default:
        return 0.3;
    }
  }

  private marksToGPA(marks: number): number {
    if (marks >= 75) return 4.0;
    if (marks >= 65) return 3.0;
    if (marks >= 50) return 2.0;
    if (marks >= 35) return 1.0;
    return 0.0;
  }

  private generateGPARecommendations(trend: number, currentAverage: number): string[] {
    const recommendations: string[] = [];

    if (trend < -5) {
      recommendations.push('Focus on recent assignments to reverse declining trend');
      recommendations.push('Consider additional study support or tutoring');
    } else if (trend > 5) {
      recommendations.push('Maintain current study habits and momentum');
      recommendations.push('Consider taking on more challenging assignments');
    }

    if (currentAverage < 60) {
      recommendations.push('Focus on foundational concepts to improve overall performance');
    }

    return recommendations;
  }

  private generateDropoutRecommendations(
    riskScore: number,
    attendanceRate: number,
    averageGrade: number,
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore > 0.7) {
      recommendations.push('URGENT: Immediate intervention required');
      recommendations.push('Schedule meeting with academic advisor');
    } else if (riskScore > 0.4) {
      recommendations.push('Increased monitoring and support recommended');
    }

    if (attendanceRate < 0.8) {
      recommendations.push('Address attendance issues immediately');
    }

    if (averageGrade < 50) {
      recommendations.push('Implement academic improvement plan');
    }

    return recommendations;
  }

  private generateTrendRecommendations(trend: number): string[] {
    if (trend > 2) {
      return ['Continue current successful strategies', 'Consider advanced coursework'];
    } else if (trend < -2) {
      return ['Identify and address performance issues', 'Seek additional academic support'];
    }
    return ['Maintain consistent study habits', 'Monitor performance closely'];
  }

  private calculateMovingAverages(grades: { marks: number }[], windowSize: number): number[] {
    const averages: number[] = [];
    for (let i = windowSize - 1; i < grades.length; i++) {
      const window = grades.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((sum, g) => sum + g.marks, 0) / windowSize;
      averages.push(avg);
    }
    return averages;
  }

  private calculateTrendFromMovingAverages(averages: number[]): number {
    if (!averages || averages.length < 2) return 0;
    return (averages[averages.length - 1] || 0) - (averages[0] || 0);
  }

  private calculateConsistency(averages: number[]): number {
    if (averages.length < 2) return 0;
    const mean = averages.reduce((sum, a) => sum + a, 0) / averages.length;
    const variance = averages.reduce((sum, a) => sum + (a - mean) ** 2, 0) / averages.length;
    return Math.max(0, 1 - Math.sqrt(variance) / mean);
  }
}
