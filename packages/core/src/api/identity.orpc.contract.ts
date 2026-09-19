import { FacetedProfileSchema, IdentitySchema } from '@repo/core/api/identity.generated';
import { z } from 'zod';

export const OnboardingStateSchema = z.enum([
  'ARRIVAL',
  'IDENTITY_SELECTION',
  'SANCTUARY_INIT',
  'COMPLETED',
]);

export const ClassroomCapacitySummarySchema = z.strictObject({
  user_id: z.uuid(),
  school_id: z.uuid().nullable(),
  profile_completed: z.boolean(),
  onboarding_completed: z.boolean(),
  onboarding_state: OnboardingStateSchema,
  real_class_count: z.number().int().nonnegative(),
  profile: FacetedProfileSchema,
});

export const ScopeBootstrapSchema = z.strictObject({
  version: z.literal(1),
  userId: z.uuid().nullable(),
  name: z.string(),
  primaryCapacity: z.string().nullable(),
  selection: z.enum(['selected', 'needs_selection']),
  activeScope: z
    .strictObject({
      bondId: z.uuid(),
      entityId: z.string(),
      entityType: z.string(),
      roles: z.array(z.string()).min(1),
    })
    .nullable(),
});

const BootstrapBondSchema = z.strictObject({
  id: z.uuid(),
  user_id: z.uuid(),
  entity_id: z.string(),
  entity_type: z.enum([
    'PLATFORM',
    'SCHOOL',
    'CLASSROOM',
    'COMMUNITY',
    'GROUP',
    'PERSONAL',
    'PERSONAL_CLASSROOM',
  ]),
  capacity: z.string(),
  status: z.literal('active'),
});

export const IdentityBootstrapSchema = IdentitySchema.omit({
  id: true,
  activeBond: true,
  availableBonds: true,
}).extend({
  id: z.union([z.uuid(), z.literal('anonymous')]),
  activeBond: BootstrapBondSchema.nullable().optional(),
  availableBonds: z.array(BootstrapBondSchema),
  scopeBootstrap: ScopeBootstrapSchema,
});

export type ScopeBootstrap = z.infer<typeof ScopeBootstrapSchema>;

export const CapabilityBootstrapSchema = z.strictObject({
  schemaVersion: z.literal(1),
  subjectId: z.uuid(),
  generatedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  scopeBootstrap: ScopeBootstrapSchema,
  features: z.array(
    z.strictObject({
      id: z.string().min(1),
      status: z.enum(['available', 'locked', 'unavailable']),
      reason: z.enum([
        'available',
        'scope_required',
        'authorization_denied',
        'authorization_unavailable',
      ]),
      allowedOperations: z.array(z.enum(['read', 'create'])),
      storagePolicy: z.enum(['cloud', 'local-only']),
      taskPolicy: z.enum(['single', 'modal']),
    }),
  ),
});

const userAuthority = (action: 'resolve' | 'read' | 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

export const identityORPCContract = {
  identifyActiveCitizen: {
    method: 'get',
    path: '/identity/resolveIdentity',
    request: {},
    responses: {
      200: {
        schema: IdentityBootstrapSchema,
        description: 'Resolve identity and remembered scope',
      },
    },
    metadata: userAuthority('resolve'),
  },

  fetchUserProfile: {
    method: 'get',
    path: '/identity/profile/:id',
    request: { params: z.object({ id: z.uuid() }) },
    responses: {
      200: { schema: IdentityBootstrapSchema, description: 'Get profile and remembered scope' },
    },
    metadata: userAuthority('read'),
  },

  selectActiveScope: {
    method: 'put',
    path: '/identity/active-scope',
    request: { body: z.strictObject({ bondId: z.uuid() }) },
    responses: {
      200: { schema: IdentityBootstrapSchema, description: 'Persist a validated active scope' },
    },
    metadata: userAuthority('update'),
  },

  capabilityBootstrap: {
    method: 'get',
    path: '/capabilities/bootstrap/v1',
    request: {
      query: z.strictObject({
        domain: z.enum(['self', 'workspace', 'community', 'library']),
        platform: z.enum(['browser', 'native']),
      }),
    },
    responses: {
      200: {
        schema: CapabilityBootstrapSchema,
        description: 'Server-computed feature capabilities',
      },
    },
    metadata: userAuthority('resolve'),
  },

  resolveWorkspaceContext: {
    method: 'get',
    path: '/identity/classroom-capacity-summary/:id',
    request: {
      params: z.object({ id: z.union([z.uuid(), z.literal('anonymous')]) }),
    },
    responses: {
      200: { schema: ClassroomCapacitySummarySchema, description: 'Get capacity summary' },
    },
    metadata: userAuthority('read'),
  },

  modifyUserProfile: {
    method: 'patch',
    path: '/identity/profile/:id',
    request: {
      params: z.object({ id: z.uuid() }),
      body: IdentitySchema.partial(),
    },
    responses: {
      200: {
        schema: IdentityBootstrapSchema,
        description: 'Update profile and active-scope bootstrap',
      },
    },
    metadata: userAuthority('update'),
  },
};

export type OnboardingState = z.infer<typeof OnboardingStateSchema>;
export type ClassroomCapacitySummary = z.infer<typeof ClassroomCapacitySummarySchema>;
