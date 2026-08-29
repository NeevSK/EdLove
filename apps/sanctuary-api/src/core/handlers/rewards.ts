import { rewardsORPCContract, type UserRewards, type UserRewardsHistory, type WhisperedMoment } from '@repo/core/api/rewards.orpc.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(rewardsORPCContract).$context<ORPCContext>();

function isAbortError(error: any): boolean {
  return !!(
    error &&
    (error.message?.includes('AbortError') ||
      error.message?.includes('Lock broken') ||
      error.details?.includes('AbortError') ||
      error.details?.includes('Lock broken'))
  );
}

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapRewards = (row: any): UserRewards => ({
  id: String(row.id),
  user_id: String(row.user_id),
  points: Number(row.points ?? 0),
  badges: Array.isArray(row.badges) ? row.badges : [],
  created_at: new Date(row.created_at).toISOString(),
  updated_at: new Date(row.updated_at).toISOString(),
});

const mapHistory = (row: any): UserRewardsHistory => ({
  id: String(row.id),
  user_id: String(row.user_id),
  operation: String(row.operation),
  recorded_at: new Date(row.recorded_at).toISOString(),
  recorded_by: row.recorded_by ? String(row.recorded_by) : null,
  snapshot: row.snapshot ?? null,
});

const mapWhisperedMoment = (row: any): WhisperedMoment => ({
  id: String(row.id),
  user_id: String(row.user_id),
  key: String(row.key),
  name: String(row.name),
  description: row.description ?? null,
  stage: String(row.stage),
  created_at: new Date(row.created_at).toISOString(),
});

