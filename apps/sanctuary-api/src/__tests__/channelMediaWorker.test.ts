import { describe, expect, it, vi } from 'vitest';
import {
  claimNextChannelMediaJob,
  recordChannelMediaScanDecision,
} from '../core/channelMediaWorker';

const mediaJobId = '123e4567-e89b-12d3-a456-426614174003';
const ingressEventId = '123e4567-e89b-12d3-a456-426614174002';
const now = new Date('2026-10-15T00:00:00.000Z');

const claimedJob = {
  id: mediaJobId,
  ingress_event_id: ingressEventId,
  account_id: null,
  channel_identity_id: null,
  media_kind: 'audio' as const,
  storage_ref: 'channel-media:opaque-reference',
  content_fingerprint: 'a'.repeat(64),
  status: 'downloading' as const,
  expires_at: '2026-10-16T00:00:00.000Z',
  created_at: now,
  updated_at: now,
};

describe('channel media worker state machine', () => {
  it('atomically claims one queued, unexpired job and cannot claim it twice', async () => {
    const query = vi.fn().mockResolvedValueOnce([claimedJob]).mockResolvedValueOnce([]);

    await expect(claimNextChannelMediaJob({ now, leaseSeconds: 60 }, query)).resolves.toMatchObject(
      {
        job: { id: mediaJobId, status: 'downloading' },
        processingToken: expect.any(String),
      },
    );
    await expect(claimNextChannelMediaJob({ now, leaseSeconds: 60 }, query)).resolves.toBeNull();

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0]?.[0]).toContain('for update skip locked');
    expect(query.mock.calls[0]?.[0]).toContain("status = 'queued'");
    expect(query.mock.calls[0]?.[0]).toContain('expires_at >');
  });

  it('does not claim an expired queued job', async () => {
    const query = vi.fn().mockResolvedValue([]);

    await expect(claimNextChannelMediaJob({ now, leaseSeconds: 60 }, query)).resolves.toBeNull();

    expect(query.mock.calls[0]?.[0]).toContain('expires_at >');
    expect(query.mock.calls[0]?.[1]).toContain(now.toISOString());
  });

  it('marks a clean scan ready only from the expected downloading claim', async () => {
    const query = vi
      .fn()
      .mockResolvedValue([{ ...claimedJob, status: 'ready' as const, updated_at: now }]);

    await expect(
      recordChannelMediaScanDecision(
        {
          jobId: mediaJobId,
          processingToken: '123e4567-e89b-12d3-a456-426614174004',
          status: 'ready',
          errorCode: null,
          now,
        },
        query,
      ),
    ).resolves.toMatchObject({
      id: mediaJobId,
      status: 'ready',
    });

    expect(query.mock.calls[0]?.[1]).toContain('ready');
    expect(query.mock.calls[0]?.[0]).toContain("and status = 'downloading'");
  });

  it('quarantines a scan result without exposing scanner details', async () => {
    const query = vi
      .fn()
      .mockResolvedValue([{ ...claimedJob, status: 'quarantined' as const, updated_at: now }]);
    await expect(
      recordChannelMediaScanDecision(
        {
          jobId: mediaJobId,
          processingToken: '123e4567-e89b-12d3-a456-426614174004',
          status: 'quarantined',
          errorCode: 'MEDIA_SCAN_REJECTED',
          now,
        },
        query,
      ),
    ).resolves.toMatchObject({ id: mediaJobId, status: 'quarantined' });

    expect(query.mock.calls[0]?.[1]).toContain('quarantined');
    expect(query.mock.calls[0]?.[0]).not.toContain('MEDIA_SCAN_REJECTED');
  });

  it('returns null and performs no terminal transition when the claim is stale', async () => {
    const query = vi.fn().mockResolvedValue([]);
    await expect(
      recordChannelMediaScanDecision(
        {
          jobId: mediaJobId,
          processingToken: '123e4567-e89b-12d3-a456-426614174004',
          status: 'ready',
          errorCode: null,
          now,
        },
        query,
      ),
    ).resolves.toBeNull();

    expect(query.mock.calls[0]?.[0]).toContain("and status = 'downloading'");
  });
});
