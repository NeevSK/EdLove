import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';
import { RoleSchema } from './role.schema';

/**
 * UserSchema - Base entity for a user in the sanctuary.
 * Derived from ZenStack Model Schema + App-specific extensions.
 */
export const UserSchema = makeModelSchema('User').extend({
  // App-specific singular role (Legacy)
  role: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const TenantKindSchema = z.enum(['internal', 'customer', 'demo', 'sandbox']);

export const UserContextSchema = z.object({
  userId: z.uuid().nullable(),
  email: z.email().nullable(),
  schoolId: z.uuid().nullable(), // Null if 2nd class citizen
  tenancyName: z.string().nullable().default(null),
  tenancy: z
    .object({
      kind: TenantKindSchema,
      isPersonal: z.boolean(),
    })
    .nullable()
    .default(null),
  tenantKind: TenantKindSchema.default('customer'),
  roles: z.array(RoleSchema).default([]),
  authority: RoleSchema.nullable().default(null),

  // Scoped context for 1st class citizens
  sectionId: z.uuid().nullable().optional(),
  gradeId: z.uuid().nullable().optional(),
  classroomId: z.uuid().nullable().optional(),

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
      roles: ['teacher'],
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
