import {
  ChannelAiProposalSchema,
  ChannelConsentGrantSchema,
  ChannelDelegationSchema,
  ChannelDeliveryIntentSchema,
  ChannelIdentityLinkSchema,
  ChannelInboundEnvelopeSchema,
  ChannelLinkAttemptSchema,
  ChannelMediaJobSchema,
} from '@repo/core/logic/omnichannel/channelAuthority';
import { describe, expect, it } from 'vitest';

const accountId = '123e4567-e89b-12d3-a456-426614174000';
const identityId = '123e4567-e89b-12d3-a456-426614174001';
const now = '2026-10-15T00:00:00.000Z';

describe('omnichannel authority contracts', () => {
  it('keeps the external identity distinct from the canonical account', () => {
    expect(
      ChannelIdentityLinkSchema.parse({
        id: identityId,
        accountId,
        provider: 'whatsapp',
        state: 'linked',
        confirmedAt: now,
        revokedAt: null,
      }),
    ).toMatchObject({ accountId, provider: 'whatsapp', state: 'linked' });
  });

  it('does not permit a consumed link attempt without confirmation', () => {
    expect(
      ChannelLinkAttemptSchema.safeParse({
        id: identityId,
        accountId,
        provider: 'telegram',
        state: 'pending',
        expiresAt: now,
        consumedAt: now,
      }).success,
    ).toBe(false);
    expect(
      ChannelLinkAttemptSchema.safeParse({
        id: identityId,
        accountId,
        provider: 'telegram',
        state: 'confirmed',
        expiresAt: now,
        consumedAt: now,
      }).success,
    ).toBe(true);
  });

  it('requires named, bounded capability grants for consent and delegation', () => {
    const consent = {
      id: identityId,
      accountId,
      channelIdentityId: identityId,
      purpose: 'teacher_lesson_drafts',
      capabilities: ['classroom.lesson.draft'],
      resourceScope: {},
      status: 'active',
      expiresAt: null,
      revokedAt: null,
    };
    expect(ChannelConsentGrantSchema.safeParse(consent).success).toBe(true);
    expect(ChannelConsentGrantSchema.safeParse({ ...consent, capabilities: [] }).success).toBe(
      false,
    );

    expect(
      ChannelDelegationSchema.safeParse({
        id: identityId,
        accountId,
        agentKey: 'teacher-assistant-v1',
        capabilities: ['classroom.lesson.draft'],
        resourceScope: {},
        status: 'active',
        expiresAt: now,
        revokedAt: null,
      }).success,
    ).toBe(true);
  });

  it('keeps consent and delegation scopes closed to declared keys and bounded ids', () => {
    const scopedGrant = {
      id: identityId,
      accountId,
      channelIdentityId: identityId,
      purpose: 'teacher_lesson_drafts',
      capabilities: ['classroom.lesson.draft'],
      resourceScope: {
        schoolId: accountId,
        resourceIds: [identityId],
      },
      status: 'active',
      expiresAt: null,
      revokedAt: null,
    };
    expect(ChannelConsentGrantSchema.safeParse(scopedGrant).success).toBe(true);
    expect(
      ChannelConsentGrantSchema.safeParse({
        ...scopedGrant,
        resourceScope: { schoolId: accountId, unexpected: 'not-a-scope' },
      }).success,
    ).toBe(false);
    expect(
      ChannelDelegationSchema.safeParse({
        id: identityId,
        accountId,
        agentKey: 'teacher-assistant-v1',
        capabilities: ['classroom.lesson.draft'],
        resourceScope: { resourceIds: Array.from({ length: 65 }, () => identityId) },
        status: 'active',
        expiresAt: null,
        revokedAt: null,
      }).success,
    ).toBe(false);
  });

  it('accepts a sanitised ingress envelope but rejects raw-looking replay keys', () => {
    expect(
      ChannelInboundEnvelopeSchema.safeParse({
        provider: 'whatsapp',
        providerEventId: 'wamid.example',
        replayKey: 'a'.repeat(64),
        externalSubjectKey: 'provider-subject-reference',
        endpointKind: 'private',
        payloadKind: 'audio',
        verificationRef: 'meta-webhook-verified',
        payloadFingerprint: 'b'.repeat(64),
        receivedAt: now,
        correlationId: accountId,
      }).success,
    ).toBe(true);
    expect(
      ChannelInboundEnvelopeSchema.safeParse({
        provider: 'whatsapp',
        providerEventId: 'wamid.example',
        replayKey: 'raw-provider-token',
        externalSubjectKey: 'provider-subject-reference',
        endpointKind: 'private',
        payloadKind: 'audio',
        verificationRef: 'meta-webhook-verified',
        payloadFingerprint: 'b'.repeat(64),
        receivedAt: now,
        correlationId: accountId,
      }).success,
    ).toBe(false);
  });

  it('models delivery as a recoverable intent rather than an optimistic send', () => {
    expect(
      ChannelDeliveryIntentSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174003',
        accountId,
        provider: 'telegram',
        channelIdentityId: identityId,
        endpointKind: 'private',
        operationId: null,
        capability: 'channel.delivery',
        delegationAgentKey: null,
        resourceScope: {},
        idempotencyKey: '123e4567-e89b-12d3-a456-426614174002',
        payloadRef: 'channel-payload:opaque-reference',
        status: 'unknown',
        expiresAt: null,
        createdAt: now,
        updatedAt: now,
      }).success,
    ).toBe(true);
  });

  it('keeps media processing and AI output in non-authoritative states', () => {
    const job = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      ingressEventId: identityId,
      accountId: null,
      channelIdentityId: identityId,
      mediaKind: 'audio',
      storageRef: 'channel-media:opaque-reference',
      contentFingerprint: 'c'.repeat(64),
      status: 'quarantined',
      expiresAt: '2026-10-16T00:00:00.000Z',
      createdAt: now,
      updatedAt: now,
    };
    expect(ChannelMediaJobSchema.safeParse(job).success).toBe(true);
    expect(
      ChannelAiProposalSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174004',
        accountId: null,
        channelIdentityId: identityId,
        mediaJobId: job.id,
        capability: 'classroom.lesson.draft',
        proposalRef: 'channel-proposal:opaque-reference',
        payloadFingerprint: 'd'.repeat(64),
        status: 'pending_confirmation',
        expiresAt: '2026-10-16T00:00:00.000Z',
        confirmedAt: null,
        createdAt: now,
        updatedAt: now,
      }).success,
    ).toBe(true);
  });
});
