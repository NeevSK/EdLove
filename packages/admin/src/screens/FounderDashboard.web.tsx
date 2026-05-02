/**
 * FounderDashboard.web.tsx  (app-level web view)
 *
 * Platform Ecosystem Command Centre for Founders on web.
 * Pure HTML/CSS \u2014 no RN primitives.
 *
 * Features: Ecosystem stats \u00B7 Schools gallery \u00B7 Create actions
 *
 * Personal wellbeing (mood, energy, vision, philosophy) lives in FounderSelfView.
 */

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
	useAllSchoolsQuery,
	useEcosystemPulseQuery,
	useEcosystemStatsQuery,
	useGlobalUsersQuery,
	useSentinelGovernanceQuery,
} from "@repo/core/api";
import { usePermissions, useStore, useTemporalStore } from "@repo/core/logic";
import type { FounderStackParamList, School } from "@repo/core/types";

import { FounderGlow } from "@repo/ui/components/FounderGlow";
import { SkeletonCard } from "@repo/ui/components/SkeletonLoader";
import { TemporalNavigator } from "@repo/ui/components/TemporalNavigator";
import {
	Activity,
	ArrowUpRight,
	Building,
	CloudRain,
	Cloudy,
	ExternalLink,
	Globe,
	LayoutGrid,
	Plus,
	Search,
	Shield,
	Sun,
	TrendingUp,
	Users,
	Zap,
} from "@repo/ui/icons";
import { Icon as SanctuaryIcon } from "@repo/ui/primitives";

import { useState } from "react";
import { GlobalCreateModal } from "../components";

type DashboardTab = "pulse" | "institutions" | "staff" | "sentinel";

