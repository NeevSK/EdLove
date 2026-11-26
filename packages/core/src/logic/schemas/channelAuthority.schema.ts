import { z } from 'zod';

export const ChannelTransportSchema = z.enum(['web', 'mobile', 'whatsapp', 'telegram', 'agent']);

export const ExternalChannelProviderSchema = z.enum(['whatsapp', 'telegram']);

export const ChannelIdentityStateSchema = z.enum([
  'pending',
  'verified',
  'linked',
  'suspended',
  'revoked',
]);

export const ChannelLinkAttemptStatusSchema = z.enum([
  'pending',
  'confirmed',
  'expired',
  'revoked',
]);

export const ChannelConsentStatusSchema = z.enum(['active', 'revoked', 'expired']);

export const ChannelDelegationStatusSchema = z.enum(['active', 'revoked', 'expired']);

export const ChannelEndpointKindSchema = z.enum(['not_applicable', 'private', 'group', 'channel']);

export const ChannelInboundPayloadKindSchema = z.enum([
  'text',
  'audio',
  'image',
  'document',
  'video',
  'interactive',
  'status',
]);

export const ChannelIngressStatusSchema = z.enum([
  'accepted',
  'processing',
  'processed',
  'rejected',
  'failed',
]);

export const ChannelDeliveryStatusSchema = z.enum([
  'pending',
  'processing',
  'accepted',
  'delivered',
  'failed',
  'unknown',
  'cancelled',
]);

export const ChannelMediaJobStatusSchema = z.enum([
  'queued',
  'downloading',
  'scanning',
  'quarantined',
  'ready',
  'failed',
  'expired',
]);

export const ChannelAiProposalStatusSchema = z.enum([
  'pending_confirmation',
  'confirmed',
  'rejected',
  'expired',
  'failed',
]);

/** Scope attached to a consent or delegation grant, never inferred from a chat. */
export const ChannelResourceScopeSchema = z.strictObject({
  schoolId: z.uuid().optional(),
  resourceIds: z.array(z.uuid()).max(64).optional(),
});

const Sha256FingerprintSchema = z.string().regex(/^[a-f0-9]{64}$/i);

/**
 * Sanitised output of a provider adapter. `verificationRef` names a completed
 * provider verification step; it must never contain raw signature or token data.
 */
export const ChannelInboundEnvelopeSchema = z.strictObject({
  provider: ExternalChannelProviderSchema,
  providerEventId: z.string().min(1).max(256),
  replayKey: Sha256FingerprintSchema,
  externalSubjectKey: z.string().min(1).max(256),
  endpointKind: ChannelEndpointKindSchema,
  payloadKind: ChannelInboundPayloadKindSchema,
  verificationRef: z.string().min(1).max(160),
  payloadFingerprint: Sha256FingerprintSchema,
  receivedAt: z.iso.datetime(),
  correlationId: z.uuid(),
});

/**
 * Durable dispatch intent. Payload and recipient are stored behind server-side
 * references so receipts can be recovered without exposing content or addresses.
 */
