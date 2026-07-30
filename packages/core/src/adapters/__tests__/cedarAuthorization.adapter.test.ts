import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CedarAuthorizationAdapter } from '../cedar/cedarAuthorization.adapter';

const mockPolicyVersion = {
  findFirst: vi.fn(),
};

const mockCedarPolicies = {
  select: vi.fn(),
  from: vi.fn(),
};

const mockDb = {
  query: {
    policyVersion: mockPolicyVersion,
  },
  select: () => mockCedarPolicies,
};

vi.mock('../powersync/database', () => ({
  getDrizzleDB: () => mockDb,
}));

vi.mock('../../logic/permissions/cedarClientEvaluator', () => ({
  evaluateShape1: vi.fn(),
  evaluateShape2: vi.fn(),
}));

vi.mock('../../logic/permissions/localEvaluator', () => ({
  getLocalResourceAttributes: vi.fn().mockResolvedValue({}),
}));

const { evaluateShape1 } = await import('../../logic/permissions/cedarClientEvaluator');

describe('CedarAuthorizationAdapter', () => {
  let adapter: CedarAuthorizationAdapter;

  beforeEach(() => {
    adapter = new CedarAuthorizationAdapter();
    vi.clearAllMocks();

    mockCedarPolicies.select.mockReturnThis();
    mockCedarPolicies.from.mockResolvedValue([
      { id: 'p1', content: 'permit(principal, action, resource);' },
    ]);

    mockPolicyVersion.findFirst.mockResolvedValue({
      id: 'v1',
      hash: 'abc123hash',
      createdAt: new Date().toISOString(),
    });
  });

  describe('issueCapabilityToken', () => {
    it('issues a token when Cedar evaluation permits', async () => {
      vi.mocked(evaluateShape1).mockResolvedValue(true);

      const token = await adapter.issueCapabilityToken({
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
        deviceId: 'device-789',
      });

      expect(token.principalId).toBe('user-123');
      expect(token.tenantId).toBe('school-456');
      expect(token.operationContext).toBe('attendance:write');
      expect(token.deviceId).toBe('device-789');
      expect(token.policyVersionHash).toBe('abc123hash');
      expect(token.tokenId).toBeDefined();
      expect(token.issuedAt).toBeLessThanOrEqual(Date.now());
      expect(token.expiresAt).toBeGreaterThan(token.issuedAt);
      expect(token.expiresAt - token.issuedAt).toBe(60_000);
    });

    it('throws when Cedar evaluation denies', async () => {
      vi.mocked(evaluateShape1).mockResolvedValue(false);

      await expect(
        adapter.issueCapabilityToken({
          principalId: 'user-123',
          tenantId: 'school-456',
          operationContext: 'attendance:write',
        }),
      ).rejects.toThrow('Capability token denied');
    });

    it('throws when no local Cedar policies exist', async () => {
      mockCedarPolicies.from.mockResolvedValue([]);

      await expect(
        adapter.issueCapabilityToken({
          principalId: 'user-123',
          tenantId: 'school-456',
          operationContext: 'attendance:write',
        }),
      ).rejects.toThrow('no local Cedar policies');
    });

    it('uses "no_policy_version" hash when policy_version table is empty', async () => {
      mockPolicyVersion.findFirst.mockResolvedValue(null);
      vi.mocked(evaluateShape1).mockResolvedValue(true);

      const token = await adapter.issueCapabilityToken({
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
      });

      expect(token.policyVersionHash).toBe('no_policy_version');
    });

    it('uses default deviceId when none provided', async () => {
      vi.mocked(evaluateShape1).mockResolvedValue(true);

      const token = await adapter.issueCapabilityToken({
        principalId: 'user-123',
        tenantId: 'school-456',
        operationContext: 'attendance:write',
      });

      expect(token.deviceId).toBe('unknown');
    });
  });
});
