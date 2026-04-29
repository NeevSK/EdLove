import { type GradingScale } from './AnalyticsTypes';
export declare const STANDARD_GRADING_SCALE: GradingScale;
export declare const SIMPLIFIED_GRADING_SCALE: GradingScale;
export declare const WEIGHTED_GRADING_SCALE: GradingScale;
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
//# sourceMappingURL=GradingTypes.d.ts.map