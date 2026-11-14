import { UnavailableError } from '@repo/core/effect/Errors';
import { buildPartitionedKey, storage } from '@repo/core/lib/storage.adapter';
import { type SchoolLevel, SchoolLevelSchema } from '@repo/core/logic/schemas/school.schema';
import { type ActorRefFrom, createActor, createAsyncLogic, setup, types } from 'xstate';
import { z } from 'zod';

/**
 * Creating a commercial school (private, international, tuition): the owner names it, the handle
 * is checked, and the server creates it. Institutional schools are not created here; they come
 * from the national registry and a principal connects to one (`feature:admin.school_connection`).
 *
 * The machine runs its own server calls (`checkHandle`, `provision`), so a screen only sends what
 * the person did. Both are ports: until v1 has the procedures they fail as not admitted, and the
 * screen that wires creation provides them with `schoolProvisioningMachine.provide({ actors })`.
 * Creation is one server command, so a school, its founder bond and its community group are made
 * together or not at all; the idempotency key is made once per submission and reused on retry.
 */

export const SchoolProvisioningContextSchema = z.object({
  name: z.string(),
  handle: z.string(),
  type: SchoolLevelSchema,
  schoolId: z.string().nullable(),
  groupId: z.string().nullable(),
  groupCreationFailed: z.boolean(),
  error: z.string().nullable(),
  isEdit: z.boolean(),
  editingSchoolId: z.string().nullable(),
  /** One per submission: a retry sends the same key, a changed form gets a new one. */
  idempotencyKey: z.string().nullable(),
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
  idempotencyKey: null,
};

export interface ProvisionSchoolInput {
  readonly name: string;
  readonly handle: string;
  readonly type: SchoolLevel;
  readonly idempotencyKey: string;
}

export interface ProvisionSchoolResult {
  readonly schoolId: string;
  readonly groupId?: string;
  /** The school exists but its community group could not be made; it can be added later. */
  readonly groupFailed?: boolean;
}

const notAdmitted = (procedure: string) =>
  new UnavailableError({
    code: 'API_CAPABILITY_NOT_ADMITTED',
    message: `${procedure} is not available yet.`,
  });

/** Whether a handle is free. Port: provide the v1 query when it exists. */
export const checkSchoolHandle = createAsyncLogic<boolean, { handle: string }>({
  run: async () => {
    throw notAdmitted('school.handleAvailable');
  },
});

/** Creates the school, its founder bond and its group in one command. Port: provide the v1 command. */
export const provisionSchool = createAsyncLogic<ProvisionSchoolResult, ProvisionSchoolInput>({
  run: async () => {
    throw notAdmitted('school.provision');
  },
});

const messageOf = (error: unknown) =>
  error instanceof Error && error.message ? error.message : 'School provisioning failed';

const slugOf = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');

export const schoolProvisioningMachine = setup({
  schemas: {
    context: SchoolProvisioningContextSchema,
    input: types<Partial<SchoolProvisioningContext> | undefined>(),
    events: {
      SET_DETAILS: types<{ name: string; handle?: string }>(),
      SET_TYPE: types<{ schoolType: SchoolLevel }>(),
      SUBMIT: types<void>(),
      RETRY: types<void>(),
      RESET: types<void>(),
    },
  },
  actors: { checkHandle: checkSchoolHandle, provision: provisionSchool },
}).createMachine({
  id: 'schoolProvisioning',
  initial: 'details',
  context: ({ input }) => ({ ...initialSchoolProvisioningContext, ...input }),
  states: {
    details: {
      on: {
        SET_DETAILS: ({ event, context }) => ({
          context: {
            ...context,
            name: event.name,
            handle: event.handle ?? slugOf(event.name),
            error: null,
            idempotencyKey: null,
          },
        }),
        SET_TYPE: ({ event, context }) => ({
          context: { ...context, type: event.schoolType, idempotencyKey: null },
        }),
        SUBMIT: ({ context }) => {
          if (!context.name.trim()) {
            return { context: { ...context, error: 'School name is required' } };
          }
          return {
            target: 'verifying_handle',
            context: {
              ...context,
              error: null,
              idempotencyKey: context.idempotencyKey ?? crypto.randomUUID(),
            },
          };
        },
      },
    },
    verifying_handle: {
      invoke: {
        src: 'checkHandle',
        input: ({ context }) => ({ handle: context.handle }),
        onDone: ({ context, event }) =>
          event.output
            ? { target: 'provisioning_backend', context: { ...context, error: null } }
            : {
                target: 'details',
                context: {
                  ...context,
                  error: `Handle "${context.handle}" is already claimed. Choose another.`,
                },
              },
        onError: ({ context, event }) => ({
          target: 'error',
          context: { ...context, error: messageOf(event.error) },
        }),
      },
    },
    provisioning_backend: {
      invoke: {
        src: 'provision',
        input: ({ context }) => ({
          name: context.name.trim(),
          handle: context.handle,
          type: context.type,
          idempotencyKey: context.idempotencyKey ?? '',
        }),
        onDone: ({ context, event }) => ({
          target: 'activated',
          context: {
            ...context,
            schoolId: event.output.schoolId,
            groupId: event.output.groupId ?? null,
            groupCreationFailed: event.output.groupFailed ?? false,
            error: null,
          },
        }),
        onError: ({ context, event }) => ({
          target: 'error',
          context: { ...context, error: messageOf(event.error) },
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
          context: { ...context, error: null },
        }),
        RESET: ({ context }) => ({
          target: 'details',
          context: { ...context, error: null },
        }),
      },
    },
  },
});

/** The machine, or a copy with its server calls provided (`schoolProvisioningMachine.provide`). */
export type SchoolProvisioningMachine =
  | typeof schoolProvisioningMachine
  | ReturnType<(typeof schoolProvisioningMachine)['provide']>;
export type SchoolProvisioningActor = ActorRefFrom<typeof schoolProvisioningMachine>;

/** Creates and starts a school provisioning actor. Pass `machine` to run it with provided ports. */
export function createSchoolProvisioningActor(
  initialContext?: Partial<SchoolProvisioningContext>,
  machine: SchoolProvisioningMachine = schoolProvisioningMachine,
): SchoolProvisioningActor {
  return createActor(machine, { input: initialContext }).start();
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
