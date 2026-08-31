import { onboardingContract } from '@repo/core/api/server';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { sovereignErrorMiddleware } from '../orpcMiddleware';

const impl = implement(onboardingContract).$context<ORPCContext>();

export const onboardingRouter = impl.router({
  // Onboarding endpoints bootstrap the user's workspace/bond, so they bypass doubleGateMiddleware
  createInitialBond: impl.createInitialBond
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

      const userId = context.user.id;
      const { orientation, context: requestContext } = input.body;

      const profile = await context.db.user.findUnique({ where: { id: userId } });
      if (!profile) throw SovereignError.notFound('User');

      const isSupabaseAnonymous = profile.is_anonymous === true;
      const citizenship = isSupabaseAnonymous ? 'THIRD_CLASS' : 'SECOND_CLASS';

      let username =
        typeof requestContext.username === 'string'
          ? requestContext.username.trim().toLowerCase()
          : null;
      if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
        username = null;
      }

      let full_name =
        typeof requestContext.fullName === 'string' ? requestContext.fullName.trim() : '';
      if (!full_name) {
        const first =
          typeof requestContext.firstName === 'string' ? requestContext.firstName.trim() : '';
        const last =
          typeof requestContext.lastName === 'string' ? requestContext.lastName.trim() : '';
        full_name = [first, last].filter(Boolean).join(' ');
      }
      if (!full_name) {
        full_name =
          typeof requestContext.displayName === 'string'
            ? requestContext.displayName.trim()
            : 'Sanctuary User';
      }
      if (!full_name || full_name.length === 0) {
        full_name = 'Sanctuary User';
      }

      const display_name =
        typeof requestContext.displayName === 'string' && requestContext.displayName.trim()
          ? requestContext.displayName.trim()
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

        const existingPC = await context.db.personalClassroom.findFirst({
          where: { user_id: userId },
          select: { id: true },
        });

        if (existingPC) {
          finalPersonalClassroomId = existingPC.id;
        } else {
          const newPC = await context.db.personalClassroom.create({
            data: {
              name: classroomName,
              type: classroomType,
              user_id: userId,
            },
            select: { id: true },
          });
          finalPersonalClassroomId = newPC.id;
        }
      }

      await context.db.user.update({
        where: { id: userId },
        data: {
          display_name,
          full_name,
          first_name: (requestContext.firstName as string) ?? null,
          last_name: (requestContext.lastName as string) ?? null,
          username,
          identity_state: isSupabaseAnonymous ? 'anonymous' : 'identifying',
          school_id: null,
          citizenship: citizenship as any,
          capacity: orientation as any,
        },
      });

      const entity_type = 'PERSONAL_CLASSROOM';
      const entity_id = finalPersonalClassroomId || 'PERSONAL_WORKSPACE';

      const existingBond = await context.db.bond.findFirst({
        where: { user_id: userId, entity_id, capacity: orientation as any },
      });

      if (existingBond) {
        await context.db.bond.update({
          where: { id: existingBond.id },
          data: { metadata: (requestContext.metadata as any) || {} },
        });
      } else {
        await context.db.bond.create({
          data: {
            user_id: userId,
            entity_id,
            entity_type,
            capacity: orientation as any,
            metadata: (requestContext.metadata as any) || {},
          },
        });
      }

      return { success: true };
    }),

  completeOnboarding: impl.completeOnboarding
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

      const userId = context.user.id;

      const userProfile = await context.db.user.findUnique({ where: { id: userId } });
      if (!userProfile) throw SovereignError.notFound('User');

      const bonds = await context.db.bond.findMany({ where: { user_id: userId } });
      if (!bonds || bonds.length === 0) {
        const capacity = userProfile.capacity;
        if (!capacity) {
          throw SovereignError.invalidInput(
            'Onboarding cannot complete without an explicit capacity selection.',
          );
        }

        const pc = await context.db.personalClassroom.create({
          data: {
            name: `${userProfile.display_name || 'Sanctuary'}'s Workspace`,
            type: capacity === 'student' ? 'student_classroom' : 'teacher_classroom',
            user_id: userId,
          },
          select: { id: true },
        });

        const existingBond = await context.db.bond.findFirst({
          where: { user_id: userId, entity_id: pc.id, capacity },
        });

        if (!existingBond) {
          await context.db.bond.create({
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

      await context.db.user.update({
        where: { id: userId },
        data: {
          onboarding_completed: true,
          onboarding_completed_at: new Date(),
          identity_state: 'onboarded',
        },
      });

      return { success: true };
    }),

  createFounderSchoolBond: impl.createFounderSchoolBond
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

      const userId = context.user.id;
      const school = await context.db.school.findUnique({ where: { id: input.body.schoolId } });
      if (!school || school.created_by !== userId)
        throw SovereignError.unauthorized('establish', 'school founder bond');

      const user = await context.db.user.findUnique({ where: { id: userId } });
      if (user?.is_anonymous) throw SovereignError.unauthorized('establish', 'school founder bond');

      const existingBond = await context.db.bond.findFirst({
        where: {
          user_id: userId,
          entity_id: input.body.schoolId,
          entity_type: 'SCHOOL',
          capacity: 'principal',
        },
      });
      if (existingBond) return { success: true, bondId: existingBond.id };

      const created = await context.db.$transaction(async (tx: any) => {
        const bond = await tx.bond.create({
          data: {
            user_id: userId,
            entity_id: input.body.schoolId,
            entity_type: 'SCHOOL',
            capacity: 'principal',
            metadata: { source: 'official_school_creation' },
          },
        });
        await tx.user.update({
          where: { id: userId },
          data: { citizenship: 'FIRST_CLASS', school_id: input.body.schoolId },
        });
        await tx.userEntitlementGrant.create({
          data: {
            user_id: userId,
            bond_id: bond.id,
            scope_type: 'BOND',
            tier: 'INSTITUTIONAL',
            modules: ['school_workspace'],
            source: 'official_school_creation',
          },
        });
        return bond;
      });

      return { success: true, bondId: created.id };
    }),

  revokeSchoolBond: impl.revokeSchoolBond
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

      const callerId = context.user.id;
      const targetBond = await context.db.bond.findFirst({
        where: { entity_id: input.params.schoolId, entity_type: 'SCHOOL', user_id: callerId },
      });
      if (!targetBond) throw SovereignError.unauthorized('revoke', 'school bond');

      await context.db.$transaction(async (tx: any) => {
        if (targetBond) {
          await tx.userEntitlementGrant.deleteMany({ where: { bond_id: targetBond.id } });
          await tx.bond.delete({ where: { id: targetBond.id } });
        }
        const remaining = await tx.bond.findFirst({
          where: { user_id: callerId, entity_type: 'SCHOOL' },
          orderBy: { created_at: 'asc' },
        });
        await tx.user.update({
          where: { id: callerId },
          data: {
            school_id: remaining?.entity_id ?? null,
            citizenship: remaining ? 'FIRST_CLASS' : 'SECOND_CLASS',
          },
        });
      });

      return { success: true };
    }),
});
