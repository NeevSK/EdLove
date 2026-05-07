import { usePermissions } from "@repo/core/logic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	fetchPresenceFallbackCount,
	startPresenceSession,
} from "../api/selfInsightsRepository";

interface UseCommunityPresenceOptions {
	userId: string;
	userVibe?: string;
}

export function useCommunityPresence({
	userId,
	userVibe = "active",
}: UseCommunityPresenceOptions) {
	const { can, context } = usePermissions();
	const userRole = context.activeBond?.capacity || "guest";
	const [onlineCount, setOnlineCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isOffline, setIsOffline] = useState(false);

	const presenceConfig = useMemo(() => {
		if (can("read", "PrincipalPulse") || can("manage", "PrincipalDashboard")) {
			return {
				targetRoles: [
					"teacher",
					"student",
					"section_head",
					"grade_head",
					"principal",
					"developer",
				],
				channelName: "presence:school",
				isCumulative: true,
				perspective: "principal" as const,
			};
		}

		if (can("read", "TeacherPulse") || can("manage", "TeacherDashboard")) {
			return {
				targetRoles: ["teacher", "section_head", "grade_head", "principal"],
				channelName: "presence:educators",
				isCumulative: false,
				perspective: "teacher" as const,
			};
		}

		return {
			targetRoles: ["student"],
			channelName: "presence:students",
			isCumulative: false,
			perspective: "student" as const,
		};
	}, [can]);

	const refreshFallbackCount = useCallback(async () => {
		try {
			const count = await fetchPresenceFallbackCount({
				targetRoles: presenceConfig.targetRoles,
				isCumulative: presenceConfig.isCumulative,
				userId,
			});
			setOnlineCount(count);
			setIsOffline(false);
		} catch (error) {
			console.error("[CommunityPresence] Error fetching online users:", error);
			setIsOffline(true);
		} finally {
			setIsLoading(false);
		}
	}, [presenceConfig.isCumulative, presenceConfig.targetRoles, userId]);

	useEffect(() => {
		refreshFallbackCount();

		if (!userId) return;

		const cleanupSession = startPresenceSession({
			userId,
			userRole,
			userVibe,
			channelName: presenceConfig.channelName,
			onCountChange: setOnlineCount,
			onOfflineChange: setIsOffline,
		});

		const heartbeat = setInterval(refreshFallbackCount, 30000);

		return () => {
			cleanupSession();
			clearInterval(heartbeat);
		};
	}, [
		presenceConfig.channelName,
		refreshFallbackCount,
		userId,
		userRole,
		userVibe,
	]);

	return {
		onlineCount,
		isLoading,
		isOffline,
		perspective: presenceConfig.perspective,
	};
}
