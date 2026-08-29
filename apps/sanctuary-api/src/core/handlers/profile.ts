import { profileORPCContract } from '@repo/core/api/profile.orpc.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(profileORPCContract).$context<ORPCContext>();
const mapSocialLink = (row: any) => ({
  id: String(row.id),
  user_id: String(row.user_id),
  platform: String(row.platform),
  url: String(row.url),
  is_public: Boolean(row.is_public),
  privacy_level: String(row.privacy_level ?? 'public'),
  order_index: Number(row.order_index ?? 0),
  created_at: new Date(row.created_at ?? Date.now()).toISOString(),
  updated_at: new Date(row.updated_at ?? row.created_at ?? Date.now()).toISOString(),
});

export const profileRouter = impl.router({
  getUserProfile: impl.getUserProfile
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);

      const user = await context.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          full_name: true,
          username: true,
          avatar_url: true,
          bio: true,
          citizenship: true,
          pricing_tier: true,
          experience_years: true,
          subjects_taught: true,
          qualifications: true,
          metadata: true,
        },
      });

      if (!user) {
        throw SovereignError.notFound('User');
      }

      return user;
    }),

  updateProfile: impl.updateProfile
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);

      // ZenStack will automatically enforce ReBAC permissions for updates
      const updated = await context.db.user.update({
        where: { id: input.id },
        data: input.body as any,
      });

      return updated;
    }),

  getJourneySnapshot: impl.getJourneySnapshot
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);

      const [growthState, moments] = await Promise.all([
        context.db.userGrowthState.findUnique({ where: { user_id: input.id } }),
        context.db.whisperedMoment.findMany({
          where: { user_id: input.id },
          orderBy: { awarded_at: 'desc' },
          take: 5,
        }),
      ]);

      return {
        as_of: new Date().toISOString(),
        rewards: null,
        growth: growthState,
        whispered_moments: moments as any,
      };
    }),

  getSchoolPulse: impl.getSchoolPulse
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      // In a real implementation, this performs Kysely queries against context.db
      return {
        resonance_score: 85,
        aggregated_mood: 'peace',
        trend: 'rising',
        participation_rate: 0.92,
        top_subjects: ['Mindfulness', 'Systems Thinking'],
        interaction_volume: 1250,
      };
    }),
  getSocialLinks: impl.getSocialLinks.use(doubleGateMiddleware).handler(async ({ context }) => {
    assertDatabase(context);
    const rows = await context.db.userSocialLink.findMany({
      where: { user_id: context.user.id },
      orderBy: { order_index: 'asc' },
    });
    return rows.map(mapSocialLink);
  }),
  upsertSocialLink: impl.upsertSocialLink
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const db = context.db as any;
      const existing = await db.userSocialLink.findFirst({
        where: { user_id: context.user.id, platform: input.platform },
      });
      const row = existing
        ? await db.userSocialLink.update({
            where: { id: existing.id },
            data: {
              url: input.url,
              is_public: input.is_public,
              privacy_level: input.privacy_level,
              order_index: input.order_index,
            },
          })
        : await db.userSocialLink.create({
            data: {
              user_id: context.user.id,
              platform: input.platform,
              url: input.url,
              is_public: input.is_public ?? true,
              privacy_level: input.privacy_level ?? 'public',
              order_index: input.order_index ?? 0,
            },
          });
      return mapSocialLink(row);
    }),
  deleteSocialLink: impl.deleteSocialLink
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      await (context.db as any).userSocialLink.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
