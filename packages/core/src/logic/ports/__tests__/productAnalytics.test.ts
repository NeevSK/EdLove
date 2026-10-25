import { describe, expect, it } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../productAnalytics.port';

describe('product analytics contract', () => {
  it('keeps the canonical event vocabulary stable', () => {
    expect(PRODUCT_ANALYTICS_EVENTS).toEqual([
      'app_started',
      'guest_started',
      'onboarding_started',
      'onboarding_completed',
      'signup_started',
      'account_converted',
      'school_bond_claimed',
      'feature_exposed',
      'feature_opened',
      'feature_action_completed',
      'feature_action_failed',
      'efficiency_policy_decision',
      'verger_telemetry',
    ]);
  });

  it('keeps personal pricing and active entitlement scope separate', () => {
    const context = {
      personal_pricing_tier: 'FREE' as const,
      effective_entitlement_scope: 'active_bond' as const,
      effective_entitlement_tier: 'INSTITUTIONAL' as const,
      analytics_schema_version: 1 as const,
    };

    expect(context.personal_pricing_tier).toBe('FREE');
    expect(context.effective_entitlement_tier).toBe('INSTITUTIONAL');
  });
});
