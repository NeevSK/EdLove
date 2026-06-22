import { describe, expect, it, vi } from 'vitest';
import type { UserContext } from '../../logic/schemas/user.schema';
import { CedarAuthorizationAdapter } from '../cedar/cedarAuthorization.adapter';
import { SupabaseEntitlementAdapter } from '../supabase/supabaseEntitlement.adapter';
import { SupabaseFeatureFlagAdapter } from '../supabase/supabaseFeatureFlag.adapter';

// Mock checkLocalPermission
vi.mock('../../logic/permissions/localEvaluator', () => ({
  checkLocalPermission: vi.fn(async () => true),
}));

// Mock feature-engine resolving feature flags
vi.mock('../../logic/permissions/feature-engine', () => ({
  resolveFeatureFlags: vi.fn(() => ({ isAIAssistantEnabled: true })),
  trackFeatureExposureInternal: vi.fn(),
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

// Mock useAuthStore store
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
  it('verifies CedarAuthorizationAdapter compiles and calls checkLocalPermission', async () => {
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

  it('verifies SupabaseFeatureFlagAdapter compiles and queries Zustand flags', async () => {
    const adapter = new SupabaseFeatureFlagAdapter();
    const context = { userId: 'user-1' } as unknown as UserContext;

    const snapshot = await adapter.resolveFlags(context);
    expect(snapshot.flags.isAIAssistantEnabled).toBe(true);

    const unsubscribe = adapter.subscribeToFlagChanges(context, (updated) => {
      expect(updated.flags.isAIAssistantEnabled).toBe(true);
    });

    unsubscribe();
  });

  it('verifies SupabaseEntitlementAdapter compiles and resolves user entitlements', async () => {
    const adapter = new SupabaseEntitlementAdapter();
    const res = await adapter.getEntitlements('user-1');
    expect(res.pricingTier).toBe('PRO');
    expect(res.activeEntitlements).toContain('ai_chat');

    const res2 = await adapter.getEntitlements('non-matching-user');
    expect(res2.pricingTier).toBe('FREE');
  });
});
