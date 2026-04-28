import {
  type ClassAnalytics,
  PredictionRequest,
  PredictionResult,
  type StudentPerformanceMetrics,
} from '../types/AnalyticsTypes';
import { GPACalculator } from './GPACalculator';

export interface DatabaseClient {
  from: (table: string) => any;
}

export class PerformanceAnalyzer {
  private gpaCalculator: GPACalculator;
  private db: DatabaseClient;

  constructor(db: DatabaseClient) {
    this.gpaCalculator = new GPACalculator();
    this.db = db;
  }

  /**
   * Analyze student performance across all metrics
   */
  async analyzeStudentPerformance(
    studentId: string,
    classId: string,
    timeRange?: { startDate: string; endDate: string },
  ): Promise<StudentPerformanceMetrics> {
    // Fetch student data
    const { data: grades, error: gradesError } = await this.db
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .order('graded_at', { ascending: false });

    if (gradesError) throw gradesError;

    const { data: attendance, error: attendanceError } = await this.db
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('class_id', classId);

    if (attendanceError) throw attendanceError;

    const { data: assignments, error: assignmentsError } = await this.db
      .from('assignments')
      .select('*')
      .eq('class_id', classId);

    if (assignmentsError) throw assignmentsError;

    // Calculate metrics
    const currentGPA = this.gpaCalculator.calculateGPA(grades || []);
    const averageMarks =
      grades?.reduce((sum: number, g: any) => sum + g.marks, 0) / (grades?.length || 1) || 0;

    // Calculate trend
    const trendDirection = this.calculateTrendDirection(grades || []);

    // Get class rank
    const classRank = await this.calculateClassRank(studentId, classId, currentGPA);

    // Subject performance
    const subjectPerformance = await this.calculateSubjectPerformance(studentId, classId);

    // Attendance impact
    const attendanceData = attendance || [];
    const attendanceRate =
      attendanceData.filter((a: any) => a.status === 'present').length / attendanceData.length;
    const attendanceImpact = this.calculateAttendanceCorrelation(grades || [], attendanceData);

    // Submission rate
    const submissionRate = this.calculateSubmissionRate(studentId, assignments || [], grades || []);

    return {
      studentId,
      currentGPA,
      trendDirection,
      averageMarks,
      rankInClass: classRank.rank,
      totalStudents: classRank.totalStudents,
      subjectPerformance,
      attendanceImpact,
      submissionRate,
    };
  }

  /**
   * Analyze class-wide performance
   */
  async analyzeClassPerformance(classId: string): Promise<ClassAnalytics> {
    // Fetch all students in class
    const { data: students, error: studentsError } = await this.db
      .from('enrollments')
      .select('student_id')
      .eq('class_id', classId);

    if (studentsError) throw studentsError;

    const studentIds = students?.map((s: any) => s.student_id) || [];

    // Fetch all grades for the class
    const { data: allGrades, error: gradesError } = await this.db
      .from('grades')
      .select('*')
      .in('student_id', studentIds)
      .eq('class_id', classId);

    if (gradesError) throw gradesError;

    // Calculate class metrics
    const studentGPAs = await this.calculateAllStudentGPAs(studentIds, classId);
    const averageGPA =
      studentGPAs.reduce((sum: number, gpa: number) => sum + gpa, 0) / studentGPAs.length;
    const averageMarks =
      allGrades?.reduce((sum: number, g: any) => sum + g.marks, 0) / (allGrades?.length || 1) || 0;

    // Grade distribution
    const gradeDistribution = this.gpaCalculator.getGradeDistribution(allGrades || []);

    // Identify top performers and at-risk students
    const studentPerformances = await Promise.all(
      studentIds.map(async (studentId: string) => {
        const performance = await this.analyzeStudentPerformance(studentId, classId);
        return { studentId, gpa: performance.currentGPA };
      }),
    );

    const sortedPerformances = studentPerformances.sort((a: any, b: any) => b.gpa - a.gpa);
    const topPerformers = sortedPerformances.slice(0, 5).map((p: any) => p.studentId);
    const atRiskStudents = sortedPerformances
      .filter((p: any) => p.gpa < 2.0)
      .map((p: any) => p.studentId);

    // Correlations
    const attendanceCorrelation = await this.calculateClassAttendanceCorrelation(classId);
    const submissionCorrelation = await this.calculateClassSubmissionCorrelation(classId);

    // Generate insights
    const insights = this.generateClassInsights({
      averageGPA,
      averageMarks,
      gradeDistribution,
      topPerformers: topPerformers.length,
      atRiskStudents: atRiskStudents.length,
      totalStudents: studentIds.length,
    });

    return {
      classId,
      totalStudents: studentIds.length,
      averageGPA,
      averageMarks,
      gradeDistribution,
      topPerformers,
      atRiskStudents,
      attendanceCorrelation,
      submissionCorrelation,
      insights,
    };
  }

