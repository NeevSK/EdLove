import { GPACalculationOptions, type GradingScale } from './AnalyticsTypes';

export const STANDARD_GRADING_SCALE: GradingScale = {
  name: 'Standard 4.0 Scale',
  ranges: [
    { min: 97, max: 100, grade: 'A+', gpa: 4.0 },
    { min: 93, max: 96, grade: 'A', gpa: 4.0 },
    { min: 90, max: 92, grade: 'A-', gpa: 3.7 },
    { min: 87, max: 89, grade: 'B+', gpa: 3.3 },
    { min: 83, max: 86, grade: 'B', gpa: 3.0 },
    { min: 80, max: 82, grade: 'B-', gpa: 2.7 },
    { min: 77, max: 79, grade: 'C+', gpa: 2.3 },
    { min: 73, max: 76, grade: 'C', gpa: 2.0 },
    { min: 70, max: 72, grade: 'C-', gpa: 1.7 },
    { min: 67, max: 69, grade: 'D+', gpa: 1.3 },
    { min: 65, max: 66, grade: 'D', gpa: 1.0 },
    { min: 0, max: 64, grade: 'F', gpa: 0.0 },
  ],
};

export const SIMPLIFIED_GRADING_SCALE: GradingScale = {
  name: 'Simplified Scale',
  ranges: [
    { min: 75, max: 100, grade: 'A', gpa: 4.0 },
    { min: 65, max: 74, grade: 'B', gpa: 3.0 },
    { min: 50, max: 64, grade: 'C', gpa: 2.0 },
    { min: 35, max: 49, grade: 'S', gpa: 1.0 },
    { min: 0, max: 34, grade: 'F', gpa: 0.0 },
  ],
};

export const WEIGHTED_GRADING_SCALE: GradingScale = {
  name: 'Weighted AP/Honors Scale',
  ranges: [
    { min: 97, max: 100, grade: 'A+', gpa: 5.0 },
    { min: 93, max: 96, grade: 'A', gpa: 4.7 },
    { min: 90, max: 92, grade: 'A-', gpa: 4.3 },
    { min: 87, max: 89, grade: 'B+', gpa: 4.0 },
    { min: 83, max: 86, grade: 'B', gpa: 3.7 },
    { min: 80, max: 82, grade: 'B-', gpa: 3.3 },
    { min: 77, max: 79, grade: 'C+', gpa: 3.0 },
    { min: 73, max: 76, grade: 'C', gpa: 2.7 },
    { min: 70, max: 72, grade: 'C-', gpa: 2.3 },
    { min: 67, max: 69, grade: 'D+', gpa: 2.0 },
    { min: 65, max: 66, grade: 'D', gpa: 1.7 },
    { min: 0, max: 64, grade: 'F', gpa: 0.0 },
  ],
};

export interface GradingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  weight: number;
}

export interface ClassGradingConfig {
  classId: string;
  scale: GradingScale;
  periods: GradingPeriod[];
  categories: {
    name: string;
    weight: number;
    dropLowest?: number;
  }[];
}

export interface GradebookEntry {
  id: string;
  studentId: string;
  assignmentId: string;
  categoryId: string;
  periodId: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  letterGrade: string;
  gpa: number;
  isExtraCredit: boolean;
  isDropped: boolean;
  gradedAt: string;
}
