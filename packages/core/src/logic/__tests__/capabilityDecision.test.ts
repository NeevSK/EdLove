import {
  type CapabilityDecisionReason,
  type CapabilityDecisionStatus,
  type CapabilityFeatureDefinition,
  type ResolveCapabilityDecisionInput,
  resolveCapabilityDecision,
} from '@repo/core/logic/capabilityDecision';
import { CITIZENSHIP } from '@repo/core/logic/registry/citizenship';
import { describe, expect, it } from 'vitest';

const feature: CapabilityFeatureDefinition = {
  id: 'self.inner-pulse',
  authorityRef: 'docs/current_progress/self.md#inner-pulse',
  evidenceRef: 'packages/self/src/features/inner-pulse.ts',
  lifecycleState: 'live',
  flagActive: true,
  supportedPlatforms: ['native', 'browser'],
  operations: ['read', 'create', 'update'],
  taskPolicy: 'floor',
  storagePolicy: 'cloud',
  citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
  requiresPrivacyConsent: false,
};

const input: ResolveCapabilityDecisionInput = {
  feature,
  identityMode: 'authenticated',
  authSubjectId: 'user-1',
  scope: { activeBondId: 'bond-1', tenantId: 'tenant-1', entityId: 'entity-1' },
  citizenship: CITIZENSHIP.FIRST_CLASS,
  entitlement: {
    readiness: 'verified',
    snapshot: { pricingTier: 'PRO', activeEntitlements: ['wellbeing'], expirationDate: null },
  },
  authorization: { readiness: 'ready', decision: { permitted: true } },
  platform: 'native',
  mode: 'account',
  privacy: { readiness: 'not_required' },
};

describe('resolveCapabilityDecision', () => {
  it('returns the declared operations and trace references for an available account feature', () => {
    expect(resolveCapabilityDecision(input)).toEqual({
      status: 'available',
      reason: 'available',
      allowedOperations: ['read', 'create', 'update'],
      taskPolicy: 'floor',
      storagePolicy: 'cloud',
      evidenceRef: 'packages/self/src/features/inner-pulse.ts',
      authorityRef: 'docs/current_progress/self.md#inner-pulse',
    });
  });

  it.each([
    [{ ...input, authorization: { readiness: 'loading' as const } }, 'authorization_loading'],
    [
      { ...input, entitlement: { ...input.entitlement, readiness: 'stale' as const } },
      'entitlement_loading',
    ],
    [{ ...input, privacy: { readiness: 'loading' as const } }, 'privacy_loading'],
  ])('returns loading while %s prerequisite is unresolved', (candidate, reason) => {
    expect(resolveCapabilityDecision(candidate).reason).toBe(reason);
    expect(resolveCapabilityDecision(candidate).status).toBe('loading');
    expect(resolveCapabilityDecision(candidate).allowedOperations).toEqual(['none']);
  });

  const staticGates: ReadonlyArray<
    readonly [ResolveCapabilityDecisionInput, CapabilityDecisionReason, CapabilityDecisionStatus]
  > = [
    [
      { ...input, feature: { ...feature, supportedPlatforms: ['browser'] } },
      'platform_unsupported',
      'unsupported',
    ],
    [
      { ...input, feature: { ...feature, lifecycleState: 'development' } },
      'feature_in_development',
      'coming_soon',
    ],
    [
      { ...input, feature: { ...feature, lifecycleState: 'deprecated' } },
      'feature_deprecated',
      'disabled',
    ],
    [{ ...input, feature: { ...feature, flagActive: false } }, 'feature_flag_disabled', 'disabled'],
  ];

  it.each(staticGates)('returns stable static gate result for %s', (candidate, reason, status) => {
    const result = resolveCapabilityDecision(candidate);
    expect(result).toMatchObject({ reason, status, allowedOperations: ['none'] });
  });

  it('locks account mode without an authenticated subject', () => {
    expect(
      resolveCapabilityDecision({ ...input, identityMode: 'unauthenticated', authSubjectId: null }),
    ).toMatchObject({ status: 'locked', reason: 'identity_required', allowedOperations: ['none'] });
  });

  it('locks a feature until its declared active scope is available', () => {
    expect(
      resolveCapabilityDecision({
        ...input,
        feature: { ...feature, scopeRequirement: 'active_bond' },
        scope: { tenantId: 'tenant-1' },
      }),
    ).toMatchObject({ status: 'locked', reason: 'scope_required', allowedOperations: ['none'] });
  });

  it.each([
    ['sandbox', 'authenticated'],
    ['demo', 'authenticated'],
  ] as const)('rejects an incompatible %s identity mode', (mode, identityMode) => {
    expect(resolveCapabilityDecision({ ...input, mode, identityMode })).toMatchObject({
      status: 'unsupported',
      reason: 'mode_identity_mismatch',
    });
  });

  const accessGates: ReadonlyArray<
    readonly [ResolveCapabilityDecisionInput, CapabilityDecisionStatus, CapabilityDecisionReason]
  > = [
    [
      {
        ...input,
        citizenship: CITIZENSHIP.THIRD_CLASS,
        feature: { ...feature, citizenshipRequired: CITIZENSHIP.FIRST_CLASS },
      },
      'locked',
      'citizenship_insufficient',
    ],
    [
      { ...input, authorization: { readiness: 'ready' as const, decision: { permitted: false } } },
      'locked',
      'authorization_denied',
    ],
    [
      { ...input, feature: { ...feature, entitlement: { tierAtLeast: 'INSTITUTIONAL' } } },
      'upgrade_required',
      'entitlement_required',
    ],
  ];

  it.each(accessGates)('applies access gate %s', (candidate, status, reason) => {
    expect(resolveCapabilityDecision(candidate)).toMatchObject({
      status,
      reason,
      allowedOperations: ['none'],
    });
  });

  it('requires an explicit ready privacy decision for sensitive data', () => {
    const sensitive = { ...feature, requiresPrivacyConsent: true };

    expect(resolveCapabilityDecision({ ...input, feature: sensitive })).toMatchObject({
      status: 'locked',
      reason: 'privacy_contract_missing',
    });
    expect(
      resolveCapabilityDecision({ ...input, feature: sensitive, privacy: { readiness: 'denied' } }),
    ).toMatchObject({ status: 'locked', reason: 'privacy_consent_required' });
    expect(
      resolveCapabilityDecision({ ...input, feature: sensitive, privacy: { readiness: 'ready' } }),
    ).toMatchObject({ status: 'available', reason: 'available' });
  });

  it.each(['explore', 'sandbox', 'demo'] as const)(
    'enforces local-only storage for %s mode even when the feature is cloud-backed',
    (mode) => {
      const modeInput =
        mode === 'sandbox'
          ? { ...input, mode, identityMode: 'sandbox' as const }
          : mode === 'demo'
            ? { ...input, mode, identityMode: 'demo' as const }
            : { ...input, mode, identityMode: 'anonymous' as const, authSubjectId: null };
      const result = resolveCapabilityDecision(modeInput);

      expect(result.storagePolicy).toBe('local-only');
      expect(result.allowedOperations).toEqual(feature.operations);
      expect(result.status).toBe(mode === 'demo' ? 'demo_only' : 'available');
    },
  );

  it('preserves an intentional no-storage policy in every local-only mode', () => {
    expect(
      resolveCapabilityDecision({
        ...input,
        feature: { ...feature, storagePolicy: 'none' },
        mode: 'explore',
        identityMode: 'anonymous',
        authSubjectId: null,
      }).storagePolicy,
    ).toBe('none');
  });
});