  private calculateTrendDirection(grades: any[]): 'improving' | 'declining' | 'stable' {
    if (grades.length < 3) return 'stable';

    const recent = grades.slice(0, Math.ceil(grades.length / 2));
    const older = grades.slice(Math.ceil(grades.length / 2));

    const recentAvg = recent.reduce((sum: number, g: any) => sum + g.marks, 0) / recent.length;
    const olderAvg = older.reduce((sum: number, g: any) => sum + g.marks, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private async calculateClassRank(
    studentId: string,
    classId: string,
    studentGPA: number,
  ): Promise<{ rank: number; totalStudents: number }> {
    // This would need to be implemented based on your data structure
    // For now, return placeholder values
    return { rank: 1, totalStudents: 30 };
  }

  private async calculateSubjectPerformance(
    studentId: string,
    classId: string,
  ): Promise<{ [subject: string]: number }> {
    // This would need subject-specific data
    return { Math: 85, Science: 78, English: 92 };
  }

  private calculateAttendanceCorrelation(grades: any[], attendance: any[]): number {
    // Simple correlation calculation
    if (grades.length === 0 || attendance.length === 0) return 0;

    const attendanceRate =
      attendance.filter((a: any) => a.status === 'present').length / attendance.length;
    const averageGrade = grades.reduce((sum: number, g: any) => sum + g.marks, 0) / grades.length;

    // Simple heuristic: higher attendance generally correlates with better grades
    return Math.min(1.0, attendanceRate * (averageGrade / 100));
  }

  private calculateSubmissionRate(studentId: string, assignments: any[], grades: any[]): number {
    if (assignments.length === 0) return 1.0;

    const submittedAssignments = grades?.filter((g: any) => g.student_id === studentId).length || 0;
    return submittedAssignments / assignments.length;
  }

  private async calculateAllStudentGPAs(studentIds: string[], classId: string): Promise<number[]> {
    const gpas = await Promise.all(
      studentIds.map(async (studentId: string) => {
        const performance = await this.analyzeStudentPerformance(studentId, classId);
        return performance.currentGPA;
      }),
    );
    return gpas;
  }

  private async calculateClassAttendanceCorrelation(classId: string): Promise<number> {
    // Implementation would calculate correlation between attendance and grades across class
    return 0.75;
  }

  private async calculateClassSubmissionCorrelation(classId: string): Promise<number> {
    // Implementation would calculate correlation between submission rates and grades
    return 0.82;
  }

  private generateClassInsights(metrics: any): string[] {
    const insights: string[] = [];

    if (metrics.averageGPA < 2.5) {
      insights.push(
        'Class average GPA is below recommended threshold. Consider additional support.',
      );
    }

    if (metrics.atRiskStudents > metrics.totalStudents * 0.2) {
      insights.push('High number of at-risk students. Early intervention recommended.');
    }

    if (metrics.attendanceCorrelation > 0.8) {
      insights.push(
        'Strong correlation between attendance and performance. Attendance initiatives may improve results.',
      );
    }

    return insights;
  }
}
