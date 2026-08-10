import { describe, expect, it, vi } from 'vitest';
import { CedarAuthorizationAdapter } from '../cedar/cedarAuthorization.adapter';
import { SupabaseEntitlementAdapter } from '../supabase/supabaseEntitlement.adapter';

// Mock cedarClientEvaluator
import { evaluateShape2 as mockEvaluateShape2 } from '../../logic/permissions/cedarClientEvaluator';
vi.mock('../../logic/permissions/cedarClientEvaluator', () => ({
  evaluateShape2: vi.fn(async () => true),
}));

// Mock getLocalResourceAttributes
vi.mock('../../logic/permissions/localEvaluator', () => ({
  getLocalResourceAttributes: vi.fn(async () => ({})),
}));

// Mock useFeatureStore store
const mockSubscribe = vi.fn();
vi.mock('../../store/useFeatureStore', () => ({
  useFeatureStore: {
    getState: () => ({
      flags: { isAIAssistantEnabled: true },
      recomputeFlags: vi.fn(),
    }),
    subscribe: (callback: any) => {
      mockSubscribe(callback);
      return () => {};
    },
  },
}));

// Mock Supabase client
vi.mock('../../api/supabase', () => ({
  supabaseClient: {
    from: (table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: (col: string, val: string) => ({
              maybeSingle: async () => {
                if (val === 'user-1') {
                  return { data: { pricing_tier: 'PRO' }, error: null };
                }
                return { data: null, error: null };
              },
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ limit: () => [] }) }) };
    },
  },
}));

// Drizzle DB mock: from() returns a thenable for await, plus .where() chain for pricingManifest
const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));

const POLICIES_RESULT = [
  { id: '1', content: 'permit(principal, action, resource);' },
];
const mockFrom = vi.fn(() => {
  const chain = { where: mockWhere };
  // Make the chain thenable so await resolves to the policies array
  (chain as any).then = (resolve: any) => resolve(POLICIES_RESULT);
  return chain;
});
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock('../powersync/database', () => ({
  getDrizzleDB: () => ({ select: mockSelect }),
}));

// Mock useAuthStore store (still needed by other adapters)
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: { id: 'user-1', pricing_tier: 'PRO', features: ['ai_chat'] },
    }),
    subscribe: (callback: any) => {
      return () => {};
    },
  },
}));

describe('Hexagonal Adapters Verification', () => {
  it('verifies CedarAuthorizationAdapter compiles and calls evaluateShape2', async () => {
    const adapter = new CedarAuthorizationAdapter();
    const res = await adapter.isAuthorized({
      principalId: 'user-1',
      action: 'read',
      resourceType: 'Classroom',
      resourceId: 'class-1',
    });

    expect(res.permitted).toBe(true);
    expect(res.reason).toBe('CedarPolicyEvaluation');
  });

  it('verifies SupabaseEntitlementAdapter compiles and resolves user entitlements from DB', async () => {
    mockLimit.mockResolvedValue([{ features: JSON.stringify(['ai_chat']), tier: 'PRO' }]);
    const adapter = new SupabaseEntitlementAdapter();

    const res = await adapter.getEntitlements('user-1');
    expect(res.pricingTier).toBe('PRO');
    expect(res.activeEntitlements).toContain('ai_chat');

    // Second call: unknown user, FREE tier, pricing_manifest returns nothing for FREE
    mockLimit.mockResolvedValue([]);
    const res2 = await adapter.getEntitlements('non-matching-user');
    expect(res2.pricingTier).toBe('FREE');
    expect(res2.activeEntitlements).toEqual([]);
  });
});
