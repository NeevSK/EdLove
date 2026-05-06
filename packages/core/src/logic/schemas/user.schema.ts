import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

/**
 * UserSchema - Base entity for a user in the sanctuary.
 * Derived from ZenStack Model Schema + App-specific extensions.
 */
export const UserSchema = makeModelSchema('User');

export type User = z.infer<typeof UserSchema>;

export const TenantKindSchema = z.enum(['internal', 'customer', 'demo', 'sandbox']);

import { BondSchema } from './identity.schema';

export const UserContextSchema = z.object({
  userId: z.string().uuid().nullable(),
  email: z.string().email().nullable(),
  
  // Sovereign ReBAC Context
  // 1. The Reality: All active relationships (The Union of Identity)
  bonds: z.array(BondSchema).default([]),

  // 2. The Anchor: The primary identity chosen during onboarding (Mental Model)
  primaryCapacity: z.string().nullable().default(null),

  // 3. The Focus: The currently selected workspace/perspective
  activeBond: BondSchema.nullable(),
  activeBondStatus: z.enum(['active', 'archived', 'pending']).nullable().default('active'),
  
  schoolId: z.string().uuid().nullable(), // Null if 2nd class citizen
  tenancyName: z.string().nullable().default(null),
  tenancy: z
    .object({
      kind: TenantKindSchema,
      isPersonal: z.boolean(),
    })
    .nullable()
    .default(null),
  tenantKind: TenantKindSchema.default('customer'),

  // Scoped context for 1st class citizens
  sectionId: z.string().uuid().nullable().optional(),
  gradeId: z.string().uuid().nullable().optional(),
  classroomId: z.string().uuid().nullable().optional(),

  // Metadata & Flags
  isAnonymous: z.boolean().default(false),
  hasGlobalAccess: z.boolean().default(false), // e.g. Founder/Developer
  isPersonal: z.boolean().default(false),

  tier: z.string().nullable().default('free'),
  features: z.array(z.string()).default([]),
  flags: z.record(z.string(), z.union([z.boolean(), z.string()])).default({}),
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
