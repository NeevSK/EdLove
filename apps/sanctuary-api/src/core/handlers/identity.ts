import {
  CapabilityBootstrapSchema,
  identityORPCContract,
} from '@repo/core/api/identity.orpc.contract';
import { declaredCapabilities } from '@repo/core/logic/registry/capabilityManifest';
import { profileWriteData } from '@repo/core/logic/schemas/profileUpdate.schema';
import { SovereignError } from '@repo/core/types/Errors';
import { check as checkCedar } from '@repo/policies';
import {
  activeScopeReader,
  buildEmptyIdentityBootstrap,
  buildIdentityBootstrap,
  resolvePersistedActiveBond,
} from '../activeScope';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware, sovereignErrorMiddleware } from '../orpcMiddleware';

const impl = implement(identityORPCContract).$context<ORPCContext>();

export const identityRouter = impl.router({
  // Bypasses doubleGateMiddleware as this resolves the authenticated token identity itself
  identifyActiveCitizen: impl.identifyActiveCitizen
    .use(sovereignErrorMiddleware)
    .handler(async ({ context }) => {
      if (!context.db || context.user.id === 'anonymous')
        return buildEmptyIdentityBootstrap(context.user.id);

      const identity = await context.db.user.findUnique({
        where: { id: context.user.id },
        include: {
          bonds: true,
        },
      });

      if (!identity) return buildEmptyIdentityBootstrap(context.user.id);
      const activeBond = await resolvePersistedActiveBond(
        activeScopeReader(context.db),
        identity.id,
      );
      return buildIdentityBootstrap(identity, identity.bonds, activeBond);
    }),

  capabilityBootstrap: impl.capabilityBootstrap
    .use(sovereignErrorMiddleware)
    .handler(async ({ context, input }) => {
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
      assertDatabase(context);
      const user = await context.db.user.findUnique({
        where: { id: context.user.id },
        include: { bonds: true },
      });
      if (!user) throw SovereignError.notFound('User');
      const activeBond = await resolvePersistedActiveBond(activeScopeReader(context.db), user.id);
      const identity = buildIdentityBootstrap(user, user.bonds, activeBond);
      const now = new Date();
      const capability = (declaration: ReturnType<typeof declaredCapabilities>[number]) => {
        if (
          declaration.account.requiresSelectedScope &&
          (!activeBond || !context.principal || !context.securityContext)
        ) {
          return {
            id: declaration.id,
            status: 'locked' as const,
            reason: 'scope_required' as const,
            allowedOperations: [],
            storagePolicy: declaration.storagePolicy,
            taskPolicy: declaration.taskPolicy,
          };
        }
        if (!context.principal || !context.securityContext) {
          return {
            id: declaration.id,
            status: 'unavailable' as const,
            reason: 'authorization_unavailable' as const,
            allowedOperations: [],
            storagePolicy: declaration.storagePolicy,
            taskPolicy: declaration.taskPolicy,
          };
        }
        const permissionRequest = {
          principal: context.principal,
          action: declaration.account.action,
          resource: {
            id: context.user.id,
            type: declaration.account.subject,
            attributes: { user_id: context.user.id, school_id: context.schoolId ?? '' },
          },
          context: context.securityContext,
        };
        const decision = checkCedar(permissionRequest);
        if (!decision.permitted) {
          return {
            id: declaration.id,
            status: 'locked' as const,
            reason: 'authorization_denied' as const,
            allowedOperations: [],
            storagePolicy: declaration.storagePolicy,
            taskPolicy: declaration.taskPolicy,
          };
        }
        return {
          id: declaration.id,
          status: 'available' as const,
          reason: 'available' as const,
          allowedOperations: declaration.operations.filter(
            (action) =>
              action === declaration.account.action ||
              checkCedar({ ...permissionRequest, action }).permitted,
          ),
          storagePolicy: declaration.storagePolicy,
          taskPolicy: declaration.taskPolicy,
        };
      };
      return CapabilityBootstrapSchema.parse({
        schemaVersion: 1,
        subjectId: context.user.id,
        generatedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
        scopeBootstrap: identity.scopeBootstrap,
        features: declaredCapabilities(input.query.domain, input.query.platform).map(capability),
      });
    }),

  fetchUserProfile: impl.fetchUserProfile
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);

      const profile = await context.db.user.findUnique({
        where: { id: input.params.id },
        include: {
          bonds: true,
        },
      });

      if (!profile) throw SovereignError.notFound('Profile');
      const activeBond =
        profile.id === context.user.id
          ? await resolvePersistedActiveBond(activeScopeReader(context.db), profile.id)
          : null;
      return buildIdentityBootstrap(profile, profile.bonds, activeBond);
    }),

  // Scope selection is the bootstrap path; the handler validates ownership and validity itself.
  selectActiveScope: impl.selectActiveScope
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();

      const now = new Date();
      const result = await context.db.$transaction(async (tx) => {
        const bond = await tx.bond.findFirst({
          where: {
            id: input.body.bondId,
            user_id: context.user.id,
            status: 'active',
            valid_from: { lte: now },
            OR: [{ valid_until: null }, { valid_until: { gt: now } }],
          },
        });
        if (!bond) throw SovereignError.notFound('Active bond');

        await tx.userPreferences.upsert({
          where: { user_id: context.user.id },
          create: {
            user_id: context.user.id,
            active_bond_id: bond.id,
            favorite_features: [],
            hidden_features: [],
          },
          update: { active_bond_id: bond.id },
        });

        const user = await tx.user.findUnique({
          where: { id: context.user.id },
          include: { bonds: true },
        });
        if (!user) throw SovereignError.notFound('User');
        return { user, bond };
      });

      return buildIdentityBootstrap(result.user, result.user.bonds, result.bond);
    }),

  // Bypasses doubleGateMiddleware as this checks classroom workspaces before active bond contexts are set up
  resolveWorkspaceContext: impl.resolveWorkspaceContext
    .use(sovereignErrorMiddleware)
    .handler(async ({ input, context }) => {
      if (!context.db || input.params.id === 'anonymous') {
        return {
          user_id: input.params.id,
          school_id: null,
          profile_completed: false,
          onboarding_completed: false,
          onboarding_state: 'ARRIVAL',
          real_class_count: 0,
          profile: {} as any,
        };
      }

      const [user, classrooms] = await Promise.all([
        context.db.user.findUnique({ where: { id: input.params.id } }),
        context.db.classroom.findMany({
          where: { teacher_id: input.params.id },
          select: { id: true },
        }),
      ]);

      if (!user) {
        return {
          user_id: input.params.id,
          school_id: null,
          profile_completed: false,
          onboarding_completed: false,
          onboarding_state: 'ARRIVAL',
          real_class_count: 0,
          profile: {} as any,
        };
      }

      return {
        user_id: input.params.id,
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

      if (input.params.id !== context.user.id)
        throw SovereignError.unauthorized('update', 'another account profile');

      const updated = await context.db.user.update({
        where: { id: input.params.id },
        data: profileWriteData(input.body),
        include: {
          bonds: true,
        },
      });

      const activeBond = await resolvePersistedActiveBond(
        activeScopeReader(context.db),
        updated.id,
      );
      return buildIdentityBootstrap(updated, updated.bonds, activeBond);
    }),
});
