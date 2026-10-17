import { describe, expect, it, vi } from 'vitest';
import { CLOUDFLARE_DOH_ENDPOINTS, SanctuaryShieldService } from './SanctuaryShieldService';

describe('SanctuaryShieldService (Zero-Penny Cloudflare DoH Protection)', () => {
  it('initializes with default Family safety mode (1.1.1.3)', () => {
    const shield = new SanctuaryShieldService();
    expect(shield.getMode()).toBe('family');
    expect(shield.isEnabled()).toBe(true);
    expect(CLOUDFLARE_DOH_ENDPOINTS.family).toBe('https://family.cloudflare-dns.com/dns-query');
  });

  it('correctly formats and dispatches Cloudflare DoH JSON queries', async () => {
    const shield = new SanctuaryShieldService({ mode: 'family' });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 0,
        Answer: [{ name: 'moe.gov.lk', type: 1, data: '192.248.32.1', TTL: 300 }],
      }),
    });

    const res = await shield.resolve('moe.gov.lk', 'A', mockFetch as any);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://family.cloudflare-dns.com/dns-query?name=moe.gov.lk&type=A',
      expect.objectContaining({
        headers: { Accept: 'application/dns-json' },
      }),
    );
    expect(res.Status).toBe(0);
    expect(res.Answer?.[0]?.data).toBe('192.248.32.1');
  });

  it('evaluates legitimate educational domain as safe', async () => {
    const shield = new SanctuaryShieldService({ mode: 'family' });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 0,
        Answer: [{ name: 'school.edu.lk', type: 1, data: '104.21.50.12', TTL: 300 }],
      }),
    });

    const evaluation = await shield.evaluateDomainSafety('school.edu.lk', mockFetch as any);

    expect(evaluation.isSafe).toBe(true);
    expect(evaluation.reason).toBe('resolved');
    expect(evaluation.ipAddresses).toContain('104.21.50.12');
  });

  it('flags domain as blocked when Cloudflare Family returns 0.0.0.0 sinkhole', async () => {
    const shield = new SanctuaryShieldService({ mode: 'family' });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 0,
        Answer: [{ name: 'harmful-gambling-site.com', type: 1, data: '0.0.0.0', TTL: 60 }],
      }),
    });

    const evaluation = await shield.evaluateDomainSafety(
      'harmful-gambling-site.com',
      mockFetch as any,
    );

    expect(evaluation.isSafe).toBe(false);
    expect(evaluation.reason).toBe('malware_or_adult_blocked');
    expect(evaluation.ipAddresses).toContain('0.0.0.0');
  });

  it('handles NXDOMAIN nonexistent domains safely', async () => {
    const shield = new SanctuaryShieldService({ mode: 'family' });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Status: 3, // NXDOMAIN
      }),
    });

    const evaluation = await shield.evaluateDomainSafety(
      'completely-fake-domain-12345.lk',
      mockFetch as any,
    );

    expect(evaluation.isSafe).toBe(false);
    expect(evaluation.reason).toBe('nxdomain');
  });
});
