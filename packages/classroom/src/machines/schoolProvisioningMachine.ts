import { buildPartitionedKey, storage } from '@repo/core/lib/storage.adapter';
import { Cause, Effect, Exit } from 'effect';
import { type ActorRefFrom, createActor, createMachine, types } from 'xstate';
import { z } from 'zod';

export const SchoolTypeEnum = z.enum([
  'primary',
  'secondary',
  'mixed',
  'k12',
  'vocational',
]);

export type SchoolType = z.infer<typeof SchoolTypeEnum>;

export const SchoolProvisioningContextSchema = z.object({
  name: z.string(),
  handle: z.string(),
  type: SchoolTypeEnum,
  schoolId: z.string().nullable(),
  groupId: z.string().nullable(),
  groupCreationFailed: z.boolean(),
  error: z.string().nullable(),
  isEdit: z.boolean(),
  editingSchoolId: z.string().nullable(),
});

export type SchoolProvisioningContext = z.infer<typeof SchoolProvisioningContextSchema>;

export const initialSchoolProvisioningContext: SchoolProvisioningContext = {
  name: '',
  handle: '',
  type: 'mixed',
  schoolId: null,
  groupId: null,
  groupCreationFailed: false,
  error: null,
  isEdit: false,
  editingSchoolId: null,
};

export const schoolProvisioningMachine = createMachine({
  id: 'schoolProvisioning',
  schemas: {
    context: SchoolProvisioningContextSchema,
    events: {
      SET_DETAILS: types<{ name: string; handle?: string }>(),
      SET_TYPE: types<{ schoolType: SchoolType }>(),
      SUBMIT: types<void>(),
      HANDLE_VERIFIED: types<{ available: boolean }>(),
      PROVISION_SUCCESS: types<{
        schoolId: string;
        groupId?: string;
        groupFailed?: boolean;
      }>(),
      PROVISION_FAILED: types<{ error: string }>(),
      RETRY: types<void>(),
      RESET: types<void>(),
    },
  },
  initial: 'details',
  context: ({ input }: { input?: Partial<SchoolProvisioningContext> }) => ({
    ...initialSchoolProvisioningContext,
    ...input,
  }),
  states: {
    details: {
      on: {
        SET_DETAILS: ({ event, context }) => ({
          target: 'details',
          context: {
            ...context,
            name: event.name,
            handle:
              event.handle !== undefined
                ? event.handle
                : event.name.trim().toLowerCase().replace(/\s+/g, '-'),
            error: null,
          },
        }),
        SET_TYPE: ({ event, context }) => ({
          target: 'details',
          context: {
            ...context,
            type: event.schoolType,
          },
        }),
        SUBMIT: ({ context }) => {
          if (!context.name.trim()) {
            return {
              target: 'details',
              context: {
                ...context,
                error: 'School name is required',
              },
            };
          }
          return {
            target: 'verifying_handle',
            context: {
              ...context,
              error: null,
            },
          };
        },
      },
    },
    verifying_handle: {
      on: {
        HANDLE_VERIFIED: ({ event, context }) => {
          if (!event.available) {
            return {
              target: 'details',
              context: {
                ...context,
                error: `Handle "${context.handle}" is already claimed. Choose another.`,
              },
            };
          }
          return {
            target: 'provisioning_backend',
            context: {
              ...context,
              error: null,
            },
          };
        },
        PROVISION_FAILED: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    provisioning_backend: {
      on: {
        PROVISION_SUCCESS: ({ event, context }) => ({
          target: 'activated',
          context: {
            ...context,
            schoolId: event.schoolId,
            groupId: event.groupId ?? null,
            groupCreationFailed: event.groupFailed ?? false,
            error: null,
          },
        }),
        PROVISION_FAILED: ({ event, context }) => ({
          target: 'error',
          context: {
            ...context,
            error: event.error,
          },
        }),
      },
    },
    activated: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: ({ context }) => ({
          target: 'provisioning_backend',
          context: {
            ...context,
            error: null,
          },
        }),
        RESET: ({ context }) => ({
          target: 'details',
          context: {
            ...context,
            error: null,
          },
        }),
      },
    },
  },
});