export const rewardsRouter = impl.router({
  getRewards: impl.getRewards.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const userId = input.query.userId ?? context.user.id;
    try {
      const row = await context.db.userRewards.findUnique({
        where: { user_id: userId },
      });
      return row ? mapRewards(row) : null;
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during fetch:', error);
        return null;
      }
      throw error;
    }
  }),

  getRewardsHistory: impl.getRewardsHistory.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const userId = input.query.userId ?? context.user.id;
    const limit = input.query.limit ?? 50;
    try {
      const rows = await context.db.userRewardsVersions.findMany({
        where: { user_id: userId },
        orderBy: { recorded_at: 'desc' },
        take: limit,
      });
      return rows.map(mapHistory);
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during history fetch:', error);
        return [];
      }
      throw error;
    }
  }),

  getRewardsAsOf: impl.getRewardsAsOf.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const userId = input.query.userId ?? context.user.id;
    try {
      const row = await context.db.userRewardsVersions.findFirst({
        where: { user_id: userId, recorded_at: { lte: new Date(input.query.asOf) } },
        orderBy: { recorded_at: 'desc' },
      });
      return row ? (row.snapshot as unknown as UserRewards) : null;
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during as-of fetch:', error);
        return null;
      }
      throw error;
    }
  }),

  getRewardsRangeHistory: impl.getRewardsRangeHistory.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const userId = input.query.userId ?? context.user.id;
    try {
      const viewScale = input.query.viewScale ?? 'day';
      const viewDate = new Date(input.query.viewDate);
      let start: Date, end: Date;
      
      switch (viewScale) {
        case 'day':
          start = new Date(viewDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(viewDate);
          start.setDate(start.getDate() - start.getDay());
          start.setHours(0, 0, 0, 0);
          end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
          end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
          break;
        case 'year':
          start = new Date(viewDate.getFullYear(), 0, 1);
          end = new Date(viewDate.getFullYear() + 1, 0, 1);
          break;
        default:
          start = new Date(viewDate);
          start.setHours(0, 0, 0, 0);
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      }
      
      const rows = await context.db.userRewardsVersions.findMany({
        where: { user_id: userId, recorded_at: { gte: start, lte: end } },
        orderBy: { recorded_at: 'desc' },
      });
      return rows.map(mapHistory);
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during range history fetch:', error);
        return [];
      }
      throw error;
    }
  }),

  initializeRewards: impl.initializeRewards.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    try {
      const existing = await context.db.userRewards.findUnique({ where: { user_id: input.body.userId } });
      if (existing) return mapRewards(existing);
      
      const row = await context.db.userRewards.create({
        data: { user_id: input.body.userId, points: 0, badges: [] },
      });
      return mapRewards(row);
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during initialization:', error);
        return null;
      }
      throw error;
    }
  }),

  addPoints: impl.addPoints.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    try {
      const existing = await context.db.userRewards.findUnique({ where: { user_id: input.body.userId } });
      if (!existing) {
        const row = await context.db.userRewards.create({
          data: { user_id: input.body.userId, points: input.body.points, badges: [] },
        });
        return mapRewards(row);
      }
      const row = await context.db.userRewards.update({
        where: { user_id: input.body.userId },
        data: { points: (existing.points ?? 0) + input.body.points, updated_at: new Date() },
      });
      return mapRewards(row);
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during add points:', error);
        throw error;
      }
      throw error;
    }
  }),

  awardBadge: impl.awardBadge.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    try {
      const existing = await context.db.userRewards.findUnique({ where: { user_id: input.body.userId } });
      const currentBadges = existing?.badges ?? [];
      if (currentBadges.includes(input.body.badge)) return existing ? mapRewards(existing) : null;
      
      const updatedBadges = [...currentBadges, input.body.badge];
      if (!existing) {
        const row = await context.db.userRewards.create({
          data: { user_id: input.body.userId, points: 0, badges: updatedBadges },
        });
        return mapRewards(row);
      }
      const row = await context.db.userRewards.update({
        where: { user_id: input.body.userId },
        data: { badges: updatedBadges, updated_at: new Date() },
      });
      return mapRewards(row);
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during award badge:', error);
        throw error;
      }
      throw error;
    }
  }),

  checkAndAwardAchievements: impl.checkAndAwardAchievements.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    try {
      // Fetch feature usage
      const usage = await queryDatabaseRows<{ feature_name: string }>(
        'SELECT feature_name FROM feature_usage_log WHERE user_id = $1::uuid',
        [input.body.userId],
      );
      const features = usage.map((u) => u.feature_name);
      
      const existing = await context.db.userRewards.findUnique({ where: { user_id: input.body.userId } });
      const badges = existing?.badges ?? [];
      const newBadges: string[] = [];

      // Sanctuary Seeker: Visit all 4 main sections
      const mainSections = ['section_self', 'section_community', 'section_library', 'section_profile'];
      if (mainSections.every((s) => features.includes(s)) && !badges.includes('Sanctuary Seeker')) {
        newBadges.push('Sanctuary Seeker');
      }

      if (newBadges.length > 0) {
        const updatedBadges = [...badges, ...newBadges];
        const pointsToAdd = newBadges.length * 50;
        const row = existing
          ? await context.db.userRewards.update({
              where: { user_id: input.body.userId },
              data: { badges: updatedBadges, points: (existing.points ?? 0) + pointsToAdd, updated_at: new Date() },
            })
          : await context.db.userRewards.create({
              data: { user_id: input.body.userId, points: pointsToAdd, badges: updatedBadges },
            });
        return { updatedRewards: mapRewards(row), newAchievements: newBadges };
      }

      return { updatedRewards: existing ? mapRewards(existing) : null, newAchievements: [] };
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during check achievements:', error);
        return { updatedRewards: null, newAchievements: [] };
      }
      throw error;
    }
  }),

  getWhisperedMoments: impl.getWhisperedMoments.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const userId = input.query.userId ?? context.user.id;
    try {
      const rows = await context.db.whisperedMoment.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });
      return rows.map(mapWhisperedMoment);
    } catch (error) {
      if (isAbortError(error)) {
        console.warn('[Rewards Handler] Suppressing abort/lock-steal error during whispered moments fetch:', error);
        return [];
      }
      throw error;
    }
  }),
});