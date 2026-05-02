import { useCallback, useEffect, useState } from "react";
import { profileAPI } from "../api/profile";
import type {
	CommunityProfile,
	ProfileHistoryEntry,
} from "../domains/profile/ports";

export function useCommunityProfileHistory(communityId: string, limit = 20) {
	const [history, setHistory] = useState<
		ProfileHistoryEntry<CommunityProfile>[]
	>([]);
	const [loading, setLoading] = useState(true);

	const loadHistory = useCallback(async () => {
		if (!communityId) {
			setHistory([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const data = await profileAPI.getCommunityProfileHistory(
				communityId,
				limit,
			);
			setHistory(data);
		} finally {
			setLoading(false);
		}
	}, [communityId, limit]);

	useEffect(() => {
		void loadHistory();
	}, [loadHistory]);

	return { history, loading, refresh: loadHistory };
}
