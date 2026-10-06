import { onboardingContract } from '@repo/core/api/server';
import { SovereignError } from '@repo/core/types/Errors';
import { CapacitySchema } from '@repo/core/api/identity.generated';
import { assertDatabase } from '../apiErrors';
import {
  buildIdentityBootstrap,
  persistPersonalSanctuaryBondCapacity,
  resolvePersonalCapacityChange,
} from '../activeScope';
import {
  currentPlatformProvisionConfig,
  resolveInitialBondAuthority,
} from '../platformBondProvision';
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
      const {
        orientation,
        confirmCapacityChange,
        context: requestContext,
      } = input.body;
      const primaryCapacity = CapacitySchema.safeParse(orientation);
      if (!primaryCapacity.success) {
        throw SovereignError.invalidInput('Choose a recognized primary capacity.');
      }
      const bondAuthority = resolveInitialBondAuthority(
        primaryCapacity.data,
        userId,
        currentPlatformProvisionConfig(),
      );
      if (!bondAuthority) {
        throw SovereignError.unauthorized(
          'select',
          'privileged platform capacity must be server-provisioned',
        );
      }

      const fullNameInput = requestContext.fullName;
      const displayNameInput = requestContext.displayName;
      const firstNameInput = requestContext.firstName;
      const lastNameInput = requestContext.lastName;
      const fullName =
        (typeof fullNameInput === 'string' && fullNameInput.trim()) ||
        [firstNameInput, lastNameInput]
          .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
          .map((part) => part.trim())
          .join(' ') ||
        (typeof displayNameInput === 'string' && displayNameInput.trim()) ||
        'Sanctuary User';
      const displayName =
        (typeof displayNameInput === 'string' && displayNameInput.trim()) || fullName;
      const usernameInput = requestContext.username;
      const normalizedUsername =
        typeof usernameInput === 'string' ? usernameInput.trim().toLowerCase() : '';
      const username = /^[a-z0-9_-]{3,30}$/.test(normalizedUsername)
        ? normalizedUsername
        : null;
      const now = new Date();

      const result = await context.db.$transaction(async (tx) => {
        const profile = await tx.user.findUnique({ where: { id: userId } });
        if (!profile) throw SovereignError.notFound('User');

        const isTeacherOrPrincipal = [
          'teacher',
          'principal',
          'sectionHead',
          'gradeHead',
          'assistantPrincipal',
        ].includes(orientation);
        const classroomType = isTeacherOrPrincipal
          ? 'teacher_classroom'
          : orientation === 'student'
            ? 'student_classroom'
            : 'unrelated_classroom';
        const classroomName = isTeacherOrPrincipal
          ? `${displayName}'s Classroom`
          : orientation === 'student'
            ? `${displayName}'s Student Workspace`
            : `${displayName}'s Personal Workspace`;

        const personalClassroom = await tx.personalClassroom.findFirst({
          where: { user_id: userId },
          select: { id: true },
        });
        const classroom = personalClassroom
          ? personalClassroom
          : await tx.personalClassroom.create({
              data: { name: classroomName, type: classroomType, user_id: userId },
              select: { id: true },
            });

        const existingBond = await tx.bond.findFirst({
          where: {
            user_id: userId,
            entity_id: classroom.id,
            entity_type: 'PERSONAL_CLASSROOM',
            status: 'active',
            valid_from: { lte: now },
            OR: [{ valid_until: null }, { valid_until: { gt: now } }],
          },
          orderBy: { created_at: 'asc' },
        });
        const capacityChange = resolvePersonalCapacityChange(
          existingBond?.capacity ?? null,
          bondAuthority.personalBondCapacity,
          confirmCapacityChange,
        );
        await tx.user.update({
          where: { id: userId },
          data: {
            display_name: displayName,
            full_name: fullName,
            first_name: typeof firstNameInput === 'string' ? firstNameInput : null,
            last_name: typeof lastNameInput === 'string' ? lastNameInput : null,
            username,
            identity_state: profile.is_anonymous ? 'anonymous' : 'identifying',
            citizenship: profile.is_anonymous ? 'THIRD_CLASS' : 'SECOND_CLASS',
            capacity: capacityChange.capacity,
          },
        });

        const personalBond = await persistPersonalSanctuaryBondCapacity(
          {
            create: (args) => tx.bond.create(args),
            update: (args) => tx.bond.update(args),
          },
          existingBond,
          userId,
          classroom.id,
          capacityChange.capacity,
          capacityChange.updateBond,
        );

        for (const capacity of existingBond ? [] : bondAuthority.platformCapacities) {
          const platformBond = await tx.bond.findFirst({
            where: {
              user_id: userId,
              entity_type: 'PLATFORM',
              entity_id: 'GLOBAL',
              capacity,
            },
          });
          if (platformBond) {
            await tx.bond.update({
              where: { id: platformBond.id },
              data: {
                status: 'active',
                valid_from: now,
                valid_until: null,
                metadata: { source: 'server_subject_allowlist' },
              },
            });
          } else {
            await tx.bond.create({
              data: {
                user_id: userId,
                entity_id: 'GLOBAL',
                entity_type: 'PLATFORM',
                capacity,
                metadata: { source: 'server_subject_allowlist' },
              },
            });
          }
        }

        await tx.userPreferences.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            active_bond_id: personalBond.id,
            favorite_features: [],
            hidden_features: [],
          },
          update: { active_bond_id: personalBond.id },
        });

        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { bonds: true },
        });
        if (!user) throw SovereignError.notFound('User');
        return { user, personalBond };
      });

      return {
        success: true,
        scopeBootstrap: buildIdentityBootstrap(
          result.user,
          result.user.bonds,
          result.personalBond,
        ).scopeBootstrap,
      };
    }),

  completeOnboarding: impl.completeOnboarding
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

      const userId = context.user.id;

      await context.db.$transaction(async (tx) => {
        const profile = await tx.user.findUnique({
          where: { id: userId },
          include: { bonds: true, preferences: true },
        });
        if (!profile) throw SovereignError.notFound('User');

        const now = new Date();
        const bonds = (profile as any).bonds ?? [];
        const selectedBondId = profile.preferences?.active_bond_id;
        const selectedBond = selectedBondId
          ? bonds.find(
              (bond: any) =>
                bond.id === selectedBondId &&
                bond.status === 'active' &&
                (!bond.valid_from || bond.valid_from <= now) &&
                (!bond.valid_until || bond.valid_until > now),
            )
          : null;
        const hasPersonalBond = bonds.some(
          (bond: any) =>
            bond.entity_type === 'PERSONAL_CLASSROOM' &&
            bond.status === 'active' &&
            (!bond.valid_from || bond.valid_from <= now) &&
            (!bond.valid_until || bond.valid_until > now),
        );
        if (!selectedBond || !hasPersonalBond) {
          throw SovereignError.invalidInput(
            'A valid selected scope and Personal Sanctuary Bond are required to complete onboarding.',
          );
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            onboarding_completed: true,
            onboarding_completed_at: now,
            identity_state: 'onboarded',
          },
        });
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
