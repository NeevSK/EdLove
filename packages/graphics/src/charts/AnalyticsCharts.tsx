import { useThemedColors } from "@repo/ui/hooks";
import { Text } from "@repo/ui/primitives";
import { StyleSheet, View } from "react-native";

// —————————————————————————————————————————————————————————————————————————————
// SIMPLE BAR CHART
// —————————————————————————————————————————————————————————————————————————————

interface SimpleBarChartProps {
	data: { label: string; value: number; color?: string }[];
	title?: string;
	height?: number;
	showValues?: boolean;
}

export function SimpleBarChart({
	data,
	title,
	height = 200,
	showValues = true,
}: SimpleBarChartProps) {
	const colors = useThemedColors();
	const maxValue = Math.max(...data.map((d) => d.value), 1);
	const barWidth = Math.max(20, (300 - data.length * 40) / data.length);

	return (
		<View style={[styles.container, { height }]}>
			{title && (
				<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
			)}
			<View style={styles.chartContainer}>
				{data.map((item, index) => (
					<View key={index} style={styles.barContainer}>
						<View
							style={[
								styles.bar,
								{
									height: (item.value / maxValue) * (height - 60),
									width: barWidth,
									backgroundColor: item.color || colors.primary,
									marginBottom: showValues ? 4 : 0,
								},
							]}
						/>
						{showValues && (
							<Text style={[styles.valueLabel, { color: colors.text }]}>
								{item.value}
							</Text>
						)}
						<Text style={[styles.barLabel, { color: colors.textSecondary }]}>
							{item.label}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}

// —————————————————————————————————————————————————————————————————————————————
// SIMPLE LINE CHART
// —————————————————————————————————————————————————————————————————————————————

interface SimpleLineChartProps {
	data: { x: string; y: number }[];
	title?: string;
	height?: number;
	color?: string;
}

export function SimpleLineChart({
	data,
	title,
	height = 200,
	color,
}: SimpleLineChartProps) {
	const colors = useThemedColors();
	const chartColor = color || colors.primary;
	const values = data.map((d) => d.y);
	const maxValue = Math.max(...values, 1);
	const minValue = Math.min(...values, 0);
	const range = maxValue - minValue || 1;

	const chartWidth = 280;
	const chartHeight = height - 60;

	return (
		<View style={[styles.container, { height }]}>
			{title && (
				<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
			)}
			<View
				style={[
					styles.chartContainer,
					{ width: chartWidth, height: chartHeight, alignItems: "flex-start" },
				]}
			>
				{data.map((point, index) => {
					const y = chartHeight - ((point.y - minValue) / range) * chartHeight;
					const x = (index / (data.length - 1 || 1)) * chartWidth;

					return (
						<View key={index} style={StyleSheet.absoluteFill}>
							{/* Line segment to previous point */}
							{index > 0 && data[index - 1] && (
								<View
									style={[
										styles.line,
										{
											left: ((index - 1) / (data.length - 1)) * chartWidth,
											top:
												chartHeight -
												(((data[index - 1]?.y ?? 0) - minValue) / range) *
													chartHeight,
											width: chartWidth / (data.length - 1),
											height: 2,
											backgroundColor: chartColor,
											transform: [
												{
													translateY:
														(y -
															(chartHeight -
																(((data[index - 1]?.y ?? 0) - minValue) /
																	range) *
																	chartHeight)) /
														2,
												},
												{
													rotate: `${Math.atan2(y - (chartHeight - (((data[index - 1]?.y ?? 0) - minValue) / range) * chartHeight), chartWidth / (data.length - 1)) * (180 / Math.PI)}deg`,
												},
											],
										},
									]}
								/>
							)}

							{/* Point dot */}
							<View
								style={[
									styles.point,
									{
										left: x - 4,
										top: y - 4,
										backgroundColor: chartColor,
									},
								]}
							/>

							{/* X-Axis Label */}
							<Text
								style={[
									styles.pointLabel,
									{
										left: x - 20,
										width: 40,
										textAlign: "center",
										top: chartHeight + 10,
										color: colors.textSecondary,
									},
								]}
							>
								{point.x}
							</Text>
						</View>
					);
				})}
			</View>
		</View>
	);
}

// —————————————————————————————————————————————————————————————————————————————
// SIMPLE PIE CHART
// —————————————————————————————————————————————————————————————————————————————

interface SimplePieChartProps {
	data: { label: string; value: number; color?: string }[];
	title?: string;
	size?: number;
}

export function SimplePieChart({
	data,
	title,
	size = 200,
}: SimplePieChartProps) {
	const colors = useThemedColors();
	const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
	const radius = size / 2 - 20;

	return (
		<View style={[styles.container, { height: size, width: "100%" }]}>
			{title && (
				<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
			)}
			<View style={[styles.pieContainer, { width: size, height: size - 40 }]}>
				{data.map((item, index) => {
					const percentage = (item.value / total) * 100;
					const startAngle =
						(data.slice(0, index).reduce((sum, prev) => sum + prev.value, 0) /
							total) *
						360;

					return (
						<View key={index} style={styles.pieSliceContainer}>
							<View
								style={[
									styles.pieSlice,
									{
										backgroundColor: item.color || colors.primary,
										transform: [{ rotate: `${startAngle}deg` }],
										width: radius * 2,
										height: radius * 2,
										borderRadius: radius,
										opacity: 0.8,
									},
								]}
							/>
							<Text style={[styles.pieLabel, { color: colors.text }]}>
								{item.label}
								{percentage > 5 ? ` (${percentage.toFixed(0)}%)` : ""}
							</Text>
						</View>
					);
				})}
			</View>
		</View>
	);
}

// —————————————————————————————————————————————————————————————————————————————
// PROGRESS RING
// —————————————————————————————————————————————————————————————————————————————

interface ProgressRingProps {
	value: number;
	max: number;
	size?: number;
	color?: string;
	showLabel?: boolean;
}

export function ProgressRing({
	value,
	max,
	size = 120,
	color,
	showLabel = true,
}: ProgressRingProps) {
	const colors = useThemedColors();
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));
	const progressColor = color || colors.primary;

	return (
		<View style={[styles.container, { width: size, height: size }]}>
			<View style={styles.ringContainer}>
				{/* Background ring */}
				<View
					style={[
						styles.ring,
						{
							borderColor: colors.border,
							borderWidth: 8,
							width: size,
							height: size,
							borderRadius: size / 2,
							opacity: 0.3,
						},
					]}
				/>

				{/* Progress ring visualization (Simulated with dashed/solid borders) */}
				<View
					style={[
						styles.ring,
						{
							position: "absolute",
							borderColor: progressColor,
							borderWidth: 8,
							width: size,
							height: size,
							borderRadius: size / 2,
							borderLeftColor: "transparent",
							borderBottomColor: "transparent",
							transform: [{ rotate: `${(percentage / 100) * 360 - 45}deg` }],
						},
					]}
				/>

				{/* Center content */}
				<View style={styles.ringCenter}>
					{showLabel && (
						<Text style={[styles.percentageText, { color: colors.text }]}>
							{percentage.toFixed(0)}%
						</Text>
					)}
				</View>
			</View>
		</View>
	);
}

// —————————————————————————————————————————————————————————————————————————————
// STYLES
// —————————————————————————————————————————————————————————————————————————————

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		padding: 16,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		marginBottom: 16,
		textAlign: "center",
	},
	chartContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-around",
		width: "100%",
	},
	barContainer: {
		alignItems: "center",
	},
	bar: {
		borderTopLeftRadius: 4,
		borderTopRightRadius: 4,
	},
	valueLabel: {
		fontSize: 10,
		fontWeight: "600",
		marginBottom: 2,
	},
	barLabel: {
		fontSize: 10,
		marginTop: 4,
	},
	line: {
		position: "absolute",
	},
	point: {
		position: "absolute",
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	pointLabel: {
		position: "absolute",
		fontSize: 10,
	},
	pieContainer: {
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	pieSliceContainer: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
	},
	pieSlice: {
		position: "absolute",
	},
	pieLabel: {
		fontSize: 10,
		fontWeight: "700",
		textAlign: "center",
	},
	ringContainer: {
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	ring: {
		borderRadius: 999,
	},
	ringCenter: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
	},
	percentageText: {
		fontSize: 18,
		fontWeight: "800",
	},
});
