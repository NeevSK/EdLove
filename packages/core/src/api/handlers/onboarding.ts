import type { Context } from 'hono';
import { z } from 'zod';

const createInitialBondSchema = z.object({
  orientation: z.string().min(1),
  context: z.object({
    displayName: z.string().trim().min(1),
    fullName: z.string().trim().min(1).optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    username: z.string().trim().min(1).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

const completeOnboardingSchema = z.object({
  userId: z.string().min(1),
});

export const onboardingHandlers = {
  createInitialBond: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');

    if (!user || user.id === 'anonymous') {
      return c.json({ message: 'Authentication required' }, 401);
    }

    try {
      const body = createInitialBondSchema.parse(await c.req.json());
      const { orientation, context } = body;
      const userId = user.id;

      const profile = await db.user.findUnique({ where: { id: userId } });
      if (!profile) return c.json({ message: 'User not found' }, 404);

      const isSupabaseAnonymous = profile.is_anonymous === true;
      // Citizenship is registration/verification state. School membership is
      // a separate bond relationship and is added after personal onboarding.
      const citizenship: 'THIRD_CLASS' | 'SECOND_CLASS' = isSupabaseAnonymous
        ? 'THIRD_CLASS'
        : 'SECOND_CLASS';

      let username =
        typeof context.username === 'string' ? context.username.trim().toLowerCase() : null;
      if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
        username = null;
      }

      let full_name = typeof context.fullName === 'string' ? context.fullName.trim() : '';
      if (!full_name) {
        const first = typeof context.firstName === 'string' ? context.firstName.trim() : '';
        const last = typeof context.lastName === 'string' ? context.lastName.trim() : '';
        full_name = [first, last].filter(Boolean).join(' ');
      }
      if (!full_name) {
        full_name =
          typeof context.displayName === 'string' ? context.displayName.trim() : 'Sanctuary User';
      }
      if (!full_name || full_name.length === 0) {
        full_name = 'Sanctuary User';
      }

      const display_name =
        typeof context.displayName === 'string' && context.displayName.trim()
          ? context.displayName.trim()
          : full_name || 'Gurudevi User';

      let finalPersonalClassroomId: string | null = null;
      {
        const isTeacherOrPrincipal = [
          'teacher',
          'principal',
          'section_head',
          'grade_head',
          'founder',
          'assistant_principal',
          'developer',
        ].includes(orientation);

        let classroomType = 'unrelated_classroom';
        let classroomName = `${display_name}'s Personal Workspace`;

        if (isTeacherOrPrincipal) {
          classroomType = 'teacher_classroom';
          classroomName = `${display_name}'s Classroom`;
        } else if (orientation === 'student') {
          classroomType = 'student_classroom';
          classroomName = `${display_name}'s Student Workspace`;
        }

        const existingPC = await db.personalClassroom.findFirst({
          where: { user_id: userId },
          select: { id: true },
        });

        if (existingPC) {
          finalPersonalClassroomId = existingPC.id;
        } else {
          try {
            const newPC = await db.personalClassroom.create({
              data: {
                name: classroomName,
                type: classroomType,
                user_id: userId,
              },
              select: { id: true },
            });
            finalPersonalClassroomId = newPC.id;
          } catch (pcErr) {
            console.error(
              '[createInitialBond] Failed to initialize personal classroom record:',
              pcErr,
            );
          }
        }
      }

      await db.user.update({
        where: { id: userId },
        data: {
          display_name,
          full_name,
          first_name: context.firstName ?? null,
          last_name: context.lastName ?? null,
          username,
          identity_state: isSupabaseAnonymous ? 'anonymous' : 'identifying',
          school_id: null,
          citizenship,
          capacity: orientation,
        },
      });

      const entity_type = 'PERSONAL_CLASSROOM';
      const entity_id = finalPersonalClassroomId || 'PERSONAL_WORKSPACE';

      const existingBond = await db.bond.findFirst({
        where: { user_id: userId, entity_id, capacity: orientation },
      });

      if (existingBond) {
        await db.bond.update({
          where: { id: existingBond.id },
          data: { metadata: context.metadata || {} },
        });
      } else {
        await db.bond.create({
          data: {
            user_id: userId,
            entity_id,
            entity_type,
            capacity: orientation,
            metadata: context.metadata || {},
          },
        });
      }

      return c.json({ success: true }, 200);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return c.json({ message: 'Invalid request body', issues: err.issues }, 400);
      }
      console.error('[createInitialBond] Unexpected error:', err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  },

  completeOnboarding: async (c: Context) => {
    const db = c.get('db');
    const user = c.get('user');

    if (!user || user.id === 'anonymous') {
      return c.json({ message: 'Authentication required' }, 401);
    }

    try {
      const body = completeOnboardingSchema.parse(await c.req.json());
      const { userId } = body;

      const userProfile = await db.user.findUnique({ where: { id: userId } });
      if (!userProfile) return c.json({ message: 'User not found' }, 404);

      try {
        const bonds = await db.bond.findMany({ where: { user_id: userId } });
        if (!bonds || bonds.length === 0) {
          const capacity = userProfile.capacity;
          if (!capacity) {
            return c.json(
              {
                message:
                  'Onboarding cannot complete without an explicit capacity selection. The client must collect a real capacity before this step.',
              },
              400,
            );
          }
          console.log(
            `[completeOnboarding] User ${userId} has no bonds. Creating default PERSONAL_CLASSROOM sanctuary.`,
          );

          const pc = await db.personalClassroom.create({
            data: {
              name: `${userProfile.display_name || 'Sanctuary'}'s Workspace`,
              type: capacity === 'student' ? 'student_classroom' : 'teacher_classroom',
              user_id: userId,
            },
            select: { id: true },
          });

          const existingBond = await db.bond.findFirst({
            where: { user_id: userId, entity_id: pc.id, capacity },
          });

          if (!existingBond) {
            await db.bond.create({
              data: {
                user_id: userId,
                entity_id: pc.id,
                entity_type: 'PERSONAL_CLASSROOM',
                capacity,
                metadata: {},
              },
            });
          }
        }
      } catch (e) {
        console.warn('[completeOnboarding] Failed to check/create default sanctuary:', e);
      }

      await db.user.update({
        where: { id: userId },
        data: {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          identity_state: 'onboarded',
        },
      });

      return c.json({ success: true }, 200);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return c.json({ message: 'Invalid request body', issues: err.issues }, 400);
      }
      console.error('[completeOnboarding] Unexpected error:', err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  },
};
