import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';
import { BondSchema, CapacitySchema, IdentityStateSchema } from './identity.schema';

const sanctuaryDateTime = z.coerce.date().transform((d) => d.toISOString());

/**
 * UserSchema - Base entity for a user in the sanctuary.
 * Derived from ZenStack Model Schema + App-specific extensions.
 */
export const UserSchema = makeModelSchema('User')
  .extend({
    created_at: sanctuaryDateTime,
    updated_at: sanctuaryDateTime.optional(),
    deleted_at: sanctuaryDateTime.optional().nullable(),
    onboarding_completed_at: sanctuaryDateTime.optional().nullable(),
    last_seen_at: sanctuaryDateTime.optional().nullable(),
    display_name: z.string().nullish().default(null),
    identity_state: IdentityStateSchema.nullish().default('anonymous'),
  })
  .catchall(z.unknown());

export type User = z.infer<typeof UserSchema>;

export const TenantKindSchema = z.enum(['internal', 'customer', 'demo', 'sandbox']);

const normalizeUserContextInput = (value: unknown) => {
  if (!value || typeof value !== 'object') return value;
  const input = value as Record<string, unknown>;

  return {
    ...input,
    userId: input.userId ?? null,
    primaryCapacity: input.primaryCapacity ?? null,
    activeBond: input.activeBond ?? null,
    schoolId: input.schoolId ?? null,
    tenancyName: input.tenancyName ?? null,
    tenantKind: input.tenantKind ?? 'customer',
    sectionId: input.sectionId ?? null,
    gradeId: input.gradeId ?? null,
    classroomId: input.classroomId ?? null,
    isAnonymous: input.isAnonymous ?? false,
    hasGlobalAccess: input.hasGlobalAccess ?? false,
    isPersonal: input.isPersonal ?? false,
  };
};

export const UserContextSchema = z.preprocess(
  normalizeUserContextInput,
  z.object({
    userId: z.string().uuid().nullish().default(null),
    email: z.string().email().nullish().default(null),

    // Sovereign ReBAC Context
    bonds: z
      .array(BondSchema)
      .nullish()
      .transform((value) => value ?? []),

    primaryCapacity: z.string().nullish().default(null),
    activeBond: BondSchema.nullish().default(null),
    capacity: CapacitySchema.nullish().default(null),
    traits: z.array(z.string()).nullish().default([]),

    schoolId: z.string().uuid().nullish().default(null),
    tenancyName: z.string().nullish().default(null),
    tenancy: z
      .object({
        kind: TenantKindSchema.default('customer'),
        isPersonal: z.boolean().default(false),
      })
      .nullish()
      .default(null),
    tenantKind: TenantKindSchema.nullish().default('customer'),

    sectionId: z.string().uuid().nullish().default(null),
    gradeId: z.string().uuid().nullish().default(null),
    classroomId: z.string().uuid().nullish().default(null),

    // Metadata & Flags
    isAnonymous: z.boolean().nullish().default(false),
    hasGlobalAccess: z.boolean().nullish().default(false),
    isPersonal: z.boolean().nullish().default(false),

    tier: z.string().nullish().default('free'),
    citizenship: z.enum(['WANDERER', 'SECOND_CLASS', 'FIRST_CLASS']).default('WANDERER'),
    pricing_tier: z.enum(['FREE', 'PRO', 'INSTITUTIONAL']).default('FREE'),
    features: z
      .array(z.string())
      .nullish()
      .transform((value) => value ?? []),
    flags: z
      .record(z.string(), z.union([z.boolean(), z.string()]))
      .nullish()
      .transform((value) => value ?? {}),
  }),
);

export type UserContext = z.infer<typeof UserContextSchema>;
export type TenantKind = z.infer<typeof TenantKindSchema>;

if ((import.meta as any).vitest) {
  const { it, expect } = (import.meta as any).vitest;
  it('validates a correct user object', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      display_name: 'John Doe',
      full_name: 'John Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(UserSchema.parse(validUser)).toMatchObject(validUser);
  });

  it('fails on invalid uuid', () => {
    const invalidUser = {
      id: 'not-a-uuid',
      display_name: 'John Doe',
      full_name: 'John Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });
}
