import type { User as ZenStackUser } from '@repo/schema/contracts';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type {
  CommunityProfile,
  ProfileHistoryEntry,
  ProfileJourneyEvent,
  ProfileJourneyReadOptions,
  ProfileJourneySnapshot,
  ProfileRepository,
  ProfileTemporalReadOptions,
  PulseMetrics,
  UserGrowthState,
  UserPreferences,
  UserRewardsSnapshot,
  WhisperedMomentSnapshot,
} from '@repo/core/logic/domains/profile/ports';
import type { IFileStoragePort } from '@repo/core/logic/ports/storage.port';
import { getTemporalRange } from '@repo/core/logic/utils/temporalUtils';
import type { SocialLink, User } from '@repo/core/types';
import { APIError } from '@repo/core/types';

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
    start: previousStart,
    end: previousEnd,
  };
};

type AuthUserResolver = () => { id: string | null };

const normalizeUser = (record: ZenStackUser | null | undefined): User | null => {
  if (!record) return null;
  const user = record as any;
  return {
    ...user,
    id: user.id,
    email: user.email ?? '',
    full_name: user.full_name ?? '',
    // ReBAC Bonds now carry the canonical capacity context
    school_id: user.school_id ?? null,
    profile_completed: !!user.profile_completed,
    onboarding_completed: !!user.onboarding_completed,
    created_at:
      user.created_at instanceof Date
        ? user.created_at.toISOString()
        : (user.created_at as unknown as string) || new Date().toISOString(),
    updated_at:
      user.updated_at instanceof Date
        ? user.updated_at.toISOString()
        : (user.updated_at as unknown as string) || new Date().toISOString(),
    onboarding_completed_at:
      user.onboarding_completed_at instanceof Date
        ? user.onboarding_completed_at.toISOString()
        : (user.onboarding_completed_at as unknown as string),
  } as unknown as User;
};

const normalizeTemporalScale = (viewScale?: ProfileTemporalReadOptions['viewScale']) =>
  viewScale === 'custom' ? 'day' : (viewScale ?? 'day');

const mapWhisperedMoments = (
  rows: Record<string, unknown>[] | null | undefined,
): WhisperedMomentSnapshot[] =>
  (rows || []).map((row) => ({
    key: row.moment_key as string,
    name_en: (row.moment_name_en as string) || (row.moment_key as string),
    name_si: (row.moment_name_si as string) || (row.moment_key as string),
    awarded_at: row.awarded_at as string,
  }));

const mapSocialLink = (record: Record<string, unknown> | null | undefined): SocialLink => {
  if (!record) return record as unknown as SocialLink;
  const createdAt = record.created_at;
  const updatedAt = record.updated_at;
  return {
    ...record,
    created_at: createdAt instanceof Date ? createdAt.toISOString() : (createdAt as string),
    updated_at: updatedAt instanceof Date ? updatedAt.toISOString() : (updatedAt as string),
  } as SocialLink;
};

