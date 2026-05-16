import { type Context } from 'hono';
import { z } from 'zod';

/**
 * Profile Domain Handlers (Hono + ZenStack ReBAC)
 */
export const profileHandlers = {
  /**
   * Retrieve a user profile.
   * ReBAC: Everyone authenticated can read basic info.
   */
  getUserProfile: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const user = await db.user.findUnique({
      where: { id },
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

    if (!user) return c.json({ message: 'User not found' }, 404);
    return c.json(user, 200);
  },

  /**
   * Update a user profile.
   * ReBAC: Only the user themselves or a platform admin.
   */
  updateProfile: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();
    const body = await c.req.json();

    // ZenStack v3.6.4 will throw an error if the user tries to update someone else's profile
    const updated = await db.user.update({
      where: { id },
      data: body,
    });

    return c.json(updated, 200);
  },

  /**
   * Retrieve a journey snapshot for a user.
   * Aggregates rewards, growth, and moments.
   */
  getJourneySnapshot: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const [growthState, moments] = await Promise.all([
      db.userGrowthState.findUnique({ where: { user_id: id } }),
      db.whisperedMoment.findMany({ 
        where: { user_id: id },
        orderBy: { awarded_at: 'desc' },
        take: 5
      }),
    ]);

    return c.json({
      as_of: new Date().toISOString(),
      rewards: null, // Placeholder for future integration
      growth: growthState,
      whispered_moments: moments,
    }, 200);
  },

  /**
   * School Pulse Metrics (Aggregation Layer).
   */
  getSchoolPulse: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    // In a real implementation, this would perform a complex Kysely aggregation
    // For now, we return a mock pulse derived from the school context
    return c.json({
      resonance_score: 85,
      aggregated_mood: 'peace',
      trend: 'rising',
      participation_rate: 0.92,
      top_subjects: ['Mindfulness', 'Systems Thinking'],
      interaction_volume: 1250,
    }, 200);
  },
};
