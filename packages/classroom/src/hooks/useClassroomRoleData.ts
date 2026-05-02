import { api } from "@repo/core/api";
import { usePermissions, useStore } from "@repo/core/logic";

import { useCallback, useEffect, useState } from "react";

export interface ClassroomRoleData {
	userId: string;
	schoolId: string | null;
	profileCompleted: boolean;
	realClassCount: number;
}

export function useClassroomRoleData(_refreshTrigger: number = 0) {
	const { context } = usePermissions();
	const { userId, schoolId } = context;
	const {
		realClassCount: storeClassCount,
		setRealClassCount,
		setUser,
		user: localUser,
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
				prev.profileCompleted === !!localUser?.profile_completed &&
				prev.realClassCount === currentClassCount
			) {
				return prev;
			}
			return {
				userId,
				schoolId,
				profileCompleted: !!localUser?.profile_completed,
				realClassCount: currentClassCount as number,
			};
		});

		try {
			// 2. Background Sync: Fetch from the core API boundary
			const summary = await api.identity.getClassroomRoleSummary(userId);
			const profileCheck = { data: summary.profile };
			const realClassCount = summary.realClassCount;

			// Update store if server data is newer/different (Convergence)
			if (profileCheck.data) {
				const serverUser = profileCheck.data;
				// Strict comparison to prevent loop
				const hasSignificantChanges =
					serverUser.profile_completed !== localUser?.profile_completed ||
					serverUser.school_id !== localUser?.school_id ||
					serverUser.role !== localUser?.authority ||
					JSON.stringify(serverUser.platform_roles) !==
						JSON.stringify((localUser as any)?.platform_authorities) ||
					serverUser.school_role !== (localUser as any)?.school_authority ||
					JSON.stringify(serverUser.work_roles) !==
						JSON.stringify((localUser as any)?.work_capacities) ||
					serverUser.tenant_kind !== (localUser as any)?.tenant_kind ||
					serverUser.full_name !== localUser?.full_name ||
					serverUser.email !== localUser?.email;

				if (hasSignificantChanges) {
					console.log(
						"= useClassroomRoleData: Syncing user data from server (Changes detected)",
					);
					setUser({ ...localUser, ...serverUser, id: userId } as any);
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
	}, [
		userId,
		schoolId,
		setUser,
		setRealClassCount,
		storeClassCount,
		localUser,
		localUser?.profile_completed,
		localUser?.school_id,
	]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, fetchRoleData: fetchData };
}
