import { identityORPCContract } from '@repo/core/api/identity.orpc.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(identityORPCContract).$context<ORPCContext>();

const mapToIdentityPayload = (user: any) => {
  const dbBonds = user.bonds || [];
  const availableBonds = dbBonds.map((b: any) => ({
    id: b.id,
    user_id: b.user_id,
    entity_id: b.entity_id,
    entity_type: b.entity_type,
    capacity: b.capacity,
    status: b.status || 'active',
    metadata: b.metadata || {},
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

export const identityRouter = impl.router({
  // Bypasses doubleGateMiddleware as this resolves the authenticated token identity itself
  identifyActiveCitizen: impl.identifyActiveCitizen.handler(async ({ context }) => {
    if (!context.db || context.user.id === 'anonymous') {
      return {
        id: context.user.id,
        email: null,
        name: '',
        display_name: '',
        school_id: null,
        schoolId: null,
        onboarding_completed: false,
        onboarding_state: 'ARRIVAL',
        activeBond: null,
        availableBonds: [],
      } as any;
    }

    const identity = await context.db.user.findUnique({
      where: { id: context.user.id },
      include: {
        bonds: true,
      },
    });

    if (!identity) throw SovereignError.notFound('Identity');
    return mapToIdentityPayload(identity) as any;
  }),

  fetchUserProfile: impl.fetchUserProfile
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);

      const profile = await context.db.user.findUnique({
        where: { id: input.id },
        include: {
          bonds: true,
        },
      });

      if (!profile) throw SovereignError.notFound('Profile');
      return mapToIdentityPayload(profile) as any;
    }),

  // Bypasses doubleGateMiddleware as this checks classroom workspaces before active bond contexts are set up
  resolveWorkspaceContext: impl.resolveWorkspaceContext.handler(async ({ input, context }) => {
    if (!context.db || input.id === 'anonymous') {
      return {
        user_id: input.id,
        school_id: null,
        profile_completed: false,
        onboarding_completed: false,
        onboarding_state: 'ARRIVAL',
        real_class_count: 0,
        profile: {} as any,
      };
    }

    const [user, classrooms] = await Promise.all([
      context.db.user.findUnique({ where: { id: input.id } }),
      context.db.classroom.findMany({
        where: { teacher_id: input.id },
        select: { id: true },
      }),
    ]);

    if (!user) throw SovereignError.notFound('User');

    return {
      user_id: input.id,
      school_id: null,
      profile_completed: !!user.full_name,
      onboarding_completed: !!user.onboarding_completed,
      onboarding_state: (user as any).onboarding_state ?? 'ARRIVAL',
      real_class_count: classrooms.length,
      profile: user as any,
    };
  }),

  modifyUserProfile: impl.modifyUserProfile
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);

      const body = { ...input.body };
      if ('email' in body && body.email === '') {
        body.email = null;
      }

      const updated = await context.db.user.update({
        where: { id: input.id },
        data: body as any,
        include: {
          bonds: true,
        },
      });

      return mapToIdentityPayload(updated) as any;
    }),
});
