import { type Context } from 'hono';

/**
 * Identity Domain Handlers (Hono + ZenStack ReBAC)
 */
export const identityHandlers = {
  /**
   * Resolve the current authenticated identity.
   */
  resolveIdentity: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');

    const identity = await db.user.findUnique({
      where: { id: user.id },
      include: {
        bonds: {
          select: { capacity: true, entity_id: true, entity_type: true }
        }
      }
    });

    if (!identity) return c.json({ message: 'Identity not found' }, 404);
    return c.json(identity, 200);
  },

  /**
   * Get a user profile by ID.
   */
  getProfile: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const profile = await db.user.findUnique({
      where: { id },
      include: {
        bonds: {
          select: { capacity: true, entity_id: true, entity_type: true }
        }
      }
    });

    if (!profile) return c.json({ message: 'Profile not found' }, 404);
    return c.json(profile, 200);
  },

  /**
   * Get classroom capacity summary for a user.
   */
  getClassroomCapacitySummary: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    const [user, classrooms] = await Promise.all([
      db.user.findUnique({ where: { id } }),
      db.classroom.findMany({ 
        where: { teacher_id: id },
        select: { id: true }
      })
    ]);

    if (!user) return c.json({ message: 'User not found' }, 404);

    return c.json({
      user_id: id,
      school_id: null, // To be determined by active bond
      profile_completed: !!user.full_name,
      onboarding_completed: user.onboarding_completed,
      onboarding_state: user.onboarding_state,
      real_class_count: classrooms.length,
      profile: user,
    }, 200);
  },

  /**
   * Update a user profile.
   */
  updateProfile: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();
    const body = await c.req.json();

    const updated = await db.user.update({
      where: { id },
      data: body,
    });

    return c.json(updated, 200);
  },
};
