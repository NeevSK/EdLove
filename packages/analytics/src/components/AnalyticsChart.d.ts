interface AnalyticsChartProps {
	title: string;
	data: {
		label: string;
		value: number;
		color?: string;
	}[];
	type?: "bar" | "line" | "pie" | "progress";
	height?: number;
	showValues?: boolean;
	maxValue?: number;
}
export declare function AnalyticsChart({
	title,
	data,
	type,
	height,
	showValues,
	maxValue,
}: AnalyticsChartProps): import("react/jsx-runtime").JSX.Element | null;
interface MultiSeriesChartProps {
	title: string;
	series: {
		name: string;
		data: {
			x: string;
			y: number;
		}[];
		color?: string;
	}[];
	type?: "line" | "bar";
	height?: number;
}
export declare function MultiSeriesChart({
	title,
	series,
	type,
	height,
}: MultiSeriesChartProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AnalyticsChart.d.ts.map
