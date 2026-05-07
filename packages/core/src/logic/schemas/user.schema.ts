import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';
import { BondSchema, CapacitySchema } from './identity.schema';

const sanctuaryDateTime = z.coerce.date().transform((d) => d.toISOString());

/**
 * UserSchema - Base entity for a user in the sanctuary.
 * Derived from ZenStack Model Schema + App-specific extensions.
 */
export const UserSchema = makeModelSchema('User').extend({
  created_at: sanctuaryDateTime,
  updated_at: sanctuaryDateTime.optional(),
  deleted_at: sanctuaryDateTime.optional().nullable(),
  onboarding_completed_at: sanctuaryDateTime.optional().nullable(),
  last_seen_at: sanctuaryDateTime.optional().nullable(),
}).catchall(z.unknown());

export type User = z.infer<typeof UserSchema>;

export const TenantKindSchema = z.enum(['internal', 'customer', 'demo', 'sandbox']);

export const UserContextSchema = z.object({
  user_id: z.string().uuid().nullish().default(null),
  userId: z.string().uuid().nullish().default(null),
  email: z.string().email().nullish().default(null),
  
  // Sovereign ReBAC Context
  // 1. The Reality: All active relationships (The Union of Identity)
  bonds: z.array(BondSchema).nullish().transform((value) => value ?? []),

  // 2. The Anchor: The primary identity chosen during onboarding (Mental Model)
  primary_capacity: z.string().nullish().default(null),
  primaryCapacity: z.string().nullish().default(null),

  // 3. The Focus: The currently selected workspace/perspective
  active_bond: BondSchema.nullish().default(null),
  activeBond: BondSchema.nullish().default(null),
  active_bond_status: z.string().nullish().default(null),
  role: CapacitySchema.nullish().default(null),
  traits: z.array(z.string()).nullish().default([]),
  
  school_id: z.string().uuid().nullish().default(null), // Null if 2nd class citizen
  schoolId: z.string().uuid().nullish().default(null),
  tenancy_name: z.string().nullish().default(null),
  tenancy: z
    .object({
      kind: TenantKindSchema.default('customer'),
      is_personal: z.boolean().default(false),
    })
    .nullish()
    .default(null),
  tenant_kind: TenantKindSchema.nullish().default('customer'),

  // Scoped context for 1st class citizens
  section_id: z.string().uuid().nullish().default(null),
  grade_id: z.string().uuid().nullish().default(null),
  classroom_id: z.string().uuid().nullish().default(null),

  // Metadata & Flags
  is_anonymous: z.boolean().nullish().default(false),
  isAnonymous: z.boolean().nullish().default(false),
  has_global_access: z.boolean().nullish().default(false), // e.g. Founder/Developer
  is_personal: z.boolean().nullish().default(false),

  tier: z.string().nullish().default('free'),
  features: z.array(z.string()).nullish().transform((value) => value ?? []),
  flags: z
    .record(z.string(), z.union([z.boolean(), z.string()]))
    .nullish()
    .transform((value) => value ?? {}),
});

export type UserContext = z.infer<typeof UserContextSchema>;
export type TenantKind = z.infer<typeof TenantKindSchema>;

if ((import.meta as any).vitest) {
  const { it, expect } = (import.meta as any).vitest;
  it('validates a correct user object', () => {
    const validUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      full_name: 'John Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(UserSchema.parse(validUser)).toMatchObject(validUser);
  });

  it('fails on invalid uuid', () => {
    const invalidUser = {
      id: 'not-a-uuid',
      full_name: 'John Doe',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(() => UserSchema.parse(invalidUser)).toThrow();
  });
}
