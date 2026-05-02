import { authAPI, identityAPI } from "@repo/core/api";
import { useRewards } from "@repo/core/hooks";
import {
	handleAPIError,
	useMutationQueue,
	useTemporalStore,
} from "@repo/core/logic";

import { useCallback, useEffect, useState } from "react";
import { profileAPI } from "../api/profile";
import { ProfileValidator } from "../lib/validator";
import type { UserProfile } from "../types";

export function useProfile(userId?: string) {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const { rewards, isLoading: isRewardsLoading } = useRewards({ userId });
	const addToQueue = useMutationQueue((state) => state.addToQueue);
	const viewDate = useTemporalStore((state) => state.viewDate);
	const phase = useTemporalStore((state) => state.phase);

	const fetchProfile = useCallback(async () => {
		try {
			setLoading(true);

			// If userId is provided, fetch that specific profile.
			// Otherwise, get the current authenticated user's ID and fetch their profile.
			const targetId = userId || (await identityAPI.getMyInternalId());
			if (!targetId) return;

			const data =
				phase === "past"
					? await profileAPI.getUserProfileAsOf(targetId, viewDate)
					: await profileAPI.getUserProfile(targetId);
			if (data) {
				// Determine authority based on capability or stored role string
				// Normalizing to lowercase/camelCase for RoleSchema SSOT
				const rawRole = data.role?.toLowerCase() || "student";

				setProfile({
					...data,
					authority: rawRole as any, // Temporary cast until UserProfile types are fully updated
					school_name: data.schools?.name || null,
				} as UserProfile);
			} else {
				setProfile(null);
			}
		} catch (error) {
			// Only log if it's not the HMR client error
			const errorMessage = (error as any)?.message;
			if (errorMessage !== "Expected HMRClient.setup() call at startup.") {
				handleAPIError(error);
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [phase, userId, viewDate]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	const refresh = useCallback(() => {
		setRefreshing(true);
		return fetchProfile();
	}, [fetchProfile]);

	/**
	 * Update a profile field with validation and offline-first optimistic persistence
	 */
	const updateField = async (field: keyof UserProfile, value: any) => {
		if (!profile) return { success: false };

		// 1. Pre-emptive Validation
		const validation = ProfileValidator.validate(String(field), value);
		if (!validation.isValid) {
			return { success: false, error: validation.error };
		}

		// 2. Optimistic Update (Instant UX)
		// We no longer backup for reversion because we are Offline-First.
		// User intent is preserved regardless of immediate network success.
		setProfile((prev) => (prev ? { ...prev, [field]: value } : null));

		// 3. Persistent Outbox (Sync Queue)
		// We add to queue first to ensure durability.
		addToQueue({
			type: "UPDATE",
			scope: "profile",
			name: "updateProfileField",
			variables: { id: profile.id, [field]: value },
		});

		try {
			// 4. Persistence (Attempt immediate sync)
			await profileAPI.updateProfile(profile.id, { [field]: value });
			return { success: true };
		} catch (_error) {
			// 5. No Reversion!
			// Change stays in local state and persistent queue for retry.
			// We only notify the user that sync is pending or failed.
			console.log("\u2261\u0192\u00F6\u00E4 Sync pending for:", field);
			return { success: true, pending: true };
		}
	};

	const logout = useCallback(async () => {
		await authAPI.signOut();
	}, []);

	const uploadAvatar = useCallback(
		async (localUri: string) => {
			if (!profile?.id) {
				return { success: false };
			}

			try {
				const updatedProfile = await profileAPI.uploadAvatar(
					profile.id,
					localUri,
				);
				setProfile((prev) =>
					prev ? ({ ...prev, ...updatedProfile } as UserProfile) : prev,
				);
				return { success: true, data: updatedProfile };
			} catch (error) {
				handleAPIError(error);
				return { success: false, error };
			}
		},
		[profile?.id],
	);

	return {
		profile,
		loading: loading || isRewardsLoading,
		refreshing,
		refresh,
		logout,
		uploadAvatar,
		rewards,
		updateField,
	};
}
