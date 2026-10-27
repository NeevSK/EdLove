import { storage } from '@repo/core/logic/managers/StorageManager';
import { createActor, setup } from 'xstate';
import { z } from 'zod';

export const SchoolTypeEnum = z.enum([
  'k12',
  'primary',
  'secondary',
  'higher_ed',
  'sanctuary',
]);

export type SchoolType = z.infer<typeof SchoolTypeEnum>;

export const PrincipalSetupContextSchema = z.object({
  schoolName: z.string(),
  schoolType: SchoolTypeEnum,
  domain: z.string(),
  facultyInvites: z.array(z.string().email()),
  step: z.number().int().nonnegative(),
  isSubmitting: z.boolean(),
  error: z.string().nullable(),
});

export type PrincipalSetupContext = z.infer<typeof PrincipalSetupContextSchema>;

export const SetSchoolProfileEventSchema = z.object({
  type: z.literal('SET_SCHOOL_PROFILE'),
  schoolName: z.string(),
  schoolType: SchoolTypeEnum,
});

export const ClaimDomainEventSchema = z.object({
  type: z.literal('CLAIM_DOMAIN'),
  domain: z.string(),
});

export const AddFacultyInviteEventSchema = z.object({
  type: z.literal('ADD_FACULTY_INVITE'),
  email: z.string().email(),
});

export const ActivateSchoolEventSchema = z.object({
  type: z.literal('ACTIVATE_SCHOOL'),
});

export const ResetSetupEventSchema = z.object({
  type: z.literal('RESET_SETUP'),
});

export const StartSetupEventSchema = z.object({
  type: z.literal('START_SETUP'),
});

export const principalSetupMachine = setup({
  schemas: {
    context: PrincipalSetupContextSchema,
    events: {
      START_SETUP: StartSetupEventSchema,
      SET_SCHOOL_PROFILE: SetSchoolProfileEventSchema,
      CLAIM_DOMAIN: ClaimDomainEventSchema,
      ADD_FACULTY_INVITE: AddFacultyInviteEventSchema,
      ACTIVATE_SCHOOL: ActivateSchoolEventSchema,
      RESET_SETUP: ResetSetupEventSchema,
    },
  },
}).createMachine({
  id: 'principalSetup',
  initial: 'welcome',
  context: {
    schoolName: '',
    schoolType: 'k12',
    domain: '',
    facultyInvites: [],
    step: 0,
    isSubmitting: false,
    error: null,
  },
  states: {
    welcome: {
      on: {
        START_SETUP: () => ({
          target: 'school_profile',
          context: { step: 1 },
        }),
      },
    },
    school_profile: {
      on: {
        SET_SCHOOL_PROFILE: ({ context, event }) => {
          if (!event.schoolName.trim()) {
            return {
              target: 'school_profile',
              context: { error: 'School name is required' },
            };
          }
          return {
            target: 'domain_claim',
            context: {
              schoolName: event.schoolName.trim(),
              schoolType: event.schoolType,
              step: 2,
              error: null,
            },
          };
        },
      },
    },
    domain_claim: {
      on: {
        CLAIM_DOMAIN: ({ context, event }) => {
          const domain = event.domain.trim().toLowerCase();
          if (!domain || !domain.includes('.')) {
            return {
              target: 'domain_claim',
              context: { error: 'A valid institutional domain is required' },
            };
          }
          return {
            target: 'faculty_invites',
            context: {
              domain,
              step: 3,
              error: null,
            },
          };
        },
      },
    },
    faculty_invites: {
      on: {
        ADD_FACULTY_INVITE: ({ context, event }) => ({
          target: 'faculty_invites',
          context: {
            facultyInvites: [...context.facultyInvites, event.email.trim().toLowerCase()],
            error: null,
          },
        }),
        ACTIVATE_SCHOOL: ({ context }) => ({
          target: 'activated',
          context: {
            step: 4,
            isSubmitting: false,
            error: null,
          },
        }),
      },
    },
    activated: {
      on: {
        RESET_SETUP: () => ({
          target: 'welcome',
          context: {
            schoolName: '',
            schoolType: 'k12',
            domain: '',
            facultyInvites: [],
            step: 0,
            isSubmitting: false,
            error: null,
          },
        }),
      },
    },
  },
});

export type PrincipalSetupMachine = typeof principalSetupMachine;

// -----------------------------------------------------------------------------
// SNAPSHOT PERSISTENCE ENVELOPE (Crash-Proof Pause & Resume)
// -----------------------------------------------------------------------------

const PRINCIPAL_SETUP_SCHEMA_VERSION = 1;

export const PrincipalSnapshotEnvelopeSchema = z.object({
  version: z.number().int(),
  savedAt: z.iso.datetime(),
  snapshot: z.unknown(),
});

export function getPrincipalSetupStorageKey(userId?: string): string {
  return `principal_setup:v6:${userId || 'default'}:snapshot`;
}

export function savePrincipalSetupSnapshot(snapshot: unknown, userId?: string): void {
  const envelope = {
    version: PRINCIPAL_SETUP_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    snapshot,
  };
  storage.set(getPrincipalSetupStorageKey(userId), JSON.stringify(envelope));
}

export function loadPrincipalSetupSnapshot(userId?: string): unknown | null {
  const raw = storage.getString(getPrincipalSetupStorageKey(userId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const validated = PrincipalSnapshotEnvelopeSchema.safeParse(parsed);
    if (!validated.success || validated.data.version !== PRINCIPAL_SETUP_SCHEMA_VERSION) {
      storage.delete(getPrincipalSetupStorageKey(userId));
      return null;
    }
    return validated.data.snapshot;
  } catch {
    storage.delete(getPrincipalSetupStorageKey(userId));
    return null;
  }
}

export function clearPrincipalSetupSnapshot(userId?: string): void {
  storage.delete(getPrincipalSetupStorageKey(userId));
}

/**
 * Creates, restores, and starts the Principal Setup Actor.
 */
export function createPrincipalSetupActor(userId?: string) {
  const savedSnapshot = loadPrincipalSetupSnapshot(userId);

  const actor = createActor(principalSetupMachine, {
    snapshot: (savedSnapshot as never) ?? undefined,
  });

  actor.start();

  // Auto-persist snapshot on every state/context change
  actor.subscribe(() => {
    savePrincipalSetupSnapshot(actor.getPersistedSnapshot(), userId);
  });

  return actor;
}
