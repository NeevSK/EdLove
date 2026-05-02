import { supabase } from "@repo/core/api";
import { getTemporalRange, uploadToCloudinary } from "@repo/core/logic";
import type { SocialLink } from "@repo/core/types";

import { APIError } from "@repo/core/types";

import type {
	CommunityProfile,
	ProfileHistoryEntry,
	ProfileJourneyEvent,
	ProfileJourneyReadOptions,
	ProfileJourneySnapshot,
	ProfileRepository,
	ProfileTemporalReadOptions,
	PulseMetrics,
	WhisperedMomentSnapshot,
} from "../../domains/profile/ports";

const RISING_THRESHOLD = 1.2;
const FAILING_THRESHOLD = 0.5;
const RESONANCE_ACTIVITY_ANCHOR = 50;
const PARTICIPATION_SCALE_FACTOR = 10;

const getPreviousRange = (start: string, end: string) => {
	const startMs = new Date(start).getTime();
	const endMs = new Date(end).getTime();
	const durationMs = Math.max(endMs - startMs, 0);
	const previousEnd = new Date(startMs - 1);
	const previousStart = new Date(previousEnd.getTime() - durationMs);

	return {
		start: previousStart.toISOString(),
		end: previousEnd.toISOString(),
	};
};

const normalizeTemporalScale = (
	viewScale?: ProfileTemporalReadOptions["viewScale"],
) => (viewScale === "custom" ? "day" : (viewScale ?? "day"));

const mapWhisperedMoments = (
	rows: any[] | null | undefined,
): WhisperedMomentSnapshot[] =>
	(rows || []).map((row) => ({
		key: row.moment_key as string,
		name_en: (row.moment_name_en as string) ?? (row.moment_key as string),
		name_si: (row.moment_name_si as string) ?? (row.moment_key as string),
		awarded_at: row.awarded_at as string,
	}));

