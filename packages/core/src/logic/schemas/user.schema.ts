/// <reference types="vitest/importMeta" />
import { z } from 'zod';
import { RoleSchema } from './role.schema';

/**
 * UserSchema - Base entity for a user in the sanctuary.
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().email().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  authority: z.string().nullable().optional(), // POA Role
  roles: z.array(z.string()).default([]),
  school_id: z.string().uuid().nullable().optional(), // Added for tenancy healing
  created_at: z.string(),
  updated_at: z.string(),
  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),
});

export type User = z.infer<typeof UserSchema>;

export const TenantKindSchema = z.enum(['internal', 'customer', 'demo', 'sandbox']);

export const UserContextSchema = z.object({
  userId: z.string().uuid().nullable(),
  email: z.string().email().nullable(),
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
  roles: z.array(RoleSchema).default([]),
  authority: RoleSchema.nullable().default(null),

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

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
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

