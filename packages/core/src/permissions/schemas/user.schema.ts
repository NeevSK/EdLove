import { z } from 'zod';
import { RoleSchema } from './role.schema';

export const TenantKindSchema = z.enum(['internal', 'customer', 'demo', 'sandbox']);

export const UserContextSchema = z.object({
  userId: z.string().uuid().nullable(),
  email: z.string().email().nullable(),
  schoolId: z.string().uuid().nullable(), // Null if 2nd class citizen
  tenancyName: z.string().nullable().default(null),
  tenancy: z.object({
    kind: TenantKindSchema,
    isPersonal: z.boolean(),
  }).nullable().default(null),
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
});

export type UserContext = z.infer<typeof UserContextSchema>;
export type TenantKind = z.infer<typeof TenantKindSchema>;
