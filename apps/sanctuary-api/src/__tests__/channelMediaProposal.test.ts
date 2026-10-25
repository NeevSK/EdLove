import { describe, expect, it, vi } from 'vitest';
import { createChannelAiProposal, queueChannelMediaJob } from '../core/channelMediaProposal';

const accountId = '123e4567-e89b-8101-8000-426614174000';
const identityId = '123e4567-e89b-12d3-a456-426614174001';
const ingressEventId = '123e4567-e89b-8101-8000-426614174002';
const mediaJobId = '123e4567-e89b-12d3-a456-426614174003';
const now = new Date('2026-10-15T00:00:00.000Z');
const expiresAt = '2026-10-16T00:00:00.000Z';

describe('channel media and AI proposal persistence', () => {
  it('queues an unprocessed media job without interpreting its content', async () => {
    const query = vi.fn().mockResolvedValue([
      {
        id: mediaJobId,
        ingress_event_id: ingressEventId,
        account_id: accountId,
        channel_identity_id: identityId,
        media_kind: 'audio',
        storage_ref: 'channel-media:opaque-reference',
        content_fingerprint: 'a'.repeat(64),
        status: 'queued',
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      },
    ]);

    await expect(
      queueChannelMediaJob(
        {
          ingressEventId,
          accountId,
          channelIdentityId: identityId,
          mediaKind: 'audio',
          storageRef: 'channel-media:opaque-reference',
          contentFingerprint: 'a'.repeat(64),
          expiresAt,
        },
        query,
      ),
    ).resolves.toMatchObject({ status: 'queued', mediaKind: 'audio' });
    expect(query).toHaveBeenCalledWith(expect.stringContaining("'queued'"), expect.any(Array));
  });

  it('creates a proposal only from an unexpired ready media job', async () => {
    const query = vi.fn().mockResolvedValue([
      {
        id: '123e4567-e89b-12d3-a456-426614174004',
        account_id: accountId,
        channel_identity_id: identityId,
        media_job_id: mediaJobId,
        capability: 'classroom.lesson.draft',
        proposal_ref: 'channel-proposal:opaque-reference',
        payload_fingerprint: 'b'.repeat(64),
        status: 'pending_confirmation',
        expires_at: expiresAt,
        confirmed_at: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    await expect(
      createChannelAiProposal(
        {
          accountId,
          channelIdentityId: identityId,
          mediaJobId,
          capability: 'classroom.lesson.draft',
          proposalRef: 'channel-proposal:opaque-reference',
          payloadFingerprint: 'b'.repeat(64),
          expiresAt,
        },
        query,
      ),
    ).resolves.toMatchObject({ status: 'pending_confirmation', mediaJobId });
    expect(query.mock.calls[0]?.[0]).toContain("media_job.status = 'ready'");
    expect(query.mock.calls[0]?.[0]).toContain('media_job.expires_at > now()');
  });

  it('does not create a proposal when the media job is not ready', async () => {
    await expect(
      createChannelAiProposal(
        {
          accountId,
          channelIdentityId: identityId,
          mediaJobId,
          capability: 'classroom.lesson.draft',
          proposalRef: 'channel-proposal:opaque-reference',
          payloadFingerprint: 'b'.repeat(64),
          expiresAt,
        },
        vi.fn().mockResolvedValue([]),
      ),
    ).resolves.toBeNull();
  });
});
