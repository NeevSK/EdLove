import { StudentGrade } from '@repo/core/logic';
import type { GPACalculationOptions } from '@/types/AnalyticsTypes';
import { type GradebookEntry } from '@/types/GradingTypes';
export declare class GPACalculator {
  private scale;
  constructor(options?: GPACalculationOptions);
  private getGradingScale;
  /**
   * Simple marks to GPA conversion (Sri Lankan Standard)
   * A: 75-100 (4.0), B: 65-74 (3.0), C: 50-64 (2.0), S: 35-49 (1.0), F: 0-34 (0.0)
   */
  marksToGPA(marks: number): {
    grade: string;
    gpa: number;
  };
  /**
   * Convert marks to grade and GPA based on the configured scale
   */
  marksToGradeAndGPA(marks: number): {
    grade: string;
    gpa: number;
  };
  /**
   * Calculate GPA from a list of grades
   */
  calculateGPA(grades: StudentGrade[], options?: GPACalculationOptions): number;
  /**
   * Calculate cumulative GPA across multiple grading periods
   */
  calculateCumulativeGPA(gradebookEntries: GradebookEntry[]): {
    periodGPAs: {
      [periodId: string]: number;
    };
    cumulativeGPA: number;
  };
  /**
   * Predict GPA based on current performance trends
   */
  predictGPA(
    currentGrades: StudentGrade[],
    remainingAssignments: {
      maxMarks: number;
      weight: number;
    }[],
    options?: GPACalculationOptions,
  ): {
    predictedGPA: number;
    minGPA: number;
    maxGPA: number;
  };
  /**
   * Get grade distribution for a class
   */
  getGradeDistribution(grades: StudentGrade[]): {
    [grade: string]: number;
  };
  /**
   * Calculate class rank based on GPA
   */
  calculateClassRanks(
    studentGPAs: {
      studentId: string;
      gpa: number;
    }[],
  ): {
    studentId: string;
    gpa: number;
    rank: number;
    percentile: number;
  }[];
  /**
   * Simple rank calculation based on marks (legacy compatibility)
   */
  calculateRanks(
    grades: {
      id: string;
      marks: number;
      [key: string]: any;
    }[],
  ): {
    id: string;
    marks: number;
    rank: number;
    [key: string]: any;
  }[];
}
//# sourceMappingURL=GPACalculator.d.ts.map
