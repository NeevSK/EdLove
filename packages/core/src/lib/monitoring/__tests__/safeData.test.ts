import { sanitizeTelemetryData } from '@repo/core/monitoring';

describe('sanitizeTelemetryData', () => {
  it('keeps intentional scalar dimensions', () => {
    expect(sanitizeTelemetryData({ platform: 'ios', capacity: 'teacher', enabled: true })).toEqual({
      platform: 'ios',
      capacity: 'teacher',
      enabled: true,
    });
  });

  it('drops identity, educational identifiers, and nested payloads', () => {
    expect(
      sanitizeTelemetryData({
        user_id: 'user-1',
        email: 'teacher@example.com',
        school_id: 'school-1',
        assignment_id: 'assignment-1',
        metadata: { raw: 'record' },
        feature_name: 'library',
      }),
    ).toEqual({ feature_name: 'library' });
  });

  it('keeps approved comparison dimensions without allowing identifiers', () => {
    expect(
      sanitizeTelemetryData({
        active_capacity: 'teacher',
        school_type: 'secondary',
        personal_pricing_tier: 'FREE',
        effective_entitlement_scope: 'active_bond',
        effective_entitlement_tier: 'INSTITUTIONAL',
        classroom_id: 'must-drop',
      }),
    ).toEqual({
      active_capacity: 'teacher',
      school_type: 'secondary',
      personal_pricing_tier: 'FREE',
      effective_entitlement_scope: 'active_bond',
      effective_entitlement_tier: 'INSTITUTIONAL',
    });
  });

  it('bounds each real-user telemetry payload by property count and serialized size', () => {
    const input = {
      oversized: 'x'.repeat(121),
      nonFinite: Number.POSITIVE_INFINITY,
      ...Object.fromEntries(Array.from({ length: 80 }, (_, index) => [`dimension_${index}`, 'ok'])),
    };

    const safe = sanitizeTelemetryData(input);

    expect(safe.oversized).toBeUndefined();
    expect(safe.nonFinite).toBeUndefined();
    expect(Object.keys(safe)).toHaveLength(32);

    const large = sanitizeTelemetryData(
      Object.fromEntries(
        Array.from({ length: 80 }, (_, index) => [`dimension_${index}`, 'x'.repeat(120)]),
      ),
    );
    expect(Object.keys(large).length).toBeLessThanOrEqual(32);
    expect(JSON.stringify(large).length).toBeLessThanOrEqual(4096);
  });
});
