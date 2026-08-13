import { z } from 'zod';

/** Shared policy metadata carried by every Sovereign API route. */
export const POAMetadataSchema = z.object({
  policy: z.object({
    action: z.enum([
      'manage',
      'create',
      'read',
      'update',
      'delete',
      'submit',
      'verify',
      'grade',
      'resolve',
      'publish',
      'override',
      'use_ai',
    ]),
    subject: z.string(),
  }),
  entitlement: z
    .object({
      tierAtLeast: z.enum(['FREE', 'PRO', 'INSTITUTIONAL']).optional(),
      modulesAllOf: z.array(z.string().min(1)).optional(),
      scope: z.enum(['individual', 'active_bond', 'active_entity', 'add_on']).optional(),
    })
    .optional(),
});

export type POAMetadata = z.infer<typeof POAMetadataSchema>;

export interface SovereignRoute {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  summary?: string;
  request?: {
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
    headers?: z.ZodTypeAny;
  };
  responses: Record<number, { schema: z.ZodTypeAny; description: string }>;
  metadata: POAMetadata;
}

export type SovereignContract = Record<string, SovereignRoute>;
