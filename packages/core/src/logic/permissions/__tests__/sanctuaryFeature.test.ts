import { describe, expect, it } from 'vitest';
import {
  CITIZENSHIP,
  meetsCitizenship,
  sanctuaryFeature,
  type SanctuaryEvaluationContext,
  type FeatureRequirement,
} from '../sanctuaryFeature';

describe('meetsCitizenship', () => {
  it('correctly maps access requirements', () => {
    // FIRST_CLASS (1) meets FIRST_CLASS (1), SECOND_CLASS (2), THIRD_CLASS (3)
    expect(meetsCitizenship(CITIZENSHIP.FIRST_CLASS, CITIZENSHIP.FIRST_CLASS)).toBe(true);
    expect(meetsCitizenship(CITIZENSHIP.FIRST_CLASS, CITIZENSHIP.SECOND_CLASS)).toBe(true);
    expect(meetsCitizenship(CITIZENSHIP.FIRST_CLASS, CITIZENSHIP.THIRD_CLASS)).toBe(true);

    // SECOND_CLASS (2) meets SECOND_CLASS (2), THIRD_CLASS (3) but NOT FIRST_CLASS (1)
    expect(meetsCitizenship(CITIZENSHIP.SECOND_CLASS, CITIZENSHIP.FIRST_CLASS)).toBe(false);
    expect(meetsCitizenship(CITIZENSHIP.SECOND_CLASS, CITIZENSHIP.SECOND_CLASS)).toBe(true);
    expect(meetsCitizenship(CITIZENSHIP.SECOND_CLASS, CITIZENSHIP.THIRD_CLASS)).toBe(true);

    // THIRD_CLASS (3) only meets THIRD_CLASS (3)
    expect(meetsCitizenship(CITIZENSHIP.THIRD_CLASS, CITIZENSHIP.FIRST_CLASS)).toBe(false);
    expect(meetsCitizenship(CITIZENSHIP.THIRD_CLASS, CITIZENSHIP.SECOND_CLASS)).toBe(false);
    expect(meetsCitizenship(CITIZENSHIP.THIRD_CLASS, CITIZENSHIP.THIRD_CLASS)).toBe(true);
  });
});

describe('sanctuaryFeature', () => {
  const baseCtx: SanctuaryEvaluationContext = {
    cedarSnapshotLoaded: true,
    entitlementManifestLoaded: true,
    citizenship: CITIZENSHIP.FIRST_CLASS,
    entitlement: {
      pricingTier: 'PRO',
      activeEntitlements: ['attendance', 'grades'],
      expirationDate: null,
    },
    cedarDecision: 'allow',
    flagActive: true,
    flagKey: 'attendance.manage',
    flagType: 'operational',
  };

  const baseReq: FeatureRequirement = {
    citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
    entitlementModule: 'attendance',
    entitlementTier: 'PRO',
    flagKey: 'attendance.manage',
  };

  it('permits access when all gates pass', () => {
    const res = sanctuaryFeature(baseCtx, baseReq);
    expect(res.permitted).toBe(true);
  });

  it('fails if not initialized', () => {
    expect(sanctuaryFeature({ ...baseCtx, cedarSnapshotLoaded: false }, baseReq)).toEqual({
      permitted: false,
      reason: 'not_initialized',
    });
    expect(sanctuaryFeature({ ...baseCtx, entitlementManifestLoaded: false }, baseReq)).toEqual({
      permitted: false,
      reason: 'not_initialized',
    });
  });

  it('fails citizenship gate when level is insufficient', () => {
    const res = sanctuaryFeature(
      { ...baseCtx, citizenship: CITIZENSHIP.THIRD_CLASS },
      { ...baseReq, citizenshipRequired: CITIZENSHIP.FIRST_CLASS },
    );
    expect(res).toEqual({
      permitted: false,
      reason: 'citizenship',
      required: CITIZENSHIP.FIRST_CLASS,
      current: CITIZENSHIP.THIRD_CLASS,
    });
  });

  it('fails entitlement gate when required module is missing', () => {
    const res = sanctuaryFeature(
      { ...baseCtx, entitlement: { ...baseCtx.entitlement, activeEntitlements: [] } },
      { ...baseReq, entitlementModule: 'attendance' },
    );
    expect(res).toEqual({
      permitted: false,
      reason: 'entitlement',
      required: 'PRO',
      current: 'PRO',
    });
  });

  it('fails authz gate when Cedar denies', () => {
    const res = sanctuaryFeature(
      { ...baseCtx, cedarDecision: 'deny', cedarPolicy: 'policy-1' },
      baseReq,
    );
    expect(res).toEqual({
      permitted: false,
      reason: 'authz',
      policy: 'policy-1',
    });
  });

  it('fails feature flag gate when flag is inactive', () => {
    const res = sanctuaryFeature(
      { ...baseCtx, flagActive: false },
      baseReq,
    );
    expect(res).toEqual({
      permitted: false,
      reason: 'feature',
      flagKey: 'attendance.manage',
      flagType: 'operational',
    });
  });
});