export const ChannelDeliveryIntentSchema = z.strictObject({
  id: z.uuid(),
  accountId: z.uuid().nullable(),
  provider: ExternalChannelProviderSchema,
  channelIdentityId: z.uuid().nullable(),
  endpointKind: ChannelEndpointKindSchema,
  operationId: z.uuid().nullable(),
  capability: z.string().min(1).max(160),
  delegationAgentKey: z.string().min(1).max(160).nullable(),
  resourceScope: ChannelResourceScopeSchema,
  idempotencyKey: z.uuid(),
  payloadRef: z.string().min(1).max(256),
  status: ChannelDeliveryStatusSchema,
  expiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/**
 * Media workers may progress this record only through declared processing
 * states. The content remains behind `storageRef` until an explicit retention
 * policy promotes it.
 */
export const ChannelMediaJobSchema = z.strictObject({
  id: z.uuid(),
  ingressEventId: z.uuid(),
  accountId: z.uuid().nullable(),
  channelIdentityId: z.uuid().nullable(),
  mediaKind: z.enum(['audio', 'image', 'document', 'video']),
  storageRef: z.string().min(1).max(256),
  contentFingerprint: Sha256FingerprintSchema,
  status: ChannelMediaJobStatusSchema,
  expiresAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/**
 * AI output is a proposal reference until a separately bound human
 * confirmation settles a named capability through the normal Sanctuary API.
 */
export const ChannelAiProposalSchema = z.strictObject({
  id: z.uuid(),
  accountId: z.uuid().nullable(),
  channelIdentityId: z.uuid().nullable(),
  mediaJobId: z.uuid().nullable(),
  capability: z.string().min(1).max(160),
  proposalRef: z.string().min(1).max(256),
  payloadFingerprint: Sha256FingerprintSchema,
  status: ChannelAiProposalStatusSchema,
  expiresAt: z.iso.datetime(),
  confirmedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const ChannelIdentityLinkSchema = z.strictObject({
  id: z.uuid(),
  accountId: z.uuid().nullable(),
  provider: ExternalChannelProviderSchema,
  state: ChannelIdentityStateSchema,
  confirmedAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
});

export const ChannelLinkAttemptSchema = z
  .strictObject({
    id: z.uuid(),
    accountId: z.uuid(),
    provider: ExternalChannelProviderSchema,
    state: ChannelLinkAttemptStatusSchema,
    expiresAt: z.string().datetime(),
    consumedAt: z.string().datetime().nullable(),
  })
  .superRefine((attempt, context) => {
    if (attempt.consumedAt && attempt.state !== 'confirmed') {
      context.addIssue({
        code: 'custom',
        path: ['consumedAt'],
        message: 'Only a confirmed link attempt may be consumed.',
      });
    }
  });

/** Raw ceremony secret returned once to an authenticated Sanctuary session. */
export const ChannelLinkInitiationSchema = z.strictObject({
  id: z.uuid(),
  provider: ExternalChannelProviderSchema,
  linkToken: z.string().min(32).max(128),
  expiresAt: z.iso.datetime(),
});

export const ChannelConsentGrantSchema = z.strictObject({
  id: z.uuid(),
  accountId: z.uuid(),
  channelIdentityId: z.uuid(),
  purpose: z.string().min(1).max(120),
  capabilities: z.array(z.string().min(1).max(160)).min(1).max(64),
  resourceScope: ChannelResourceScopeSchema,
  status: ChannelConsentStatusSchema,
  expiresAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
});

export const ChannelDelegationSchema = z.strictObject({
  id: z.uuid(),
  accountId: z.uuid(),
  agentKey: z.string().min(1).max(160),
  capabilities: z.array(z.string().min(1).max(160)).min(1).max(64),
  resourceScope: ChannelResourceScopeSchema,
  status: ChannelDelegationStatusSchema,
  expiresAt: z.string().datetime().nullable(),
  revokedAt: z.string().datetime().nullable(),
});

export type ChannelTransport = z.infer<typeof ChannelTransportSchema>;
export type ExternalChannelProvider = z.infer<typeof ExternalChannelProviderSchema>;
export type ChannelIdentityState = z.infer<typeof ChannelIdentityStateSchema>;
export type ChannelEndpointKind = z.infer<typeof ChannelEndpointKindSchema>;
export type ChannelInboundEnvelope = z.infer<typeof ChannelInboundEnvelopeSchema>;
export type ChannelDeliveryIntent = z.infer<typeof ChannelDeliveryIntentSchema>;
export type ChannelMediaJob = z.infer<typeof ChannelMediaJobSchema>;
export type ChannelAiProposal = z.infer<typeof ChannelAiProposalSchema>;
export type ChannelIdentityLink = z.infer<typeof ChannelIdentityLinkSchema>;
export type ChannelLinkAttempt = z.infer<typeof ChannelLinkAttemptSchema>;
export type ChannelLinkInitiation = z.infer<typeof ChannelLinkInitiationSchema>;
export type ChannelConsentGrant = z.infer<typeof ChannelConsentGrantSchema>;
export type ChannelDelegation = z.infer<typeof ChannelDelegationSchema>;
export type ChannelResourceScope = z.infer<typeof ChannelResourceScopeSchema>;
