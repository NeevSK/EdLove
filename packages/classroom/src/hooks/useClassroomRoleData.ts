import { api } from "@repo/core/api";
import { usePermissions, useStore } from "@repo/core/logic";

import { useCallback, useEffect, useState } from "react";

export interface ClassroomRoleData {
	userId: string;
	schoolId: string | null;
	profileCompleted: boolean;
	realClassCount: number;
}

type SyncableLocalUser = {
	profile_completed?: boolean;
	school_id?: string | null;
	capacity?: string | null;
	platform_capacities?: unknown;
	school_capacity?: unknown;
	work_capacities?: unknown;
	tenant_kind?: unknown;
	full_name?: string | null;
	email?: string | null;
	id?: string;
};

const toSyncableLocalUser = (user: unknown): SyncableLocalUser => {
	if (user && typeof user === "object") {
		return user as SyncableLocalUser;
	}
	return {};
};

export function useClassroomRoleData(_refreshTrigger: number = 0) {
	const { context } = usePermissions();
	const { userId, schoolId } = context;
	const syncedLocalUser = toSyncableLocalUser(useStore((state) => state.user));
	const {
		realClassCount: storeClassCount,
		setRealClassCount,
		setUser,
	} = useStore();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<ClassroomRoleData | null>(null);

	const fetchData = useCallback(async () => {
		// 1. Instant Hydration: Prepare initial data from local store
		if (!userId) {
			setData(null);
			setLoading(false);
			return;
		}

		// Set initial data immediately so UI doesn't wait
		setData((prev) => {
			const currentClassCount =
				storeClassCount !== null ? storeClassCount : prev?.realClassCount || 0;

			if (
				prev &&
				prev.userId === userId &&
				prev.schoolId === schoolId &&
				prev.profileCompleted === !!syncedLocalUser.profile_completed &&
				prev.realClassCount === currentClassCount
			) {
				return prev;
			}

			return {
				userId,
				schoolId,
				profileCompleted: !!syncedLocalUser.profile_completed,
				realClassCount: currentClassCount as number,
			};
		});

		try {
			// 2. Background Sync: Fetch from the core API boundary
			const summary = await api["identity"].getClassroomCapacitySummary(userId);
			const profileCheck = { data: summary.profile };
			const realClassCount = summary.realClassCount;

			// Update store if server data is newer/different (Convergence)
			if (profileCheck.data) {
					const serverUser = profileCheck.data;
					// Strict comparison to prevent loop
					const hasSignificantChanges =
					serverUser.profile_completed !== syncedLocalUser.profile_completed ||
					serverUser.school_id !== syncedLocalUser.school_id ||
					serverUser.capacity !== syncedLocalUser.capacity ||
					JSON.stringify(serverUser.platform_capacities) !==
						JSON.stringify(syncedLocalUser.platform_capacities) ||
					serverUser.school_capacity !== syncedLocalUser.school_capacity ||
					JSON.stringify(serverUser.work_capacities) !==
						JSON.stringify(syncedLocalUser.work_capacities) ||
					serverUser.tenant_kind !== syncedLocalUser.tenant_kind ||
					serverUser.full_name !== syncedLocalUser.full_name ||
					serverUser.email !== syncedLocalUser.email;

				if (hasSignificantChanges) {
					console.log(
						"= useClassroomRoleData: Syncing user data from server (Changes detected)",
					);
					setUser({ ...syncedLocalUser, ...serverUser, id: userId });
				}
			}

			// Sync class count back to store if different
			if (realClassCount !== storeClassCount) {
				setRealClassCount(realClassCount);
			}

			setData({
				userId,
				schoolId: summary.schoolId || schoolId,
				profileCompleted: summary.profileCompleted,
				realClassCount,
			});
		} catch (error) {
			console.error("Error syncing classroom role data:", error);
		} finally {
			setLoading(false);
		}
	}, [userId, schoolId, setUser, setRealClassCount, storeClassCount, syncedLocalUser]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, fetchRoleData: fetchData };
}