export type SchoolProvisioningMachine = typeof schoolProvisioningMachine;
export type SchoolProvisioningActor = ActorRefFrom<SchoolProvisioningMachine>;

/**
 * Creates and starts a School Provisioning Actor instance.
 */
export function createSchoolProvisioningActor(
  initialContext?: Partial<SchoolProvisioningContext>,
): SchoolProvisioningActor {
  const actor = createActor(schoolProvisioningMachine, { input: initialContext });
  actor.start();
  return actor;
}

export interface SchoolProvisioningDependencies {
  createSchool: (params: {
    name: string;
    handle: string;
    type: SchoolType;
    userId: string;
  }) => Promise<{ id: string; name: string }>;
  createFounderBond: (userId: string, schoolId: string) => Promise<void>;
  createCommunityGroup?: (params: {
    name: string;
    description: string;
    type: string;
  }) => Promise<{ id: string }>;
}

/**
 * Effect-TS v4 runner for School Provisioning orchestration.
 * Enforces pre- and post-flight actor liveness guards.
 */
export function executeSchoolProvisioningEffect(params: {
  userId: string;
  deps: SchoolProvisioningDependencies;
  actor: SchoolProvisioningActor;
}) {
  const { userId, deps, actor } = params;

  if (actor.getSnapshot().status === 'stopped') {
    return Promise.resolve(Exit.void);
  }

  const { name, handle, type } = actor.getSnapshot().context;

  const program = Effect.gen(function* () {
    // 1. Create real school
    const school = yield* Effect.tryPromise({
      try: () => deps.createSchool({ name, handle, type, userId }),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });

    // 2. Bind founder bond
    yield* Effect.tryPromise({
      try: () => deps.createFounderBond(userId, school.id),
      catch: (err) => (err instanceof Error ? err : new Error(String(err))),
    });

    // 3. Optional Community Group creation (with partial failure tolerance)
    let groupId: string | undefined;
    let groupFailed = false;

    if (deps.createCommunityGroup) {
      const groupResult = yield* Effect.tryPromise({
        try: () =>
          deps.createCommunityGroup!({
            name: `${name.trim()} HQ`,
            description: `Official community portal for ${name.trim()}`,
            type: 'general',
          }),
        catch: () => null,
      });

      if (groupResult?.id) {
        groupId = groupResult.id;
      } else {
        groupFailed = true;
      }
    }

    return {
      schoolId: school.id,
      groupId,
      groupFailed,
    };
  });

  return Effect.runPromiseExit(program).then((exit) => {
    if (actor.getSnapshot().status === 'stopped') {
      return exit;
    }

    Exit.match(exit, {
      onFailure: (cause) => {
        const errOption = Cause.findErrorOption(cause);
        const errorMsg =
          errOption._tag === 'Some'
            ? errOption.value instanceof Error
              ? errOption.value.message
              : String(errOption.value)
            : 'School provisioning failed';
        actor.send({ type: 'PROVISION_FAILED', error: errorMsg });
      },
      onSuccess: ({ schoolId, groupId, groupFailed }) => {
        actor.send({
          type: 'PROVISION_SUCCESS',
          schoolId,
          groupId,
          groupFailed,
        });
      },
    });

    return exit;
  });
}

/**
 * Resolves partitioned storage key for school provisioning draft.
 */
export function resolveSchoolDraftKey(params: { userId?: string }): string {
  return buildPartitionedKey({
    userId: params.userId,
    feature: 'school_provisioning_draft',
  });
}

/**
 * Saves school provisioning draft snapshot to partitioned storage.
 */
export async function saveSchoolDraftSnapshot(
  key: string,
  draft: Partial<SchoolProvisioningContext>,
): Promise<void> {
  await storage.setAsync(key, JSON.stringify(draft));
}

/**
 * Restores school provisioning draft snapshot from partitioned storage.
 */
export async function restoreSchoolDraftSnapshot(
  key: string,
): Promise<Partial<SchoolProvisioningContext> | null> {
  const raw = await storage.getStringAsync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears school provisioning draft from partitioned storage.
 */
export async function clearSchoolDraftSnapshot(key: string): Promise<void> {
  await storage.deleteAsync(key);
}
