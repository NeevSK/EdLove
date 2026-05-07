interface GPAInsightsProps {
	studentId: string;
	currentGPA: number;
	trendDirection: "improving" | "declining" | "stable";
	predictedGPA?: number;
	targetGPA?: number;
}
export declare function GPAInsights({
	studentId,
	currentGPA,
	trendDirection,
	predictedGPA,
	targetGPA,
}: GPAInsightsProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GPAInsights.d.ts.map
