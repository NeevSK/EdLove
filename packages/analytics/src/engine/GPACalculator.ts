import type { StudentGrade } from '@repo/core/types';
import type { GPACalculationOptions, GradingScale } from '@repo/analytics/types/AnalyticsTypes';
import {
  type GradebookEntry,
  SIMPLIFIED_GRADING_SCALE,
  STANDARD_GRADING_SCALE,
  WEIGHTED_GRADING_SCALE,
} from '@repo/analytics/types/GradingTypes';

export class GPACalculator {
  private scale: GradingScale;

  constructor(options: GPACalculationOptions = {}) {
    this.scale = this.getGradingScale(options);
  }

  private getGradingScale(options: GPACalculationOptions): GradingScale {
    switch (options.scale) {
      case 'simplified':
        return SIMPLIFIED_GRADING_SCALE;
      case 'weighted':
        return WEIGHTED_GRADING_SCALE;
      case 'custom':
        return options.customScale || STANDARD_GRADING_SCALE;
      default:
        return STANDARD_GRADING_SCALE;
    }
  }

  /**
   * Simple marks to GPA conversion (Sri Lankan Standard)
   * A: 75-100 (4.0), B: 65-74 (3.0), C: 50-64 (2.0), S: 35-49 (1.0), F: 0-34 (0.0)
   */
  public marksToGPA(marks: number): { grade: string; gpa: number } {
    if (marks >= 75) return { grade: 'A', gpa: 4.0 };
    if (marks >= 65) return { grade: 'B', gpa: 3.0 };
    if (marks >= 50) return { grade: 'C', gpa: 2.0 };
    if (marks >= 35) return { grade: 'S', gpa: 1.0 };
    return { grade: 'F', gpa: 0.0 };
  }

  /**
   * Convert marks to grade and GPA based on the configured scale
   */
  public marksToGradeAndGPA(marks: number): { grade: string; gpa: number } {
    const range = this.scale.ranges.find(
      (r: { min: number; max: number; grade: string; gpa: number }) =>
        marks >= r.min && marks <= r.max,
    );
    return range || { grade: 'F', gpa: 0.0 };
  }

  /**
   * Calculate GPA from a list of grades
   */
  public calculateGPA(grades: StudentGrade[], options: GPACalculationOptions = {}): number {
    if (grades.length === 0) return 0.0;

    let totalPoints = 0;
    let totalCredits = 0;

    for (const grade of grades) {
      // Skip excluded assignments
      if (options.excludeAssignments?.includes(grade.assignment_id || '')) {
        continue;
      }

      const weight = options.weights?.[grade.assignment_id || ''] || 1;
      const { gpa } = this.marksToGradeAndGPA(grade.marks);

      totalPoints += gpa * weight;
      totalCredits += weight;
    }

    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }

  /**
   * Calculate cumulative GPA across multiple grading periods
   */
  public calculateCumulativeGPA(gradebookEntries: GradebookEntry[]): {
    periodGPAs: { [periodId: string]: number };
    cumulativeGPA: number;
  } {
    const periodGPAs: { [periodId: string]: StudentGrade[] } = {};

    // Group grades by period
    for (const entry of gradebookEntries) {
      if (!entry?.periodId) continue;

      let periodGrades = periodGPAs[entry.periodId];
      if (!periodGrades) {
        periodGrades = [];
        periodGPAs[entry.periodId] = periodGrades;
      }

      periodGrades.push({
        id: entry.id ?? '',
        student_id: entry.studentId ?? '',
        assignment_id: entry.assignmentId ?? '',
        marks: entry.marks ?? 0,
        grade: entry.letterGrade ?? '',
        gpa: entry.gpa,
        created_at: new Date(entry.gradedAt),
        updated_at: new Date(entry.gradedAt),
        classroom_id: '', // Not in GradebookEntry, but required for POA type
        graded_by: '', // Not in GradebookEntry, but required for POA type
        publication_state: 'published',
      });
    }

    // Calculate GPA for each period
    const calculatedPeriodGPAs: { [periodId: string]: number } = {};
    let totalQualityPoints = 0;
    let totalCredits = 0;

    for (const [periodId, grades] of Object.entries(periodGPAs)) {
      const periodGPA = this.calculateGPA(grades);
      calculatedPeriodGPAs[periodId] = periodGPA;

      // For cumulative, we'll use equal weighting for periods
      totalQualityPoints += periodGPA;
      totalCredits += 1;
    }

    const cumulativeGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0.0;

    return {
      periodGPAs: calculatedPeriodGPAs,
      cumulativeGPA,
    };
  }