export const createSupabaseProfileRepository = (): ProfileRepository => ({
	async getUserProfile(userId) {
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", userId)
			.maybeSingle();
		if (error)
			throw new APIError("Failed to fetch user profile", error.code, error);
		return data;
	},
	async getUserProfileAsOf(userId, asOf) {
		const { data, error } = await supabase
			.from("user_profile_versions")
			.select("snapshot")
			.eq("user_id", userId)
			.lte("recorded_at", asOf)
			.order("recorded_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error)
			throw new APIError(
				"Failed to fetch historical user profile",
				error.code,
				error,
			);
		return (data?.snapshot as Record<string, any> | undefined) ?? null;
	},
	async getUserProfileHistory(userId, limit = 20) {
		const { data, error } = await supabase
			.from("user_profile_versions")
			.select("id, operation, recorded_at, recorded_by, snapshot")
			.eq("user_id", userId)
			.order("recorded_at", { ascending: false })
			.limit(limit);
		if (error)
			throw new APIError(
				"Failed to fetch user profile history",
				error.code,
				error,
			);
		return (data || []) as ProfileHistoryEntry[];
	},
	async getJourneySnapshot(
		userId,
		options: ProfileJourneyReadOptions = {},
	): Promise<ProfileJourneySnapshot> {
		const asOf = options.asOf ?? options.viewDate ?? null;
		const viewScale = normalizeTemporalScale(options.viewScale);

		if (asOf) {
			const { data: rewardsVersion, error: rewardsError } = await supabase
				.from("user_rewards_versions")
				.select("snapshot")
				.eq("user_id", userId)
				.lte("recorded_at", asOf)
				.order("recorded_at", { ascending: false })
				.limit(1)
				.maybeSingle();
			if (rewardsError)
				throw new APIError(
					"Failed to fetch historical rewards snapshot",
					rewardsError.code,
					rewardsError,
				);

			const { data: growthVersion, error: growthError } = await supabase
				.from("user_growth_state_versions")
				.select("snapshot")
				.eq("user_id", userId)
				.lte("recorded_at", asOf)
				.order("recorded_at", { ascending: false })
				.limit(1)
				.maybeSingle();
			if (growthError)
				throw new APIError(
					"Failed to fetch historical growth snapshot",
					growthError.code,
					growthError,
				);

			let whisperedQuery = supabase
				.from("whispered_moments")
				.select("moment_key, moment_name_en, moment_name_si, awarded_at")
				.eq("user_id", userId);

			if (options.viewDate) {
				const { end } = getTemporalRange(options.viewDate, viewScale);
				whisperedQuery = whisperedQuery.lte("awarded_at", end);
			} else {
				whisperedQuery = whisperedQuery.lte("awarded_at", asOf);
			}

			const { data: whisperedRows, error: whisperedError } =
				await whisperedQuery.order("awarded_at", { ascending: false });
			if (whisperedError)
				throw new APIError(
					"Failed to fetch whispered moments snapshot",
					whisperedError.code,
					whisperedError,
				);

			return {
				as_of: asOf,
				rewards: (rewardsVersion?.snapshot as any) ?? null,
				growth: (growthVersion?.snapshot as any) ?? null,
				whispered_moments: mapWhisperedMoments(whisperedRows),
			};
		}

		const [
			{ data: rewards, error: rewardsError },
			{ data: growth, error: growthError },
			{ data: whisperedRows, error: whisperedError },
		] = await Promise.all([
			supabase
				.from("user_rewards")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle(),
			supabase
				.from("user_growth_state")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle(),
			supabase
				.from("whispered_moments")
				.select("moment_key, moment_name_en, moment_name_si, awarded_at")
				.eq("user_id", userId)
				.order("awarded_at", { ascending: false }),
		]);

		if (rewardsError)
			throw new APIError(
				"Failed to fetch rewards snapshot",
				rewardsError.code,
				rewardsError,
			);
		if (growthError)
			throw new APIError(
				"Failed to fetch growth snapshot",
				growthError.code,
				growthError,
			);
		if (whisperedError)
			throw new APIError(
				"Failed to fetch whispered moments snapshot",
				whisperedError.code,
				whisperedError,
			);

		return {
			as_of: null,
			rewards: (rewards as any) ?? null,
			growth: (growth as any) ?? null,
			whispered_moments: mapWhisperedMoments(whisperedRows),
		};
	},
	async getJourneyHistory(
		userId,
		options = {},
	): Promise<ProfileJourneyEvent[]> {
		const viewDate = options.viewDate ?? new Date().toISOString();
		const viewScale = normalizeTemporalScale(options.viewScale);
		const limit = options.limit ?? 50;
		const { start, end } = getTemporalRange(viewDate, viewScale);

		const [
			{ data: rewardRows, error: rewardError },
			{ data: growthRows, error: growthError },
			{ data: momentRows, error: momentError },
		] = await Promise.all([
			supabase
				.from("user_rewards_versions")
				.select("id, operation, recorded_at, snapshot")
				.eq("user_id", userId)
				.gte("recorded_at", start)
				.lte("recorded_at", end)
				.order("recorded_at", { ascending: false })
				.limit(limit),
			supabase
				.from("user_growth_state_versions")
				.select("id, operation, recorded_at, snapshot")
				.eq("user_id", userId)
				.gte("recorded_at", start)
				.lte("recorded_at", end)
				.order("recorded_at", { ascending: false })
				.limit(limit),
			supabase
				.from("whispered_moments")
				.select("id, moment_key, moment_name_en, moment_name_si, awarded_at")
				.eq("user_id", userId)
				.gte("awarded_at", start)
				.lte("awarded_at", end)
				.order("awarded_at", { ascending: false })
				.limit(limit),
		]);

		if (rewardError)
			throw new APIError(
				"Failed to fetch rewards history",
				rewardError.code,
				rewardError,
			);
		if (growthError)
			throw new APIError(
				"Failed to fetch growth history",
				growthError.code,
				growthError,
			);
		if (momentError)
			throw new APIError(
				"Failed to fetch whispered moments history",
				momentError.code,
				momentError,
			);

		const rewardEvents: ProfileJourneyEvent[] = (rewardRows || []).map(
			(row: any) => ({
				id: row.id,
				timestamp: row.recorded_at,
				source: "reward",
				operation: row.operation,
				title: `Rewards ${row.operation}`,
				snapshot: row.snapshot ?? undefined,
				metadata: {
					points: row.snapshot?.points ?? 0,
					badges: Array.isArray(row.snapshot?.badges)
						? row.snapshot.badges
						: [],
				},
			}),
		);

		const growthEvents: ProfileJourneyEvent[] = (growthRows || []).map(
			(row: any) => ({
				id: row.id,
				timestamp: row.recorded_at,
				source: "growth",
				operation: row.operation,
				title: `Growth state ${row.operation}`,
				snapshot: row.snapshot ?? undefined,
				metadata: {
					bhumi_stage: row.snapshot?.bhumi_stage,
					banyan_stage: row.snapshot?.banyan_stage,
					river_stage: row.snapshot?.river_stage,
					crystal_tier: row.snapshot?.crystal_tier,
				},
			}),
		);

		const momentEvents: ProfileJourneyEvent[] = (momentRows || []).map(
			(row: any) => ({
				id: row.id,
				timestamp: row.awarded_at,
				source: "moment",
				title: row.moment_name_en || row.moment_key,
				metadata: {
					key: row.moment_key,
					name_en: row.moment_name_en,
					name_si: row.moment_name_si,
				},
			}),
		);

		return [...rewardEvents, ...growthEvents, ...momentEvents]
			.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			)
			.slice(0, limit);
	},
	async updateUserProfile(userId, updates) {
		const { data, error } = await supabase
			.from("users")
			.update(updates)
			.eq("id", userId)
			.select()
			.single();
		if (error)
			throw new APIError("Failed to update profile", error.code, error);
		return data;
	},
	async getAnonymousFlag(userId) {
		const { data, error } = await supabase
			.from("users")
			.select("is_anonymous")
			.eq("id", userId)
			.single();
		if (error)
			throw new APIError("Failed to check anonymous status", error.code, error);
		return data?.is_anonymous ?? false;
	},
	async uploadAvatarAsset(localUri) {
		try {
			return await uploadToCloudinary(localUri, "image");
		} catch (error: any) {
			throw new APIError("Failed to upload avatar", error?.code, error);
		}
	},

	async getSocialLinks(userId) {
		const { data, error } = await supabase
			.from("user_social_links")
			.select("*")
			.eq("user_id", userId)
			.order("order_index", { ascending: true });
		if (error)
			throw new APIError("Failed to fetch social links", error.code, error);
		return (data || []) as SocialLink[];
	},
	async upsertSocialLink(link) {
		const { data, error } = await supabase
			.from("user_social_links")
			.upsert(link)
			.select()
			.single();
		if (error)
			throw new APIError("Failed to upsert social link", error.code, error);
		return data as SocialLink;
	},
	async deleteSocialLink(linkId) {
		const { error } = await supabase
			.from("user_social_links")
			.delete()
			.eq("id", linkId);
		if (error)
			throw new APIError("Failed to delete social link", error.code, error);
	},
	async updateSocialLinksOrder(links) {
		const { error } = await supabase.from("user_social_links").upsert(links);
		if (error)
			throw new APIError(
				"Failed to update social links order",
				error.code,
				error,
			);
	},

	async getCommunityProfile(communityId) {
		const { data, error } = await supabase
			.from("community_groups")
			.select("id, name, description, visibility, creator_id")
			.eq("id", communityId)
			.maybeSingle();
		if (error)
			throw new APIError(
				"Failed to fetch community profile",
				error.code,
				error,
			);
		return (data as CommunityProfile | null) ?? null;
	},
	async getCommunityProfileAsOf(communityId, asOf) {
		const { data, error } = await supabase
			.from("community_profile_versions")
			.select("snapshot")
			.eq("community_id", communityId)
			.lte("recorded_at", asOf)
			.order("recorded_at", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (error)
			throw new APIError(
				"Failed to fetch historical community profile",
				error.code,
				error,
			);
		return (data?.snapshot as CommunityProfile | undefined) ?? null;
	},
	async getCommunityProfileHistory(communityId, limit = 20) {
		const { data, error } = await supabase
			.from("community_profile_versions")
			.select("id, operation, recorded_at, recorded_by, snapshot")
			.eq("community_id", communityId)
			.order("recorded_at", { ascending: false })
			.limit(limit);
		if (error)
			throw new APIError(
				"Failed to fetch community profile history",
				error.code,
				error,
			);
		return (data || []) as ProfileHistoryEntry<CommunityProfile>[];
	},
	async updateCommunityProfile(communityId, field, value) {
		const { data, error } = await supabase
			.from("community_groups")
			.update({ [field]: value, updated_at: new Date().toISOString() })
			.eq("id", communityId)
			.select("id, name, description, visibility, creator_id")
			.single();
		if (error)
			throw new APIError(
				"Failed to update community profile",
				error.code,
				error,
			);
		return data as CommunityProfile;
	},

	async getSchoolPulse(schoolId, options: ProfileTemporalReadOptions) {
		const { viewDate, viewScale = "day" } = options;
		const { start: periodStart, end: periodEnd } = getTemporalRange(
			viewDate,
			viewScale === "custom" ? "day" : viewScale,
		);
		const { start: previousStart, end: previousEnd } = getPreviousRange(
			periodStart,
			periodEnd,
		);

		const [
			{ count: postsThisPeriod },
			{ count: postsPreviousPeriod },
			{ count: libraryActivity },
			{ count: groupCount },
			{ count: classroomCount },
		] = await Promise.all([
			supabase
				.from("community_posts")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId)
				.gte("created_at", periodStart)
				.lte("created_at", periodEnd),
			supabase
				.from("community_posts")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId)
				.gte("created_at", previousStart)
				.lte("created_at", previousEnd),
			supabase
				.from("library_items")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId)
				.gte("created_at", periodStart)
				.lte("created_at", periodEnd),
			supabase
				.from("community_groups")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId),
			supabase
				.from("classrooms")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId),
		]);

		const totalVolume = (postsThisPeriod ?? 0) + (libraryActivity ?? 0);
		const communityVolume = totalVolume + (groupCount ?? 0);
		const currentPosts = postsThisPeriod ?? 0;
		const previousPosts = postsPreviousPeriod ?? 0;

		return {
			resonance_score: Math.min(
				100,
				Math.round((communityVolume / RESONANCE_ACTIVITY_ANCHOR) * 100),
			),
			aggregated_mood: "unknown",
			trend:
				previousPosts === 0
					? currentPosts > 0
						? "rising"
						: "stable"
					: currentPosts > previousPosts * RISING_THRESHOLD
						? "rising"
						: currentPosts < previousPosts * FAILING_THRESHOLD
							? "failing"
							: "stable",
			participation_rate: classroomCount
				? Math.min(
						100,
						Math.round(
							(communityVolume / classroomCount) * PARTICIPATION_SCALE_FACTOR,
						),
					)
				: 0,
			top_subjects: [],
			interaction_volume: communityVolume,
		} as PulseMetrics;
	},
});
