import { storage } from '@repo/core/lib/storage.adapter';
import { type SchoolLevel, SchoolLevelSchema } from '@repo/core/logic/schemas/school.schema';
import { startPersistedActor } from '@repo/core/store/persistedActor';
import { setup } from 'xstate';
import { z } from 'zod';

// The stage of schooling, from the one school contract in core.
export const SchoolTypeEnum = SchoolLevelSchema;
export type SchoolType = SchoolLevel;

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
  // Bump when states, context or events change. Saved setups of another version start fresh
  // unless a `migrate` function is added here.
  version: '1',
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

// Persistence (crash-proof pause and resume). The snapshot is XState's own, stamped with the
// machine's `{ id, version }`; `startPersistedActor` decides whether a stored one is usable.

export function getPrincipalSetupStorageKey(userId?: string): string {
  return `principal_setup:v6:${userId || 'default'}:snapshot`;
}

export function savePrincipalSetupSnapshot(snapshot: unknown, userId?: string): void {
  storage.set(getPrincipalSetupStorageKey(userId), JSON.stringify(snapshot));
}

export function loadPrincipalSetupSnapshot(userId?: string): unknown | null {
  const raw = storage.getString(getPrincipalSetupStorageKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    storage.delete(getPrincipalSetupStorageKey(userId));
    return null;
  }
}

export function clearPrincipalSetupSnapshot(userId?: string): void {
  storage.delete(getPrincipalSetupStorageKey(userId));
}

/** Starts the principal's setup where they left off, or fresh, and keeps it saved. */
export function createPrincipalSetupActor(userId?: string) {
  return startPersistedActor(principalSetupMachine, {
    load: () => loadPrincipalSetupSnapshot(userId),
    save: (snapshot) => savePrincipalSetupSnapshot(snapshot, userId),
    drop: () => clearPrincipalSetupSnapshot(userId),
  });
}
