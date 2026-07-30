interface GPAInsightsProps {
    studentId: string;
    currentGPA: number;
    trendDirection: 'improving' | 'declining' | 'stable';
    predictedGPA?: number;
    targetGPA?: number;
}
export declare function GPAInsights({ studentId, currentGPA, trendDirection, predictedGPA, targetGPA, }: GPAInsightsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=GPAInsights.d.ts.map