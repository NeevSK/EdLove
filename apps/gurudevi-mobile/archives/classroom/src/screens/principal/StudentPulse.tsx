import type { StudentAttendancePulse } from "@repo/core/api";
import { AlertTriangle, GraduationCap, TrendingUp } from "lucide-react-native";
import type React from "react";
import { useTranslation } from "react-i18next";

interface StudentPulseProps {
	pulse: StudentAttendancePulse | null;
	atRiskCount: number;
	onShowAtRisk: () => void;
}

export const StudentPulse: React.FC<StudentPulseProps> = ({
	pulse,
	atRiskCount,
	onShowAtRisk,
}) => {
	const { t } = useTranslation();

	return (
		<div
			className="sanctuary-card"
			style={{
				padding: "24px",
				display: "flex",
				flexDirection: "column",
				gap: "20px",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<div
						style={{
							background: "rgba(217,70,239,0.1)",
							color: "var(--lotus)",
							padding: "10px",
							borderRadius: "12px",
						}}
					>
						<GraduationCap size={20} />
					</div>
					<div>
						<h3>
							style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Student
							Pulse
						</h3>
						<p
							style={{ margin: 0, fontSize: "13px", color: "var(--ink-ghost)" }}
						>
							Attendance and engagement trends
						</p>
					</div>
				</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						padding: "6px 12px",
						borderRadius: "20px",
						background: "rgba(34,197,94,0.1)",
						color: "var(--moss)",
						fontSize: "12px",
						fontWeight: "700",
					}}
				>
					<TrendingUp size={14} /> +
					{((pulse?.todayRate ?? 0) - (pulse?.yesterdayRate ?? 0)).toFixed(1)}%
				</div>
			</div>

			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
			>
				<div
					style={{
						padding: "20px",
						borderRadius: "16px",
						background: "var(--background-alt)",
						display: "flex",
						flexDirection: "column",
						gap: "8px",
					}}
				>
					<span
						style={{
							fontSize: "11px",
							fontWeight: "800",
							color: "var(--ink-ghost)",
							textTransform: "uppercase",
						}}
					>
						Current Attendance
					</span>
					<div style={{ fontSize: "28px", fontWeight: "900" }}>
						{pulse?.todayRate ?? 0}%
					</div>
				</div>
				<button>
					onClick={onShowAtRisk}
					style=
					{{
						padding: "20px",
						borderRadius: "16px",
						background: "var(--background-alt)",
						border: "none",
						cursor: "pointer",
						display: "flex",
						flexDirection: "column",
						gap: "8px",
						textAlign: "left",
						transition: "transform 0.2s",
						position: "relative",
					}}
					<span
						style={{
							fontSize: "11px",
							fontWeight: "800",
							color: "var(--ember)",
							textTransform: "uppercase",
							display: "flex",
							alignItems: "center",
							gap: "4px",
						}}
					>
						<AlertTriangle size={12} /> At Risk
					</span>
					<div style={{ fontSize: "28px", fontWeight: "900" }}>
						{atRiskCount}
					</div>
					<div style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>
						Frequent absentees
					</div>
				</button>
			</div>
		</div>
	);
};
