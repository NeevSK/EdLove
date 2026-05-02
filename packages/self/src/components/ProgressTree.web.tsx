/**
 * ProgressTree.web.tsx
 *
 * Web override. The native version uses react-native-reanimated for a breathing
 * tree animation. On web we deliver the same organic growth visual using CSS
 * animations and a temporal-aware interaction count from the self repository.
 * Metro resolves this over ProgressTree.tsx on the web platform.
 */
import { useTemporalStore } from "@repo/core/logic";

import { useEffect, useState } from "react";
import { fetchInteractionCountForView } from "../api/selfInsightsRepository";

interface ProgressTreeProps {
	userId?: string;
}

const GROWTH_STAGES = [
	{
		minInteractions: 0,
		stage: "seed",
		emoji: "🌱",
		label: "Seed",
		description: "Just beginning",
	},
	{
		minInteractions: 5,
		stage: "sprout",
		emoji: "🌿",
		label: "Sprout",
		description: "Taking root",
	},
	{
		minInteractions: 15,
		stage: "sapling",
		emoji: "🪴",
		label: "Sapling",
		description: "Growing steadily",
	},
	{
		minInteractions: 30,
		stage: "young_tree",
		emoji: "🌳",
		label: "Young Tree",
		description: "Finding strength",
	},
	{
		minInteractions: 50,
		stage: "tree",
		emoji: "🌲",
		label: "Tree",
		description: "Standing tall",
	},
	{
		minInteractions: 75,
		stage: "blooming",
		emoji: "🌸",
		label: "Blooming",
		description: "Flourishing",
	},
] as const;

export default function ProgressTree({ userId }: ProgressTreeProps) {
	const [interactionCount, setInteractionCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const { viewDate, isPastView } = useTemporalStore();

	useEffect(() => {
		if (!userId) {
			setIsLoading(false);
			return;
		}

		const fetch = async () => {
			try {
				const count = await fetchInteractionCountForView(userId, {
					viewDate,
					isPastView,
				});
				setInteractionCount(count);
			} catch {
				// Non-fatal; the card can still render a neutral state.
			} finally {
				setIsLoading(false);
			}
		};

		fetch();
	}, [isPastView, userId, viewDate]);

	const currentStage =
		[...GROWTH_STAGES]
			.reverse()
			.find((stage) => interactionCount >= stage.minInteractions) ??
		GROWTH_STAGES[0];
	const nextStage = GROWTH_STAGES.find(
		(stage) => stage.minInteractions > interactionCount,
	);
	const progressPct = nextStage
		? Math.round(
				((interactionCount - currentStage.minInteractions) /
					(nextStage.minInteractions - currentStage.minInteractions)) *
					100,
			)
		: 100;

	if (isLoading) {
		return (
			<div
				style={{
					height: "80px",
					background: "var(--background-alt)",
					borderRadius: "14px",
				}}
			/>
		);
	}

	return (
		<div
			style={{
				padding: "20px 24px",
				background: "var(--background-alt)",
				borderRadius: "16px",
			}}
		>
			<div
				style={{
					fontSize: "11px",
					fontWeight: "800",
					textTransform: "uppercase",
					letterSpacing: "1.5px",
					color: "var(--ink-ghost)",
					marginBottom: "16px",
				}}
			>
				Growth Journey
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "20px",
					marginBottom: "20px",
				}}
			>
				<div
					style={{
						fontSize: "56px",
						animation: "breathe 4s ease-in-out infinite",
						lineHeight: 1,
					}}
				>
					{currentStage.emoji}
				</div>
				<div>
					<div
						style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}
					>
						{currentStage.label}
					</div>
					<div
						style={{
							fontSize: "13px",
							color: "var(--ink-ghost)",
							marginBottom: "8px",
						}}
					>
						{currentStage.description}
					</div>
					<div style={{ fontSize: "12px", color: "var(--ink-ghost)" }}>
						{interactionCount} interaction{interactionCount !== 1 ? "s" : ""}{" "}
						logged
					</div>
				</div>
			</div>
			{nextStage && (
				<div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "6px",
						}}
					>
						<span style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>
							Progress to {nextStage.label} {nextStage.emoji}
						</span>
						<span style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>
							{progressPct}%
						</span>
					</div>
					<div
						style={{
							height: "6px",
							background: "var(--border)",
							borderRadius: "3px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: `${progressPct}%`,
								height: "100%",
								background: "linear-gradient(to right, var(--moss), #10b981)",
								borderRadius: "3px",
								transition: "width 0.6s ease",
							}}
						/>
					</div>
					<div
						style={{
							fontSize: "11px",
							color: "var(--ink-ghost)",
							marginTop: "6px",
						}}
					>
						{nextStage.minInteractions - interactionCount} more interaction
						{nextStage.minInteractions - interactionCount !== 1 ? "s" : ""} to
						grow
					</div>
				</div>
			)}

			{progressPct === 100 && (
				<div
					style={{
						fontSize: "13px",
						color: "var(--moss)",
						fontWeight: "700",
						textAlign: "center",
						marginTop: "8px",
					}}
				>
					🌸 Fully bloomed, your growth is beautiful.
				</div>
			)}

			<style>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(0.95); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
		</div>
	);
}
