import { z } from 'zod';

const commercialCapability = 'workspace.provision-commercial-batch' as const;
const guardianCapability = 'workspace.request-guardian-link' as const;

const commercialInput = z.strictObject({
  idempotencyKey: z.uuid(),
  instituteId: z.uuid().nullable().optional(),
  subjectName: z.string().trim().min(1).max(160),
  gradeLevel: z.string().trim().min(1).max(80),
  medium: z.enum(['sinhala', 'english', 'tamil']),
  schedule: z.string().trim().min(1).max(240),
  monthlyFee: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  customAlias: z.string().trim().min(1).max(160).nullable().optional(),
  role: z.enum(['founder', 'lead_tutor', 'assistant_tutor', 'paper_marker']).optional(),
});

const guardianInput = z.strictObject({
  idempotencyKey: z.uuid(),
  studentId: z.uuid(),
  relationship: z.string().trim().min(1).max(80),
  schoolId: z.uuid().nullable().optional(),
  wardName: z.string().trim().min(1).max(160),
});

const settled = <T extends z.ZodType>(capability: string, result: T) =>
  z.strictObject({
    capability: z.literal(capability),
    operationId: z.uuid(),
    outcome: z.enum(['committed', 'replayed']),
    result,
  });

export const workspaceProvisioningORPCContract = {
  provisionCommercialBatch: {
    method: 'post',
    path: '/workspace-provisioning/commercial-batches',
    request: { body: commercialInput },
    responses: {
      200: {
        schema: settled(commercialCapability, z.strictObject({ batchId: z.uuid() })),
        description: 'Atomically creates or replays an account-owned commercial batch.',
      },
    },
    // This bootstrap-safe endpoint authenticates the actor and derives ownership server-side.
    metadata: { policy: { action: 'create', subject: 'User' } },
  },
  requestGuardianLink: {
    method: 'post',
    path: '/workspace-provisioning/guardian-links',
    request: { body: guardianInput },
    responses: {
      200: {
        schema: settled(guardianCapability, z.strictObject({ relationshipId: z.uuid() })),
        description: 'Atomically creates or replays a pending guardian-link request.',
      },
    },
    metadata: { policy: { action: 'create', subject: 'User' } },
  },
} as const;

export const WorkspaceProvisioningCapabilities = {
  commercialCapability,
  guardianCapability,
} as const;