export const createZenStackProfileRepository = (
  getAuthUser: AuthUserResolver,
  storage: IFileStoragePort,
): ProfileRepository => {
  const getDb = async () => {
    const { createZenStackDb } = await import('@repo/database');
    const authUser = getAuthUser();
    if (!authUser.id) {
      throw new APIError('Authentication required for ZenStack profile access', 'UNAUTHORIZED');
    }
    return createZenStackDb({
      id: authUser.id,
      // ReBAC-enabled database client initialization
    }) as any;
  };

  return {
    async getUserProfile(userId) {
      const db = await getDb();
      return normalizeUser(
        await db.user.findFirst({ where: { id: userId }, include: { bonds: true } }),
      );
    },
    async getUserProfileAsOf(userId, asOf) {
      const { data, error } = await supabaseClient
        .from('user_profile_versions')
        .select('snapshot')
        .eq('user_id', userId)
        .lte('recorded_at', asOf)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new APIError('Failed to fetch historical user profile', error.code, error);
      if (!data?.snapshot) return null;
      return normalizeUser(data.snapshot as any);
    },
    async getUserProfileHistory(userId, limit = 20) {
      const { data, error } = await supabaseClient
        .from('user_profile_versions')
        .select('id, operation, recorded_at, recorded_by, snapshot')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw new APIError('Failed to fetch user profile history', error.code, error);
      return (data || []) as ProfileHistoryEntry[];
    },
    async getJourneySnapshot(
      userId,
      options: ProfileJourneyReadOptions = {},
    ): Promise<ProfileJourneySnapshot> {
      const asOf = options.asOf ?? options.viewDate ?? null;
      const viewScale = normalizeTemporalScale(options.viewScale);

      if (asOf) {
        const { data: rewardsVersion, error: rewardsError } =
          await supabaseClient
            .from('user_rewards_versions')
            .select('snapshot')
            .eq('user_id', userId)
            .lte('recorded_at', asOf)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (rewardsError)
          throw new APIError(
            'Failed to fetch historical rewards snapshot',
            rewardsError.code,
            rewardsError,
          );

        const { data: growthVersion, error: growthError } =
          await supabaseClient
            .from('user_growth_state_versions')
            .select('snapshot')
            .eq('user_id', userId)
            .lte('recorded_at', asOf)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (growthError)
          throw new APIError(
            'Failed to fetch historical growth snapshot',
            growthError.code,
            growthError,
          );

        let whisperedQuery = supabaseClient
          .from('whispered_moments')
          .select('moment_key, moment_name_en, moment_name_si, awarded_at')
          .eq('user_id', userId);

        if (options.viewDate) {
          const { end } = getTemporalRange(options.viewDate, viewScale);
          whisperedQuery = whisperedQuery.lte('awarded_at', end);
        } else {
          whisperedQuery = whisperedQuery.lte('awarded_at', asOf);
        }

        const { data: whisperedRows, error: whisperedError } = await whisperedQuery.order(
          'awarded_at',
          { ascending: false },
        );
        if (whisperedError)
          throw new APIError(
            'Failed to fetch whispered moments snapshot',
            whisperedError.code,
            whisperedError,
          );

        return {
          as_of: asOf,
          rewards: (rewardsVersion?.snapshot as unknown as UserRewardsSnapshot) ?? null,
          growth: (growthVersion?.snapshot as unknown as UserGrowthState) ?? null,
          whispered_moments: mapWhisperedMoments(
            whisperedRows as unknown as Record<string, unknown>[],
          ),
        };
      }

      const [
        { data: rewards, error: rewardsError },
        { data: growth, error: growthError },
        { data: whisperedRows, error: whisperedError },
      ] = await Promise.all([
        supabaseClient
          .from('user_rewards')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabaseClient
          .from('user_growth_state')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabaseClient
          .from('whispered_moments')
          .select('moment_key, moment_name_en, moment_name_si, awarded_at')
          .eq('user_id', userId)
          .order('awarded_at', { ascending: false }),
      ]);

      if (rewardsError)
        throw new APIError('Failed to fetch rewards snapshot', rewardsError.code, rewardsError);
      if (growthError)
        throw new APIError('Failed to fetch growth snapshot', growthError.code, growthError);
      if (whisperedError)
        throw new APIError(
          'Failed to fetch whispered moments snapshot',
          whisperedError.code,
          whisperedError,
        );

      return {
        as_of: null,
        rewards: (rewards as unknown as UserRewardsSnapshot) ?? null,
        growth: (growth as unknown as UserGrowthState) ?? null,
        whispered_moments: mapWhisperedMoments(
          whisperedRows as unknown as Record<string, unknown>[],
        ),
      };
    },
    async getJourneyHistory(userId, options = {}): Promise<ProfileJourneyEvent[]> {
      const viewDate = options.viewDate ?? new Date().toISOString();
      const viewScale = normalizeTemporalScale(options.viewScale);
      const limit = options.limit ?? 50;
      const { start, end } = getTemporalRange(viewDate, viewScale);

      const [
        { data: rewardRows, error: rewardError },
        { data: growthRows, error: growthError },
        { data: momentRows, error: momentError },
      ] = await Promise.all([
        supabaseClient
          .from('user_rewards_versions')
          .select('id, operation, recorded_at, snapshot')
          .eq('user_id', userId)
          .gte('recorded_at', start)
          .lte('recorded_at', end)
          .order('recorded_at', { ascending: false })
          .limit(limit),
        supabaseClient
          .from('user_growth_state_versions')
          .select('id, operation, recorded_at, snapshot')
          .eq('user_id', userId)
          .gte('recorded_at', start)
          .lte('recorded_at', end)
          .order('recorded_at', { ascending: false })
          .limit(limit),
        supabaseClient
          .from('whispered_moments')
          .select('id, moment_key, moment_name_en, moment_name_si, awarded_at')
          .eq('user_id', userId)
          .gte('awarded_at', start)
          .lte('awarded_at', end)
          .order('awarded_at', { ascending: false })
          .limit(limit),
      ]);

      if (rewardError)
        throw new APIError('Failed to fetch rewards history', rewardError.code, rewardError);
      if (growthError)
        throw new APIError('Failed to fetch growth history', growthError.code, growthError);
      if (momentError)
        throw new APIError(
          'Failed to fetch whispered moments history',
          momentError.code,
          momentError,
        );

      const rewardEvents: ProfileJourneyEvent[] = (rewardRows || []).map((row) => ({
        id: row.id,
        timestamp: row.recorded_at,
        source: 'reward',
        operation: row.operation,
        title: `Rewards ${row.operation}`,
        snapshot: row.snapshot ?? undefined,
        metadata: {
          points: ((row.snapshot as Record<string, unknown>)?.points as number) ?? 0,
          badges: Array.isArray((row.snapshot as Record<string, unknown>)?.badges)
            ? ((row.snapshot as Record<string, unknown>).badges as string[])
            : [],
        },
      }));

      const growthEvents: ProfileJourneyEvent[] = (growthRows || []).map((row) => ({
        id: row.id,
        timestamp: row.recorded_at,
        source: 'growth',
        operation: row.operation,
        title: `Growth state ${row.operation}`,
        snapshot: row.snapshot ?? undefined,
        metadata: {
          bhumi_stage: (row.snapshot as Record<string, unknown>)?.bhumi_stage,
          banyan_stage: (row.snapshot as Record<string, unknown>)?.banyan_stage,
          river_stage: (row.snapshot as Record<string, unknown>)?.river_stage,
          crystal_tier: (row.snapshot as Record<string, unknown>)?.crystal_tier,
        },
      }));

      const momentEvents: ProfileJourneyEvent[] = (momentRows || []).map((row) => ({
        id: row.id as string,
        timestamp: row.awarded_at as string,
        source: 'moment',
        title: (row.moment_name_en as string) || (row.moment_key as string),
        metadata: {
          key: row.moment_key,
          name_en: row.moment_name_en,
          name_si: row.moment_name_si,
        },
      }));

      return [...rewardEvents, ...growthEvents, ...momentEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    async updateUserProfile(userId, updates) {
      const db = await getDb();
      const updated = await db.user.update({
        where: { id: userId },
        data: updates,
      });
      const normalized = normalizeUser(updated);
      if (!normalized)
        throw new APIError('Failed to normalize updated user profile', 'INTERNAL_ERROR');
      return normalized;
    },
    async getAnonymousFlag(userId) {
      const db = await getDb();
      const user = await db.user.findFirst({
        where: { id: userId },
        select: { is_anonymous: true },
      });
      return user?.is_anonymous ?? false;
    },
    async uploadAvatarAsset(localUri) {
      return storage.upload(localUri, { resourceType: 'image' });
    },

    async getSocialLinks(userId) {
      const db = await getDb();
      const records = await db.userSocialLink.findMany({
        where: { user_id: userId },
        orderBy: { order_index: 'asc' },
      });
      return records.map(mapSocialLink);
    },
    async upsertSocialLink(link) {
      const db = await getDb();
      let record: Record<string, unknown>;
      if (link.id) {
        record = await db.userSocialLink.update({
          where: { id: link.id },
          data: link as any,
        });
      } else {
        if (!link.user_id) {
          throw new APIError('user_id is required for social link creation', 'BAD_REQUEST');
        }
        record = await db.userSocialLink.create({
          data: link as any,
        });
      }
      return mapSocialLink(record);
    },
    async deleteSocialLink(linkId) {
      const db = await getDb();
      await db.userSocialLink.delete({ where: { id: linkId } });
    },
    async updateSocialLinksOrder(links) {
      const db = await getDb();
      await Promise.all(
        links.map((link) =>
          db.userSocialLink.update({
            where: { id: link.id },
            data: { order_index: link.order_index },
          }),
        ),
      );
    },
    async getUserPreferences(userId) {
      const { data, error } = await supabaseClient
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw new APIError('Failed to fetch user preferences', error.code, error);
      return (data as UserPreferences | null) ?? null;
    },
    async updateUserPreferences(userId, updates) {
      const { data, error } = await supabaseClient
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new APIError('Failed to update user preferences', error.code, error);
      return data as UserPreferences;
    },

    async getCommunityProfile(communityId) {
      const db = await getDb();
      const group = await db.group.findFirst({
        where: { id: communityId },
        select: {
          id: true,
          name: true,
          description: true,
          visibility: true,
          creator_id: true,
        },
      });
      return (group as CommunityProfile | null) ?? null;
    },
    async getCommunityProfileAsOf(communityId, asOf) {
      const { data, error } = await supabaseClient
        .from('community_profile_versions')
        .select('snapshot')
        .eq('community_id', communityId)
        .lte('recorded_at', asOf)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error)
        throw new APIError('Failed to fetch historical community profile', error.code, error);
      return (data?.snapshot as CommunityProfile | undefined) ?? null;
    },
    async getCommunityProfileHistory(communityId, limit = 20) {
      const { data, error } = await supabaseClient
        .from('community_profile_versions')
        .select('id, operation, recorded_at, recorded_by, snapshot')
        .eq('community_id', communityId)
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw new APIError('Failed to fetch community profile history', error.code, error);
      return (data || []) as ProfileHistoryEntry<CommunityProfile>[];
    },
    async updateCommunityProfile(communityId, field, value) {
      const db = await getDb();
      return (await db.group.update({
        where: { id: communityId },
        data: { [field]: value },
      })) as CommunityProfile;
    },

    async getSchoolPulse(schoolId, options: ProfileTemporalReadOptions) {
      const db = await getDb();
      const { viewDate, viewScale = 'day' } = options;
      const { start: periodStart, end: periodEnd } = getTemporalRange(
        viewDate,
        viewScale === 'custom' ? 'day' : viewScale,
      );
      const { start: previousStart, end: previousEnd } = getPreviousRange(periodStart, periodEnd);

      const [postsThisPeriod, postsPreviousPeriod, libraryActivity, groups, classrooms] =
        await Promise.all([
          db.post.findMany({
            where: {
              school_id: schoolId,
              created_at: {
                gte: periodStart as unknown as Date,
                lte: periodEnd as unknown as Date,
              },
            },
            select: { id: true },
          }),
          db.post.findMany({
            where: {
              school_id: schoolId,
              created_at: {
                gte: previousStart as unknown as Date,
                lte: previousEnd as unknown as Date,
              },
            },
            select: { id: true },
          }),
          db.libraryResource.findMany({
            where: {
              creator_id: { not: undefined },
              created_at: {
                gte: new Date(periodStart),
                lte: new Date(periodEnd),
              },
            },
            select: { id: true },
          }),
          db.group.findMany({
            where: { school_id: schoolId },
            select: { id: true },
          }),
          db.classroom.findMany({
            where: { school_id: schoolId },
            select: { id: true },
          }),
        ]);

      const totalVolume = postsThisPeriod.length + libraryActivity.length;
      const communityVolume = totalVolume + groups.length;
      const currentPosts = postsThisPeriod.length;
      const previousPosts = postsPreviousPeriod.length;

      return {
        resonance_score: Math.min(
          100,
          Math.round((communityVolume / RESONANCE_ACTIVITY_ANCHOR) * 100),
        ),
        aggregated_mood: 'unknown',
        trend:
          previousPosts === 0
            ? currentPosts > 0
              ? 'rising'
              : 'stable'
            : currentPosts > previousPosts * RISING_THRESHOLD
              ? 'rising'
              : currentPosts < previousPosts * FAILING_THRESHOLD
                ? 'failing'
                : 'stable',
        participation_rate: classrooms.length
          ? Math.min(
              100,
              Math.round((communityVolume / classrooms.length) * PARTICIPATION_SCALE_FACTOR),
            )
          : 0,
        top_subjects: [],
        interaction_volume: communityVolume,
      } as PulseMetrics;
    },
  };
};

export const isZenStackProfileRepositoryAvailable = () => Boolean(process.env.DATABASE_URL);
