import {
	type ClassAnalytics,
	type StudentPerformanceMetrics,
} from "../types/AnalyticsTypes";
export interface DatabaseClient {
	from: (table: string) => any;
}
export declare class PerformanceAnalyzer {
	private gpaCalculator;
	private db;
	constructor(db: DatabaseClient);
	/**
	 * Analyze student performance across all metrics
	 */
	analyzeStudentPerformance(
		studentId: string,
		classId: string,
		timeRange?: {
			startDate: string;
			endDate: string;
		},
	): Promise<StudentPerformanceMetrics>;
	/**
	 * Analyze class-wide performance
	 */
	analyzeClassPerformance(classId: string): Promise<ClassAnalytics>;
	private calculateTrendDirection;
	private calculateClassRank;
	private calculateSubjectPerformance;
	private calculateAttendanceCorrelation;
	private calculateSubmissionRate;
	private calculateAllStudentGPAs;
	private calculateClassAttendanceCorrelation;
	private calculateClassSubmissionCorrelation;
	private generateClassInsights;
}
//# sourceMappingURL=PerformanceAnalyzer.d.ts.map
