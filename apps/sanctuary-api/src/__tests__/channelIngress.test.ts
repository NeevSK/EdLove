import { describe, expect, it, vi } from 'vitest';
import { persistChannelIngress } from '../core/channelIngress';

const envelope = {
  provider: 'whatsapp' as const,
  providerEventId: 'wamid.example',
  replayKey: 'a'.repeat(64),
  externalSubjectKey: 'b'.repeat(64),
  endpointKind: 'not_applicable' as const,
  payloadKind: 'text' as const,
  verificationRef: 'meta_hmac_sha256_v1',
  payloadFingerprint: 'c'.repeat(64),
  receivedAt: '2026-10-15T00:00:00.000Z',
  correlationId: '123e4567-e89b-8101-8000-426614174000',
};

describe('durable channel ingress acceptance', () => {
  it('persists only validated fingerprints and atomically reports acceptance', async () => {
    const query = vi.fn().mockResolvedValue([{ id: 'accepted' }]);

    await expect(persistChannelIngress(envelope, query)).resolves.toBe('accepted');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('on conflict do nothing'),
      expect.arrayContaining([
        envelope.externalSubjectKey,
        envelope.providerEventId,
        envelope.replayKey,
        envelope.payloadFingerprint,
      ]),
    );
  });

  it('treats a conflicting provider event as a duplicate rather than new work', async () => {
    await expect(persistChannelIngress(envelope, vi.fn().mockResolvedValue([]))).resolves.toBe(
      'duplicate',
    );
  });
});