export default function FounderDashboardWeb() {
	const navigation =
		useNavigation<NativeStackNavigationProp<FounderStackParamList>>();
	const { ability } = usePermissions();
	// Use user from useStore to get the full user object with full_name, etc.
	const user = useStore((state) => state.user);
	const isPastView = useTemporalStore((s) => s.isPastView);

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<DashboardTab>("pulse");

	// Modernized Data Fetching
	const {
		data: stats,
		isLoading: isLoadingStats,
		refetch: refetchStats,
	} = useEcosystemStatsQuery();
	const {
		data: schoolsData,
		isLoading: isLoadingSchools,
		refetch: refetchSchools,
	} = useAllSchoolsQuery();
	const schools = schoolsData || [];

	const {
		data: ecoPulse,
		isLoading: isLoadingPulse,
		refetch: refetchPulse,
	} = useEcosystemPulseQuery();
	const {
		data: allUsersData,
		isLoading: isLoadingUsers,
		refetch: refetchUsers,
	} = useGlobalUsersQuery();
	const allUsers = allUsersData || [];

	const {
		data: sentinelLogsData,
		isLoading: isLoadingSentinel,
		refetch: refetchSentinel,
	} = useSentinelGovernanceQuery();
	const sentinelLogs = sentinelLogsData || [];

	const refreshData = () => {
		refetchStats();
		refetchSchools();
		refetchPulse();
		refetchUsers();
		refetchSentinel();
	};

	const isLoading =
		isLoadingStats ||
		isLoadingSchools ||
		(activeTab === "staff" && isLoadingUsers) ||
		(activeTab === "sentinel" && isLoadingSentinel) ||
		(activeTab === "pulse" && isLoadingPulse);

	const filteredSchools = schools.filter((s) =>
		s.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const ecosystemStats = [
		{
			label: "Total Institutions",
			value: stats?.total_schools ?? 0,
			icon: Building,
			color: "var(--sanctuary-saffron)",
			bg: "rgba(255,166,0,0.1)",
		},
		{
			label: "Active Classrooms",
			value: stats?.total_classrooms ?? 0,
			icon: LayoutGrid,
			color: "var(--water)",
			bg: "rgba(58,122,154,0.1)",
		},
		{
			label: "Lives Empowered",
			value: stats?.total_users ?? 0,
			icon: Users,
			color: "var(--moss)",
			bg: "rgba(78,154,78,0.1)",
		},
		{
			label: "Ecosystem Health",
			value:
				stats?.ecosystem_health != null
					? `${Math.round(stats.ecosystem_health)}%`
					: "\u2014",
			icon: Activity,
			color: "var(--lotus)",
			bg: "rgba(180,80,100,0.1)",
			isText: true,
		},
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
			{/* ─── 1. COMMAND HEADER ─────────────────────────── */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					flexWrap: "wrap",
					gap: "16px",
				}}
			>
				<div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							marginBottom: "12px",
						}}
					>
						<div
							style={{
								padding: "8px",
								background: "rgba(255,166,0,0.1)",
								borderRadius: "8px",
								color: "var(--sanctuary-saffron)",
							}}
						>
							<SanctuaryIcon as={Globe} size={20} />
						</div>
						<span
							style={{
								fontSize: "12px",
								fontWeight: "800",
								textTransform: "uppercase",
								letterSpacing: "2px",
								color: "var(--ink-ghost)",
							}}
						>
							Ecosystem Command
						</span>
					</div>
					<h1 style={{ fontSize: "40px", fontWeight: "800", margin: 0 }}>
						The Gurudevi{" "}
						<span style={{ color: "var(--sanctuary-saffron)" }}>Ecology</span>.
					</h1>
					<p
						style={{
							color: "var(--ink-ghost)",
							marginTop: "8px",
							fontSize: "14px",
						}}
					>
						Welcome, {user?.full_name || "Founder"}. Real-time institutional
						resonance across Gurudevi.
					</p>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "16px",
						alignItems: "flex-end",
					}}
				>
					<TemporalNavigator />
					<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
						<button
							onClick={() => setIsCreateModalOpen(true)}
							className="premium-button"
							disabled={isPastView || !ability.can("create", "School")}
							style={{
								background: "var(--sanctuary-saffron)",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								boxShadow: "0 4px 14px rgba(255,166,0,0.4)",
								border: "none",
								color: "white",
								padding: "12px 20px",
								borderRadius: "12px",
								fontWeight: "700",
								cursor:
									isPastView || !ability.can("create", "School")
										? "not-allowed"
										: "pointer",
								opacity:
									isPastView || !ability.can("create", "School") ? 0.5 : 1,
							}}
						>
							<SanctuaryIcon as={Plus} size={18} /> Initialize New
						</button>
						<button
							onClick={refreshData}
							className="secondary-button"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								background: "rgba(255,255,255,0.05)",
								backdropFilter: "blur(10px)",
								border: "1px solid var(--border)",
								color: "var(--ink)",
								padding: "12px 20px",
								borderRadius: "12px",
								fontWeight: "700",
								cursor: "pointer",
							}}
						>
							<Zap size={16} /> Refresh
						</button>
					</div>
				</div>
			</div>

			{/* ─── 2. ECOSYSTEM STATS ────────────────────────── */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
					gap: "20px",
				}}
			>
				{ecosystemStats.map((item, idx) => (
					<div
						key={idx}
						className="sanctuary-card"
						style={{
							padding: "24px",
							background: "rgba(255,255,255,0.02)",
							border: "1px solid var(--border)",
							display: "flex",
							flexDirection: "column",
							gap: "16px",
						}}
					>
						<div
							style={{
								padding: "10px",
								background: item.bg,
								borderRadius: "10px",
								width: "fit-content",
								color: item.color,
							}}
						>
							<item.icon size={20} />
						</div>
						<div>
							<div
								style={{
									fontSize: "12px",
									fontWeight: "700",
									color: "var(--ink-ghost)",
									textTransform: "uppercase",
									letterSpacing: "1px",
									marginBottom: "4px",
								}}
							>
								{item.label}
							</div>
							<div style={{ fontSize: "28px", fontWeight: "900" }}>
								{item.value}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* ─── TAB NAVIGATION ────────────────────────────── */}
			<div
				style={{
					display: "flex",
					gap: "8px",
					borderBottom: "1px solid var(--border)",
					paddingBottom: "2px",
					marginBottom: "-20px",
				}}
			>
				{(["pulse", "institutions", "staff", "sentinel"] as const).map(
					(tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							style={{
								background: "none",
								border: "none",
								padding: "12px 24px",
								fontSize: "14px",
								fontWeight: "700",
								color:
									activeTab === tab
										? "var(--sanctuary-saffron)"
										: "var(--ink-ghost)",
								borderBottom:
									activeTab === tab
										? "2px solid var(--sanctuary-saffron)"
										: "2px solid transparent",
								cursor: "pointer",
								textTransform: "capitalize",
								transition: "all 0.2s",
							}}
						>
							{tab === "sentinel" ? "Sentinel Governance" : tab}
						</button>
					),
				)}
			</div>
			{activeTab === "pulse" && (
				<div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
					{/* Ecosystem Weather */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "24px",
						}}
					>
						<div style={{ position: "relative" }}>
							<FounderGlow
								active={ecoPulse?.weather === "radiant"}
								intensity="subtle"
							>
								<div
									className="sanctuary-card"
									style={{
										padding: "24px",
										background: "rgba(255,255,255,0.03)",
										backdropFilter: "blur(20px)",
										border: "1px solid rgba(255,255,255,0.05)",
										minHeight: "200px",
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "20px",
										}}
									>
										<span
											style={{
												fontSize: "12px",
												fontWeight: "800",
												textTransform: "uppercase",
												letterSpacing: "1px",
												opacity: 0.6,
											}}
										>
											Ecosystem Resonance
										</span>
										{ecoPulse?.weather === "radiant" ? (
											<Sun color="#F59E0B" size={24} />
										) : ecoPulse?.weather === "lush" ? (
											<Cloudy color="#10B981" size={24} />
										) : (
											<CloudRain color="#6366f1" size={24} />
										)}
									</div>
									<h2
										style={{
											fontSize: "42px",
											fontWeight: "900",
											margin: "0 0 8px 0",
											color: "var(--ink)",
										}}
									>
										{ecoPulse?.weather?.toUpperCase() || "STEADY"}
									</h2>
									<p
										style={{
											opacity: 0.6,
											fontSize: "14px",
											lineHeight: "1.5",
										}}
									>
										Collective energy is{" "}
										{ecoPulse?.weather === "radiant"
											? "vibrant and flourishing"
											: "resting and quiet"}{" "}
										across {ecoPulse?.pulses?.length || 0} nodes.
									</p>
								</div>
							</FounderGlow>
						</div>

						<div
							className="sanctuary-card"
							style={{
								padding: "24px",
								background: "rgba(255,255,255,0.02)",
								backdropFilter: "blur(10px)",
							}}
						>
							<div style={{ marginBottom: "20px" }}>
								<span
									style={{
										fontSize: "12px",
										fontWeight: "800",
										textTransform: "uppercase",
										letterSpacing: "1px",
										opacity: 0.6,
									}}
								>
									Strategic Growth
								</span>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: "12px",
									marginBottom: "16px",
								}}
							>
								<h2 style={{ fontSize: "36px", fontWeight: "900", margin: 0 }}>
									{stats?.total_users || 0}
								</h2>
								<span
									style={{
										color: "#10B981",
										fontWeight: "800",
										fontSize: "14px",
									}}
								>
									+12%
								</span>
							</div>
							<div
								style={{
									height: "40px",
									display: "flex",
									alignItems: "flex-end",
									gap: "4px",
								}}
							>
								{[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
									<div
										key={i}
										style={{
											flex: 1,
											height: `${h}%`,
											background: "var(--sanctuary-saffron)",
											opacity: 0.3 + i * 0.1,
											borderRadius: "2px",
										}}
									/>
								))}
							</div>
						</div>

						<div
							className="sanctuary-card"
							style={{
								padding: "24px",
								background: "rgba(255,255,255,0.02)",
								backdropFilter: "blur(10px)",
							}}
						>
							<div style={{ marginBottom: "20px" }}>
								<span
									style={{
										fontSize: "12px",
										fontWeight: "800",
										textTransform: "uppercase",
										letterSpacing: "1px",
										opacity: 0.6,
									}}
								>
									Knowledge & Flow
								</span>
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "16px",
								}}
							>
								<div>
									<div style={{ fontSize: "24px", fontWeight: "800" }}>
										{stats?.total_library_resources || 0}
									</div>
									<div
										style={{
											fontSize: "10px",
											fontWeight: "700",
											opacity: 0.5,
										}}
									>
										RESOURCES
									</div>
								</div>
								<div>
									<div style={{ fontSize: "24px", fontWeight: "800" }}>
										{stats?.growth_signals_7d || 0}
									</div>
									<div
										style={{
											fontSize: "10px",
											fontWeight: "700",
											opacity: 0.5,
										}}
									>
										FLOWS (7D)
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* ─── NEW AGGREGATION MODULES ─────────────────────── */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
							gap: "24px",
						}}
					>
						{/* 1. RESOURCE ECOLOGY (STOCKS) */}
						<div
							className="sanctuary-card"
							style={{
								padding: "0",
								overflow: "hidden",
								background: "rgba(255,255,255,0.01)",
								border: "1px solid rgba(255,255,255,0.03)",
							}}
						>
							<div
								style={{
									padding: "20px",
									borderBottom: "1px solid rgba(255,255,255,0.05)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "10px" }}
								>
									<Zap size={18} color="var(--sanctuary-saffron)" />
									<h3
										style={{ fontSize: "15px", fontWeight: "800", margin: 0 }}
									>
										Resource Ecology
									</h3>
								</div>
								<span
									style={{
										fontSize: "11px",
										fontWeight: "700",
										padding: "2px 8px",
										background: "rgba(255,166,0,0.1)",
										color: "var(--sanctuary-saffron)",
										borderRadius: "4px",
									}}
								>
									STOCKS
								</span>
							</div>
							<div style={{ padding: "24px" }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: "20px",
									}}
								>
									<div style={{ fontSize: "32px", fontWeight: "900" }}>
										{stats?.total_inventory_items || 0}
									</div>
									<div
										style={{
											fontSize: "12px",
											fontWeight: "700",
											opacity: 0.5,
										}}
									>
										TOTAL GLOBAL STOCK
									</div>
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "12px",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px",
											background: "rgba(255,255,255,0.02)",
											borderRadius: "10px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<div
												style={{
													width: "4px",
													height: "4px",
													borderRadius: "50%",
													background: "var(--sanctuary-saffron)",
												}}
											/>
											<span style={{ fontSize: "13px", fontWeight: "600" }}>
												Active Supply Requests
											</span>
										</div>
										<span
											style={{
												fontWeight: "800",
												color:
													(stats?.pending_inventory_requests || 0) > 0
														? "#F59E0B"
														: "inherit",
											}}
										>
											{stats?.pending_inventory_requests || 0}
										</span>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px",
											background: "rgba(255,255,255,0.02)",
											borderRadius: "10px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<div
												style={{
													width: "4px",
													height: "4px",
													borderRadius: "50%",
													background: "#10B981",
												}}
											/>
											<span style={{ fontSize: "13px", fontWeight: "600" }}>
												Utilization Efficiency
											</span>
										</div>
										<span style={{ fontWeight: "800", color: "#10B981" }}>
											94%
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* 2. RESONANCE FLOW (FEEDBACK LOOPS) */}
						<div
							className="sanctuary-card"
							style={{
								padding: "0",
								overflow: "hidden",
								background: "rgba(255,255,255,0.01)",
								border: "1px solid rgba(255,255,255,0.03)",
							}}
						>
							<div
								style={{
									padding: "20px",
									borderBottom: "1px solid rgba(255,255,255,0.05)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "10px" }}
								>
									<SanctuaryIcon as={Activity} size={18} color="var(--water)" />
									<h3
										style={{ fontSize: "15px", fontWeight: "800", margin: 0 }}
									>
										Resonance Flow
									</h3>
								</div>
								<span
									style={{
										fontSize: "11px",
										fontWeight: "700",
										padding: "2px 8px",
										background: "rgba(58,122,154,0.1)",
										color: "var(--water)",
										borderRadius: "4px",
									}}
								>
									LOOPS
								</span>
							</div>
							<div style={{ padding: "24px" }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: "20px",
									}}
								>
									<div style={{ fontSize: "32px", fontWeight: "900" }}>
										{stats?.total_echo_feedback || 0}
									</div>
									<div
										style={{
											fontSize: "12px",
											fontWeight: "700",
											opacity: 0.5,
										}}
									>
										GLOBAL ECHOES
									</div>
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "12px",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px",
											background: "rgba(255,255,255,0.02)",
											borderRadius: "10px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<div
												style={{
													width: "4px",
													height: "4px",
													borderRadius: "50%",
													background: "var(--water)",
												}}
											/>
											<span style={{ fontSize: "13px", fontWeight: "600" }}>
												Pending Responses
											</span>
										</div>
										<span style={{ fontWeight: "800", color: "#3A7A9A" }}>
											{stats?.pending_echo_responses || 0}
										</span>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px",
											background: "rgba(255,255,255,0.02)",
											borderRadius: "10px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<div
												style={{
													width: "4px",
													height: "4px",
													borderRadius: "50%",
													background: "#8b5cf6",
												}}
											/>
											<span style={{ fontSize: "13px", fontWeight: "600" }}>
												Loop Latency
											</span>
										</div>
										<span style={{ fontWeight: "800" }}>2.4h</span>
									</div>
								</div>
							</div>
						</div>

						{/* 3. PERFORMANCE PULSE (RESULTS) */}
						<div
							className="sanctuary-card"
							style={{
								padding: "0",
								overflow: "hidden",
								background: "rgba(255,255,255,0.01)",
								border: "1px solid rgba(255,255,255,0.03)",
							}}
						>
							<div
								style={{
									padding: "20px",
									borderBottom: "1px solid rgba(255,255,255,0.05)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "10px" }}
								>
									<TrendingUp size={18} color="var(--moss)" />
									<h3
										style={{ fontSize: "15px", fontWeight: "800", margin: 0 }}
									>
										Performance Pulse
									</h3>
								</div>
								<span
									style={{
										fontSize: "11px",
										fontWeight: "700",
										padding: "2px 8px",
										background: "rgba(78,154,78,0.1)",
										color: "var(--moss)",
										borderRadius: "4px",
									}}
								>
									RESULTS
								</span>
							</div>
							<div style={{ padding: "24px" }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "baseline",
										marginBottom: "20px",
									}}
								>
									<div style={{ fontSize: "32px", fontWeight: "900" }}>
										{stats?.avg_student_performance
											? stats.avg_student_performance
											: "—"}
									</div>
									<div
										style={{
											fontSize: "12px",
											fontWeight: "700",
											opacity: 0.5,
										}}
									>
										AVG PERFORMANCE %
									</div>
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "12px",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px",
											background: "rgba(255,255,255,0.02)",
											borderRadius: "10px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<div
												style={{
													width: "4px",
													height: "4px",
													borderRadius: "50%",
													background: "var(--moss)",
												}}
											/>
											<span style={{ fontSize: "13px", fontWeight: "600" }}>
												Recent Submissions
											</span>
										</div>
										<span style={{ fontWeight: "800" }}>
											{stats?.submissions_7d || 0}
										</span>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px",
											background: "rgba(255,255,255,0.02)",
											borderRadius: "10px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<div
												style={{
													width: "4px",
													height: "4px",
													borderRadius: "50%",
													background: "#ec4899",
												}}
											/>
											<span style={{ fontSize: "13px", fontWeight: "600" }}>
												Success Resonance
											</span>
										</div>
										<span style={{ fontWeight: "800", color: "#ec4899" }}>
											Lush
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Regional Pulses */}
					<div
						className="sanctuary-card"
						style={{ padding: "24px", background: "rgba(255,255,255,0.01)" }}
					>
						<h3
							style={{
								fontSize: "16px",
								fontWeight: "800",
								marginBottom: "20px",
							}}
						>
							Institutional Resonance Ripples
						</h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
								gap: "16px",
							}}
						>
							{ecoPulse?.pulses?.map((p: any, i: number) => (
								<div
									key={i}
									style={{
										padding: "16px",
										background: "rgba(0,0,0,0.02)",
										borderRadius: "12px",
										borderLeft: `4px solid ${p.weather === "radiant" ? "#F59E0B" : "#10B981"}`,
									}}
								>
									<div
										style={{
											fontWeight: "700",
											fontSize: "13px",
											marginBottom: "4px",
										}}
									>
										{p.school_name}
									</div>
									<div
										style={{
											fontSize: "11px",
											opacity: 0.5,
											textTransform: "uppercase",
										}}
									>
										{p.weather}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{activeTab === "institutions" && (
				<div>
					{/* ─── 3. INSTITUTIONS GALLERY ────────────────────────── */}
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "20px",
								flexWrap: "wrap",
								gap: "12px",
							}}
						>
							<h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
								Institutional Gallery
							</h2>
							<div
								style={{ display: "flex", alignItems: "center", gap: "12px" }}
							>
								<div style={{ position: "relative" }}>
									<SanctuaryIcon
										as={Search}
										size={16}
										color="var(--ink-ghost)"
										style={{
											position: "absolute",
											left: 12,
											top: "50%",
											transform: "translateY(-50%)",
										}}
									/>
									<input
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search institutions\u2026"
										style={{
											padding: "8px 14px 8px 36px",
											borderRadius: "10px",
											border: "1px solid var(--border)",
											fontSize: "13px",
											background: "rgba(255,255,255,0.03)",
											color: "var(--ink)",
											fontFamily: "inherit",
											minWidth: "240px",
										}}
									/>
								</div>
								<span style={{ fontSize: "13px", color: "var(--ink-ghost)" }}>
									{filteredSchools.length} institution
									{filteredSchools.length !== 1 ? "s" : ""}
								</span>
							</div>
						</div>

						{isLoading ? (
							<div
								style={{
									display: "grid",
									gridTemplateColumns:
										"repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
									gap: "24px",
								}}
							>
								<SkeletonCard height={200} />
								<SkeletonCard height={200} />
								<SkeletonCard height={200} />
							</div>
						) : filteredSchools.length === 0 ? (
							<div
								style={{
									textAlign: "center",
									padding: "48px 24px",
									background: "var(--background-alt)",
									borderRadius: "20px",
								}}
							>
								<Building
									size={40}
									color="var(--ink-ghost)"
									style={{ marginBottom: 16 }}
								/>
								<h3
									style={{
										fontSize: "18px",
										fontWeight: "700",
										marginBottom: "8px",
									}}
								>
									{searchQuery
										? "No matching institutions"
										: "No institutions yet"}
								</h3>
								<p
									style={{
										fontSize: "14px",
										color: "var(--ink-ghost)",
										marginBottom: "24px",
									}}
								>
									{searchQuery
										? "Try a different search term."
										: "Initialize your first institution to begin building the Gurudevi ecology."}
								</p>
								{!searchQuery && (
									<button
										onClick={() => setIsCreateModalOpen(true)}
										className="premium-button"
										style={{
											background: "var(--sanctuary-saffron)",
											display: "inline-flex",
											alignItems: "center",
											gap: "8px",
										}}
									>
										<SanctuaryIcon as={Plus} size={16} /> Initialize First
										Institution
									</button>
								)}
							</div>
						) : (
							<div
								style={{
									display: "grid",
									gridTemplateColumns:
										"repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
									gap: "24px",
								}}
							>
								{filteredSchools.map((school) => (
									<SchoolCard
										key={school.id}
										school={school}
										onPress={() =>
											(navigation as any).navigate("FounderSchoolDashboard", {
												schoolId: String(school.id),
												userId: user?.id ?? "",
											})
										}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{activeTab === "staff" && (
				<div
					className="sanctuary-card"
					style={{
						background: "rgba(255,255,255,0.02)",
						backdropFilter: "blur(20px)",
						border: "1px solid rgba(255,255,255,0.05)",
					}}
				>
					<div className="card-body-inner">
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "24px",
							}}
						>
							<h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>
								Global Staff Management
							</h2>
							<div style={{ fontSize: "12px", color: "var(--ink-ghost)" }}>
								{allUsers.length} Souls Registered
							</div>
						</div>
						{isLoadingUsers ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "12px",
								}}
							>
								<SkeletonCard height={60} />
								<SkeletonCard height={60} />
								<SkeletonCard height={60} />
							</div>
						) : (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "1px",
									background: "var(--border)",
									borderRadius: "12px",
									overflow: "hidden",
									border: "1px solid var(--border)",
								}}
							>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 0.5fr",
										padding: "12px 20px",
										background: "var(--background-alt)",
										fontSize: "11px",
										fontWeight: "800",
										textTransform: "uppercase",
										letterSpacing: "1px",
										color: "var(--ink-ghost)",
									}}
								>
									<span>User / Email</span>
									<span>Institution</span>
									<span>Role</span>
									<span>Joined</span>
									<span style={{ textAlign: "right" }}>Action</span>
								</div>
								{allUsers.map((u, i) => (
									<div
										key={i}
										style={{
											display: "grid",
											gridTemplateColumns: "2fr 1.5fr 1fr 1.5fr 0.5fr",
											padding: "16px 20px",
											background: "var(--surface)",
											alignItems: "center",
											fontSize: "14px",
											transition: "background 0.2s",
										}}
										className="staff-row"
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "12px",
											}}
										>
											<div
												style={{
													width: "32px",
													height: "32px",
													borderRadius: "50%",
													background: "var(--background-alt)",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontSize: "18px",
												}}
											>
												{u.avatar_url ? (
													<img
														src={u.avatar_url}
														style={{
															width: "100%",
															height: "100%",
															borderRadius: "50%",
														}}
														alt=""
													/>
												) : (
													"\uD83D\uDC64"
												)}
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<span style={{ fontWeight: "700" }}>{u.full_name}</span>
												<span
													style={{
														fontSize: "11px",
														color: "var(--ink-ghost)",
													}}
												>
													{u.email}
												</span>
											</div>
										</div>
										<span style={{ fontWeight: "600" }}>
											{u.schools?.name || "\u2014"}
										</span>
										<div>
											<span
												style={{
													display: "inline-block",
													padding: "2px 8px",
													borderRadius: "6px",
													fontSize: "10px",
													fontWeight: "800",
													textTransform: "uppercase",
													background:
														u.role === "developer"
															? "rgba(255,166,0,0.1)"
															: "rgba(0,0,0,0.05)",
													color:
														u.role === "developer"
															? "var(--sanctuary-saffron)"
															: "var(--ink-ghost)",
												}}
											>
												{u.role}
											</span>
										</div>
										<span
											style={{ fontSize: "12px", color: "var(--ink-ghost)" }}
										>
											{new Date(u.created_at).toLocaleDateString()}
										</span>
										<div style={{ textAlign: "right" }}>
											<button
												style={{
													background: "none",
													border: "none",
													cursor: "pointer",
													color: "var(--ink-ghost)",
												}}
											>
												<ExternalLink size={14} />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{activeTab === "sentinel" && (
				<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
					<div
						className="sanctuary-card"
						style={{
							padding: "24px",
							background: "rgba(255,255,255,0.02)",
							backdropFilter: "blur(20px)",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "24px",
							}}
						>
							<div>
								<h2 style={{ fontSize: "20px", fontWeight: "800", margin: 0 }}>
									Sentinel Governance Ledger
								</h2>
								<p style={{ fontSize: "12px", opacity: 0.5, marginTop: "4px" }}>
									Non-repudiable audit trails of institutional evolution.
								</p>
							</div>
							<SanctuaryIcon
								as={Shield}
								size={24}
								color="var(--sanctuary-saffron)"
							/>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "1px",
								background: "var(--border)",
								borderRadius: "12px",
								overflow: "hidden",
							}}
						>
							{sentinelLogs.length > 0 ? (
								sentinelLogs.map((log, i) => (
									<div
										key={i}
										style={{
											display: "grid",
											gridTemplateColumns: "3fr 1fr 1.5fr",
											padding: "16px 20px",
											background: "var(--surface)",
											alignItems: "center",
										}}
									>
										<div
											style={{
												display: "flex",
												gap: "12px",
												alignItems: "center",
											}}
										>
											<div
												style={{
													width: "8px",
													height: "8px",
													borderRadius: "50%",
													background: "#F59E0B",
												}}
											/>
											<div>
												<div style={{ fontWeight: "700", fontSize: "14px" }}>
													{log.action}
												</div>
												<div style={{ fontSize: "11px", opacity: 0.5 }}>
													Target: {log.target_id}
												</div>
											</div>
										</div>
										<div style={{ fontSize: "12px", fontWeight: "600" }}>
											{log.executor_id || "SYSTEM"}
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span style={{ fontSize: "12px", opacity: 0.5 }}>
												{new Date(log.created_at).toLocaleString()}
											</span>
											<SanctuaryIcon as={Shield} size={14} color="#10B981" />
										</div>
									</div>
								))
							) : (
								<div
									style={{
										textAlign: "center",
										padding: "60px",
										background: "var(--surface)",
										opacity: 0.5,
									}}
								>
									<SanctuaryIcon
										as={Shield}
										size={48}
										style={{ margin: "0 auto", marginBottom: "16px" } as any}
									/>
									<div>
										No critical governance events logged. Resonance is steady.
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Global Create Modal */}
			<GlobalCreateModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				availableSchools={schools}
				onSuccess={() => {
					setIsCreateModalOpen(false);
					refreshData();
				}}
			/>
		</div>
	);
}

// \u2500\u2500 School Card Component \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function SchoolCard({
	school,
	onPress,
}: {
	school: School;
	onPress: () => void;
}) {
	return (
		<button
			className="sanctuary-card interactive"
			style={{
				cursor: "pointer",
				transition: "transform 0.2s, box-shadow 0.2s",
				width: "100%",
				textAlign: "left",
				background: "none",
				border: "none",
				padding: 0,
				font: "inherit",
			}}
			onClick={onPress}
		>
			<div className="card-body-inner">
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: "16px",
					}}
				>
					<div
						style={{
							width: "48px",
							height: "48px",
							borderRadius: "14px",
							background: "rgba(255,166,0,0.1)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Building size={24} color="var(--sanctuary-saffron)" />
					</div>
					<ArrowUpRight size={18} color="var(--ink-ghost)" />
				</div>
				<h3
					style={{
						fontSize: "16px",
						fontWeight: "900",
						marginBottom: "8px",
						lineHeight: "1.3",
					}}
				>
					{school.name}
				</h3>
				{school.type && (
					<span
						style={{
							display: "inline-block",
							padding: "3px 10px",
							background: "rgba(255,166,0,0.1)",
							color: "var(--sanctuary-saffron)",
							borderRadius: "6px",
							fontSize: "10px",
							fontWeight: "800",
							textTransform: "uppercase",
							marginBottom: "16px",
						}}
					>
						{school.type}
					</span>
				)}

				<div
					style={{
						display: "flex",
						gap: "16px",
						borderTop: "1px solid var(--border)",
						paddingTop: "16px",
						marginTop: "auto",
					}}
				>
					<div>
						<div
							style={{
								fontSize: "10px",
								fontWeight: "700",
								color: "var(--ink-ghost)",
								textTransform: "uppercase",
							}}
						>
							Type
						</div>
						<div
							style={{
								fontSize: "13px",
								fontWeight: "700",
								textTransform: "capitalize",
							}}
						>
							{school.type ?? "Institutional"}
						</div>
					</div>
					<div>
						<div
							style={{
								fontSize: "10px",
								fontWeight: "700",
								color: "var(--ink-ghost)",
								textTransform: "uppercase",
							}}
						>
							Since
						</div>
						<div style={{ fontSize: "13px", fontWeight: "700" }}>
							{school.created_at
								? new Date(school.created_at).getFullYear()
								: "2024"}
						</div>
					</div>
				</div>
			</div>
		</button>
	);
}