  /**
   * Predict GPA based on current performance trends
   */
  public predictGPA(
    currentGrades: StudentGrade[],
    remainingAssignments: { maxMarks: number; weight: number }[],
    options: GPACalculationOptions = {},
  ): { predictedGPA: number; minGPA: number; maxGPA: number } {
    const currentGPA = this.calculateGPA(currentGrades, options);

    if (remainingAssignments.length === 0) {
      return {
        predictedGPA: currentGPA,
        minGPA: currentGPA,
        maxGPA: currentGPA,
      };
    }

    // Calculate current quality points and credits
    let currentQualityPoints = 0;
    let currentCredits = 0;

    for (const grade of currentGrades) {
      if (options.excludeAssignments?.includes(grade.assignment_id || '')) continue;

      const weight = options.weights?.[grade.assignment_id || ''] || 1;
      currentQualityPoints += grade.gpa * weight;
      currentCredits += weight;
    }

    // Predict scenarios
    const remainingCredits = remainingAssignments.reduce(
      (sum, assignment) => sum + (assignment.weight || 1),
      0,
    );

    // Best case: perfect scores on remaining assignments
    const bestCasePoints = currentQualityPoints + 4.0 * remainingCredits;
    const maxGPA = (currentQualityPoints + bestCasePoints) / (currentCredits + remainingCredits);

    // Worst case: failing scores on remaining assignments
    const worstCasePoints = currentQualityPoints;
    const minGPA = worstCasePoints / (currentCredits + remainingCredits);

    // Realistic prediction based on current performance
    const predictedGPA =
      (currentGPA * currentCredits + currentGPA * remainingCredits) /
      (currentCredits + remainingCredits);

    return {
      predictedGPA: Math.min(4.0, Math.max(0.0, predictedGPA)),
      minGPA: Math.min(4.0, Math.max(0.0, minGPA)),
      maxGPA: Math.min(4.0, Math.max(0.0, maxGPA)),
    };
  }

  /**
   * Get grade distribution for a class
   */
  public getGradeDistribution(grades: StudentGrade[]): {
    [grade: string]: number;
  } {
    const distribution: { [grade: string]: number } = {};

    for (const grade of grades) {
      const { grade: letterGrade } = this.marksToGradeAndGPA(grade.marks);
      distribution[letterGrade] = (distribution[letterGrade] || 0) + 1;
    }

    return distribution;
  }

  /**
   * Calculate class rank based on GPA
   */
  public calculateClassRanks(
    studentGPAs: { studentId: string; gpa: number }[],
  ): { studentId: string; gpa: number; rank: number; percentile: number }[] {
    // Sort by GPA descending
    const sorted = [...studentGPAs].sort((a, b) => b.gpa - a.gpa);

    return sorted.map((student, index) => ({
      ...student,
      rank: index + 1,
      percentile: ((sorted.length - index) / sorted.length) * 100,
    }));
  }

  /**
   * Simple rank calculation based on marks (legacy compatibility)
   */
  public calculateRanks(
    grades: { id: string; marks: number; [key: string]: any }[],
  ): { id: string; marks: number; rank: number; [key: string]: any }[] {
    const sorted = [...grades].sort((a, b) => b.marks - a.marks);
    return grades.map((grade) => {
      const rank = sorted.findIndex((s) => s.id === grade.id) + 1;
      return { ...grade, rank };
    });
  }
}
