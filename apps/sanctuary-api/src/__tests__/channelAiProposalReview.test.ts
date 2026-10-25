import { describe, expect, it, vi } from 'vitest';
import { reviewChannelAiProposal } from '../core/channelAiProposalReview';

const accountId = '123e4567-e89b-8101-8000-426614174000';
const identityId = '123e4567-e89b-12d3-a456-426614174001';
const proposalId = '123e4567-e89b-8101-8000-426614174002';
const now = new Date('2026-10-15T00:00:00.000Z');

function proposalRow(overrides: Record<string, unknown> = {}) {
  return {
    id: proposalId,
    account_id: accountId,
    channel_identity_id: identityId,
    media_job_id: '123e4567-e89b-12d3-a456-426614174003',
    capability: 'classroom.lesson.draft',
    proposal_ref: 'channel-proposal:opaque-reference',
    payload_fingerprint: 'b'.repeat(64),
    status: 'confirmed',
    expires_at: '2026-10-16T00:00:00.000Z',
    confirmed_at: now,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

const request = {
  accountId,
  proposalId,
  payloadFingerprint: 'b'.repeat(64),
  decision: 'confirmed' as const,
  channelIdentityId: identityId,
};

describe('channel AI proposal human review persistence', () => {
  it('confirms only an owned, linked-identity proposal and persists confirmed_at', async () => {
    const query = vi.fn().mockResolvedValue([proposalRow()]);

    await expect(reviewChannelAiProposal(request, query)).resolves.toMatchObject({
      id: proposalId,
      accountId,
      channelIdentityId: identityId,
      status: 'confirmed',
      confirmedAt: now.toISOString(),
    });

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toContain("proposal.status = 'pending_confirmation'");
    expect(query.mock.calls[0]?.[0]).toContain('proposal.expires_at > now()');
    expect(query.mock.calls[0]?.[0]).toContain('identity.account_id = proposal.account_id');
    expect(query.mock.calls[0]?.[0]).toContain("identity.state = 'linked'");
    expect(query.mock.calls[0]?.[0]).toContain('identity.revoked_at is null');
    expect(query.mock.calls[0]?.[1]).toEqual([
      proposalId,
      accountId,
      request.payloadFingerprint,
      'confirmed',
      identityId,
    ]);
  });

  it('records rejection without a confirmation timestamp', async () => {
    const query = vi
      .fn()
      .mockResolvedValue([proposalRow({ status: 'rejected', confirmed_at: null })]);

    await expect(
      reviewChannelAiProposal({ ...request, decision: 'rejected' }, query),
    ).resolves.toMatchObject({ status: 'rejected', confirmedAt: null });
    expect(query.mock.calls[0]?.[1]?.[3]).toBe('rejected');
    expect(query.mock.calls[0]?.[0]).toContain('then now() else null end');
  });

  it.each([
    ['expired proposal', { expires_at: '2026-10-14T00:00:00.000Z' }],
    ['wrong payload fingerprint', {}, 'c'.repeat(64)],
    ['wrong account', { account_id: '123e4567-e89b-12d3-a456-426614174099' }],
    ['wrong or unlinked identity', { channel_identity_id: '123e4567-e89b-12d3-a456-426614174099' }],
  ])('returns no result for %s', async (_label, _rowOverrides, payloadFingerprint) => {
    const query = vi.fn().mockResolvedValue([]);
    const reviewRequest = payloadFingerprint ? { ...request, payloadFingerprint } : request;

    await expect(reviewChannelAiProposal(reviewRequest, query)).resolves.toBeNull();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('has no media, AI, or provider invocation seam', async () => {
    const query = vi.fn().mockResolvedValue([]);

    await reviewChannelAiProposal(request, query);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toContain('update public.channel_ai_proposals');
    expect(query.mock.calls[0]?.[0]).not.toMatch(/fetch|scan|provider|model|invoke/i);
  });
});
