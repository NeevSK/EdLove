import type { Context } from 'hono';
import { BondSchema } from '@repo/core/logic/schemas/identity.schema';

const mapToIdentityPayload = (user: any) => {
  const dbBonds = user.bonds || [];
  const availableBonds = dbBonds.map((b: any) => BondSchema.parse({
    id: b.id,
    user_id: b.user_id,
    entity_id: b.entity_id,
    entity_type: b.entity_type,
    capacity: b.capacity,
    status: b.status || 'active',
    metadata: b.metadata || {},
    created_at: b.created_at,
    updated_at: b.updated_at,
  }));

  const activeBond =
    availableBonds.find((b: any) => b.capacity === user.capacity) || availableBonds[0] || null;

  return {
    id: user.id,
    email: user.email ?? null,
    name: user.display_name || user.full_name || '',
    display_name: user.display_name || user.full_name || '',
    activeBond,
    availableBonds,
    onboarding_completed: !!user.onboarding_completed,
    schoolId: user.school_id || null,
    school_id: user.school_id || null,
  };
};

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

    if (!db || user.id === 'anonymous') {
      return c.json(
        {
          id: user.id,
          email: null,
          name: '',
          display_name: '',
          school_id: null,
          schoolId: null,
          onboarding_completed: false,
          onboarding_state: 'ARRIVAL',
          activeBond: null,
          availableBonds: [],
        },
        200,
      );
    }

    const identity = await db.user.findUnique({
      where: { id: user.id },
      include: {
        bonds: true,
      },
    });

    if (!identity) return c.json({ message: 'Identity not found' }, 404);
    return c.json(mapToIdentityPayload(identity), 200);
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
        bonds: true,
      },
    });

    if (!profile) return c.json({ message: 'Profile not found' }, 404);
    return c.json(mapToIdentityPayload(profile), 200);
  },

  /**
   * Get classroom capacity summary for a user.
   */
  getClassroomCapacitySummary: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();

    if (!db || id === 'anonymous') {
      return c.json(
        {
          user_id: id,
          school_id: null,
          profile_completed: false,
          onboarding_completed: false,
          onboarding_state: 'ARRIVAL',
          real_class_count: 0,
          profile: null,
        },
        200,
      );
    }

    const [user, classrooms] = await Promise.all([
      db.user.findUnique({ where: { id } }),
      db.classroom.findMany({
        where: { teacher_id: id },
        select: { id: true },
      }),
    ]);

    if (!user) return c.json({ message: 'User not found' }, 404);

    return c.json(
      {
        user_id: id,
        school_id: null, // To be determined by active bond
        profile_completed: !!user.full_name,
        onboarding_completed: user.onboarding_completed,
        onboarding_state: user.onboarding_state,
        real_class_count: classrooms.length,
        profile: user,
      },
      200,
    );
  },

  /**
   * Update a user profile.
   */
  updateProfile: async (c: Context) => {
    const db = c.get('db');
    const { id } = c.req.param();
    const body = await c.req.json();

    console.log('[updateProfile] id:', id, 'body:', body);
    if (body && 'email' in body && body.email === '') {
      body.email = null;
    }

    try {
      console.log('[updateProfile] calling db.user.update...');
      const updated = await db.user.update({
        where: { id },
        data: body,
        include: {
          bonds: true,
        },
      });
      console.log('[updateProfile] db.user.update succeeded');
      return c.json(mapToIdentityPayload(updated), 200);
    } catch (err) {
      console.error('[updateProfile] db.user.update error:', err);
      throw err;
    }
  },
};
