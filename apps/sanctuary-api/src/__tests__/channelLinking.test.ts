import { describe, expect, it, vi } from 'vitest';
import { confirmProviderChannelLink } from '../core/channelLinking';

const confirmation = {
  provider: 'whatsapp' as const,
  externalSubjectKey: 'a'.repeat(64),
  linkToken: 'x'.repeat(43),
};

describe('provider channel-link confirmation', () => {
  it('atomically consumes a hash-bound ceremony and binds only an unlinked verified identity', async () => {
    const query = vi.fn().mockResolvedValue([{ identity_id: 'linked' }]);

    await expect(confirmProviderChannelLink(confirmation, query)).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('with consumed_attempt as'), [
      'whatsapp',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      confirmation.externalSubjectKey,
    ]);
    expect(query.mock.calls[0]?.[1]?.[1]).not.toBe(confirmation.linkToken);
    expect(query.mock.calls[0]?.[0]).toContain('identity.account_id is null');
    expect(query.mock.calls[0]?.[0]).toContain("identity.state = 'verified'");
  });

  it('has one non-enumerating false outcome for expired, reused, or conflicting ceremonies', async () => {
    await expect(
      confirmProviderChannelLink(confirmation, vi.fn().mockResolvedValue([])),
    ).resolves.toBe(false);
  });
});
