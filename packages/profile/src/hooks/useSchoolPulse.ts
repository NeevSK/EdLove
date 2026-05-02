import { useTemporalStore } from "@repo/core/logic";
import { useCallback, useEffect, useState } from "react";
import { profileAPI } from "../api/profile";
export interface PulseMetrics {
	resonance_score: number;
	aggregated_mood: "joy" | "peace" | "focus" | "struggle" | "unknown";
	trend: "rising" | "stable" | "failing";
	participation_rate: number;
	top_subjects: string[];
	interaction_volume: number;
}
export function useSchoolPulse(schoolId?: string) {
	const [pulse, setPulse] = useState<PulseMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [_refreshToken, setRefreshToken] = useState(0);
	const viewDate = useTemporalStore((state) => state.viewDate);
	const viewScale = useTemporalStore((state) => state.viewScale);
	const fetchPulse = useCallback(
		async (
			id: string,
			signal: {
				cancelled: boolean;
			},
			temporal: {
				viewDate: string;
				viewScale: import("@repo/core/store").TemporalScale;
			},
		) => {
			setLoading(true);
			try {
				const data = await profileAPI.getSchoolPulse(id, temporal);
				if (signal.cancelled) return;
				setPulse(data);
				setError(null);
			} catch {
				if (!signal.cancelled) setError("Failed to sync school pulse");
			} finally {
				if (!signal.cancelled) setLoading(false);
			}
		},
		[],
	);
	useEffect(() => {
		if (!schoolId) {
			setPulse(null);
			setLoading(false);
			return;
		}
		const signal = { cancelled: false };
		fetchPulse(schoolId, signal, { viewDate, viewScale });
		return () => {
			signal.cancelled = true;
		};
	}, [schoolId, fetchPulse, viewDate, viewScale]);
	return {
		pulse,
		loading,
		error,
		refresh: () => setRefreshToken((t) => t + 1),
	};
}
